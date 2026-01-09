from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import random
from ..database import get_db
from ..models import User, OTP
from ..schemas import UserCreate, UserUpdate, User as UserSchema, Token, OTPRequest, OTPVerify
from ..auth import verify_password, get_password_hash, create_access_token, get_current_user
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserSchema)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        phone=user.phone
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserSchema)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserSchema)
def update_profile(user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    update_data = user_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user


# OTP Login Endpoints
def send_sms_otp(phone: str, otp_code: str) -> bool:
    """Send OTP via Twilio SMS"""
    if not all([settings.twilio_account_sid, settings.twilio_auth_token, settings.twilio_phone_number]):
        print(f"Twilio not configured. OTP for {phone}: {otp_code}")
        return False
    
    try:
        from twilio.rest import Client
        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        
        message = client.messages.create(
            body=f"Your PureGlow verification code is: {otp_code}. Valid for 5 minutes.",
            from_=settings.twilio_phone_number,
            to=phone
        )
        print(f"SMS sent to {phone}, SID: {message.sid}")
        return True
    except Exception as e:
        print(f"Failed to send SMS: {e}")
        return False

@router.post("/send-otp")
def send_otp(otp_request: OTPRequest, db: Session = Depends(get_db)):
    # Check if phone exists in database
    user = db.query(User).filter(User.phone == otp_request.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="Phone number not registered")
    
    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    
    # Delete any existing OTPs for this phone
    db.query(OTP).filter(OTP.phone == otp_request.phone).delete()
    
    # Create new OTP (expires in 5 minutes)
    new_otp = OTP(
        phone=otp_request.phone,
        otp_code=otp_code,
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    )
    db.add(new_otp)
    db.commit()
    
    # Send SMS via Twilio
    sms_sent = send_sms_otp(otp_request.phone, otp_code)
    
    response = {
        "message": "OTP sent successfully" if sms_sent else "OTP generated (SMS not configured)",
        "phone": otp_request.phone,
    }
    
    # Only include debug OTP if Twilio is not configured (for testing)
    if not sms_sent:
        response["otp_debug"] = otp_code
    
    return response

@router.post("/verify-otp", response_model=Token)
def verify_otp(otp_verify: OTPVerify, db: Session = Depends(get_db)):
    # Find the OTP
    otp_record = db.query(OTP).filter(
        OTP.phone == otp_verify.phone,
        OTP.otp_code == otp_verify.otp,
        OTP.is_used == False
    ).first()
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Check if OTP is expired
    if datetime.utcnow() > otp_record.expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired")
    
    # Mark OTP as used
    otp_record.is_used = True
    db.commit()
    
    # Find user and generate token
    user = db.query(User).filter(User.phone == otp_verify.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
