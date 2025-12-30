from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import WishlistItem, Product, User
from ..schemas import WishlistItem as WishlistItemSchema, WishlistItemCreate
from ..auth import get_current_user

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])

@router.get("/", response_model=List[WishlistItemSchema])
def get_wishlist(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(WishlistItem).filter(WishlistItem.user_id == user.id).all()

@router.post("/", response_model=WishlistItemSchema)
def add_to_wishlist(
    item: WishlistItemCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == user.id,
        WishlistItem.product_id == item.product_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Product already in wishlist")
    
    wishlist_item = WishlistItem(user_id=user.id, product_id=item.product_id)
    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)
    return wishlist_item

@router.delete("/{product_id}")
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    item = db.query(WishlistItem).filter(
        WishlistItem.user_id == user.id,
        WishlistItem.product_id == product_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not in wishlist")
    
    db.delete(item)
    db.commit()
    return {"message": "Removed from wishlist"}
