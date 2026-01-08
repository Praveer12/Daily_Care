from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Handle different PostgreSQL URL formats
database_url = settings.database_url
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
elif database_url.startswith("cockroachdb://"):
    database_url = database_url.replace("cockroachdb://", "postgresql+psycopg2://", 1)

# Fix SSL mode for CockroachDB on Render (use system certs)
if "sslmode=verify-full" in database_url:
    database_url = database_url.replace("sslmode=verify-full", "sslmode=require")

engine = create_engine(database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
