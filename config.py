import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from models import Base, UserProfile
from supabase import create_client, Client

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30
JWT_REFRESH_TOKEN_EXPIRE_DAYS = 7


_supabase_client = None
_supabase_admin_client = None

def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_ANON_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables")
        
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    return _supabase_client

def get_supabase_admin_client() -> Client:
    global _supabase_admin_client
    if _supabase_admin_client is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables")
        
        _supabase_admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    return _supabase_admin_client

def get_supabase_storage():
    """Get Supabase storage client for file operations"""
    client = get_supabase_admin_client()
    return client.storage

if DATABASE_URL:
    sync_engine = create_engine(DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://"))
    
    asyncpg_url = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    
    if "?" in asyncpg_url:
        base_url = asyncpg_url.split("?")[0]
    else:
        base_url = asyncpg_url
    
    asyncpg_url = f"{base_url}?prepared_statement_cache_size=0"
    
    async_engine = create_async_engine(
        asyncpg_url,
        echo=False,
        pool_pre_ping=False, 
        pool_size=5,
        max_overflow=0
    )

    AsyncSessionLocal = sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
else:
    sync_engine = None
    async_engine = None
    AsyncSessionLocal = None

async def get_db():
    if AsyncSessionLocal is None:
        raise Exception("Database not configured")
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    if async_engine is None:
        raise Exception("Database not configured")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

def get_sync_engine():
    if sync_engine is None:
        raise Exception("Database not configured")
    return sync_engine

ENVIRONMENT = os.getenv("ENVIRONMENT", "dev")
DEBUG = ENVIRONMENT == "dev"
