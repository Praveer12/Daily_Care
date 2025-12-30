from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    image: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    slug: str
    description: str
    price: float
    original_price: Optional[float] = None
    image: str
    images: List[str] = []
    category_id: int
    product_type: str
    stock: int = 0
    is_new: bool = False
    is_bestseller: bool = False
    ingredients: List[str] = []
    benefits: List[str] = []

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    category_id: Optional[int] = None
    product_type: Optional[str] = None
    stock: Optional[int] = None
    is_new: Optional[bool] = None
    is_bestseller: Optional[bool] = None
    is_active: Optional[bool] = None
    ingredients: Optional[List[str]] = None
    benefits: Optional[List[str]] = None

class Product(ProductBase):
    id: int
    rating: float
    reviews_count: int
    is_active: bool
    created_at: datetime
    category: Optional[Category] = None

    class Config:
        from_attributes = True

# Cart Schemas
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class CartItem(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: Product

    class Config:
        from_attributes = True

# Wishlist Schemas
class WishlistItemCreate(BaseModel):
    product_id: int

class WishlistItem(BaseModel):
    id: int
    product_id: int
    product: Product

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: dict
    payment_method: str

class OrderItem(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: Product

    class Config:
        from_attributes = True

class Order(BaseModel):
    id: int
    user_id: int
    status: str
    total_amount: float
    shipping_address: dict
    payment_method: str
    payment_status: str
    created_at: datetime
    items: List[OrderItem]

    class Config:
        from_attributes = True
