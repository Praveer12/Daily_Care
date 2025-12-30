from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import CartItem, Product, User
from ..schemas import CartItem as CartItemSchema, CartItemCreate
from ..auth import get_current_user

router = APIRouter(prefix="/api/cart", tags=["Cart"])

@router.get("/", response_model=List[CartItemSchema])
def get_cart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(CartItem).filter(CartItem.user_id == user.id).all()

@router.post("/", response_model=CartItemSchema)
def add_to_cart(
    item: CartItemCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    existing = db.query(CartItem).filter(
        CartItem.user_id == user.id,
        CartItem.product_id == item.product_id
    ).first()
    
    if existing:
        existing.quantity += item.quantity
        db.commit()
        db.refresh(existing)
        return existing
    
    cart_item = CartItem(user_id=user.id, product_id=item.product_id, quantity=item.quantity)
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item

@router.put("/{item_id}", response_model=CartItemSchema)
def update_cart_item(
    item_id: int,
    quantity: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if quantity <= 0:
        db.delete(cart_item)
        db.commit()
        return {"message": "Item removed from cart"}
    
    cart_item.quantity = quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item

@router.delete("/{item_id}")
def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    return {"message": "Removed from cart"}

@router.delete("/")
def clear_cart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.query(CartItem).filter(CartItem.user_id == user.id).delete()
    db.commit()
    return {"message": "Cart cleared"}
