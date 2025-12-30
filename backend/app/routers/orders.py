from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Order, OrderItem, Product, CartItem, User
from ..schemas import Order as OrderSchema, OrderCreate
from ..auth import get_current_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.get("/", response_model=List[OrderSchema])
def get_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=OrderSchema)
def get_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/", response_model=OrderSchema)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    total = 0
    order_items = []
    
    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        
        total += product.price * item.quantity
        order_items.append({"product": product, "quantity": item.quantity, "price": product.price})
    
    # Add GST 18%
    total_with_gst = total * 1.18
    
    order = Order(
        user_id=user.id,
        total_amount=total_with_gst,
        shipping_address=order_data.shipping_address,
        payment_method=order_data.payment_method
    )
    db.add(order)
    db.commit()
    
    for item_data in order_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            price=item_data["price"]
        )
        db.add(order_item)
        item_data["product"].stock -= item_data["quantity"]
    
    # Clear cart
    db.query(CartItem).filter(CartItem.user_id == user.id).delete()
    db.commit()
    db.refresh(order)
    return order
