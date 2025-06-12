from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv
import os


load_dotenv()

from config import get_sync_engine
from models import Base


config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is required for migrations")
    
    if "postgresql+asyncpg://" in database_url:
        database_url = database_url.replace("postgresql+asyncpg://", "postgresql://")
    
    context.configure(
        url=database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=True,
        include_object=include_object,
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""

    connectable = get_sync_engine()

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_schemas=True,
            include_object=include_object
        )

        with context.begin_transaction():
            context.run_migrations()

def include_object(object, name, type_, reflected, compare_to):
    supabase_schemas = {'auth', 'storage', 'realtime', 'vault', 'supabase_functions', 'extensions', 'graphql', 'graphql_public', 'pgsodium', 'pgsodium_masks'}
    
    if hasattr(object, 'schema') and object.schema in supabase_schemas:
        return False
    
    supabase_tables = {'schema_migrations', 'supabase_migrations'}
    if type_ == "table" and name in supabase_tables:
        return False
    
    return True

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
