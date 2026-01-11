from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, products, categories, cart, wishlist, orders, admin, upload

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Daily Care Store API",
    description="Backend API for Daily Care Store",
    version="1.0.0"
)

# CORS middleware - Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(cart.router)
app.include_router(wishlist.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(upload.router)

@app.get("/")
def root():
    return {"message": "Daily Care Store API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
