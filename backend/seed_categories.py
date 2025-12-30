"""
Run this script to seed initial categories into the database.
Usage: python seed_categories.py
"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal, engine, Base
from app.models import Category

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Initial categories for a daily care store
categories = [
    {"name": "Skincare", "slug": "skincare", "description": "Face care products including cleansers, moisturizers, and treatments", "icon": "✨"},
    {"name": "Haircare", "slug": "haircare", "description": "Hair care products including shampoos, conditioners, and treatments", "icon": "💇"},
    {"name": "Bodycare", "slug": "bodycare", "description": "Body care products including lotions, scrubs, and oils", "icon": "🧴"},
    {"name": "Wellness", "slug": "wellness", "description": "Health and wellness supplements and products", "icon": "💊"},
    {"name": "Makeup", "slug": "makeup", "description": "Cosmetics and makeup products", "icon": "💄"},
    {"name": "Fragrance", "slug": "fragrance", "description": "Perfumes and body mists", "icon": "🌸"},
]

def seed_categories():
    db = SessionLocal()
    try:
        for cat_data in categories:
            existing = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if not existing:
                category = Category(**cat_data)
                db.add(category)
                print(f"Added category: {cat_data['name']}")
            else:
                print(f"Category already exists: {cat_data['name']}")
        
        db.commit()
        print("\n✅ Categories seeded successfully!")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_categories()
