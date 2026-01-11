from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from ..auth import get_current_admin
from ..config import settings
from ..models import User

router = APIRouter(prefix="/api/upload", tags=["Upload"])

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin)
):
    """Upload image to Cloudinary and return URL"""
    
    # Check if Cloudinary is configured
    if not all([settings.cloudinary_cloud_name, settings.cloudinary_api_key, settings.cloudinary_api_secret]):
        raise HTTPException(status_code=500, detail="Cloudinary not configured")
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPEG, PNG, WebP, GIF")
    
    # Max file size: 5MB
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max size: 5MB")
    
    try:
        import cloudinary
        import cloudinary.uploader
        
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret
        )
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder="pureglow-products",
            resource_type="image"
        )
        
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
