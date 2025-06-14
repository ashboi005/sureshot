"""add account_type and missing fields

Revision ID: 001_add_account_type
Revises: 5a1efa5aecf4
Create Date: 2025-06-13 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_add_account_type'
down_revision: Union[str, None] = '5a1efa5aecf4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the AccountType enum
    account_type_enum = postgresql.ENUM('USER', 'ADMIN', 'WORKER', 'DOCTOR', name='accounttype')
    account_type_enum.create(op.get_bind())
    
    # Add the account_type column
    op.add_column('user_profiles', sa.Column('account_type', account_type_enum, nullable=False, server_default='USER'))


def downgrade() -> None:
    # Remove the account_type column
    op.drop_column('user_profiles', 'account_type')
    
    # Drop the AccountType enum
    account_type_enum = postgresql.ENUM('USER', 'ADMIN', 'WORKER', 'DOCTOR', name='accounttype')
    account_type_enum.drop(op.get_bind())