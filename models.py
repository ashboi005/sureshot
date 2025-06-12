from sqlalchemy import (
    Boolean, 
    String, 
    Text, 
    DateTime, 
    SmallInteger,
    CheckConstraint,
    PrimaryKeyConstraint,
    UniqueConstraint,
    Index,
    Computed,
    text,
    ForeignKey,
    Column
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.declarative import declarative_base
from typing import Optional
import uuid

Base = declarative_base()


class Users(Base):
    """
    Supabase auth.users table schema
    This mirrors the Supabase authentication table to enable proper foreign key relationships
    """
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "email_change_confirm_status >= 0 AND email_change_confirm_status <= 2",
            name="users_email_change_confirm_status_check",
        ),
        PrimaryKeyConstraint("id", name="users_pkey"),
        UniqueConstraint("phone", name="users_phone_key"),
        Index("confirmation_token_idx", "confirmation_token", unique=True),
        Index(
            "email_change_token_current_idx", "email_change_token_current", unique=True
        ),
        Index("email_change_token_new_idx", "email_change_token_new", unique=True),
        Index("reauthentication_token_idx", "reauthentication_token", unique=True),
        Index("recovery_token_idx", "recovery_token", unique=True),
        Index("users_email_partial_key", "email", unique=True),
        Index("users_instance_id_email_idx", "instance_id"),
        Index("users_instance_id_idx", "instance_id"),
        Index("users_is_anonymous_idx", "is_anonymous"),
        {
            "comment": "Auth: Stores user login data within a secure schema.",
            "schema": "auth",
        },
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    
    is_sso_user: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("false"),
        comment="Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.",
    )
    is_anonymous: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    instance_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True))
    aud: Mapped[Optional[str]] = mapped_column(String(255))
    role: Mapped[Optional[str]] = mapped_column(String(255))
    
    email: Mapped[Optional[str]] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(Text, server_default=text("NULL::character varying"))
    
    encrypted_password: Mapped[Optional[str]] = mapped_column(String(255))
    
    email_confirmed_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    confirmation_token: Mapped[Optional[str]] = mapped_column(String(255))
    confirmation_sent_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    
    recovery_token: Mapped[Optional[str]] = mapped_column(String(255))
    recovery_sent_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    
    email_change_token_new: Mapped[Optional[str]] = mapped_column(String(255))
    email_change: Mapped[Optional[str]] = mapped_column(String(255))
    email_change_sent_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    email_change_token_current: Mapped[Optional[str]] = mapped_column(
        String(255), server_default=text("''::character varying")
    )
    email_change_confirm_status: Mapped[Optional[int]] = mapped_column(SmallInteger, server_default=text("0"))
    
    phone_confirmed_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    phone_change: Mapped[Optional[str]] = mapped_column(Text, server_default=text("''::character varying"))
    phone_change_token: Mapped[Optional[str]] = mapped_column(
        String(255), server_default=text("''::character varying")
    )
    phone_change_sent_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    
    last_sign_in_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    invited_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    
    raw_app_meta_data: Mapped[Optional[dict]] = mapped_column(JSONB)
    raw_user_meta_data: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    is_super_admin: Mapped[Optional[bool]] = mapped_column(Boolean)
    banned_until: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    
    reauthentication_token: Mapped[Optional[str]] = mapped_column(
        String(255), server_default=text("''::character varying")
    )
    reauthentication_sent_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    
    created_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    updated_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    deleted_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    
    confirmed_at: Mapped[Optional[DateTime]] = mapped_column(
        DateTime(True),
        Computed("LEAST(email_confirmed_at, phone_confirmed_at)", persisted=True),
    )

    user_profile: Mapped[Optional["UserProfile"]] = relationship(
        "UserProfile", 
        back_populates="user", 
        uselist=False,
        cascade="all, delete-orphan"
    )


class UserProfile(Base):
    """
    Custom user profile table for additional user information
    This extends the basic auth.users table with application-specific data
    """
    __tablename__ = "user_profiles"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )
    
    username: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True)
    first_name: Mapped[Optional[str]] = mapped_column(String(100))
    last_name: Mapped[Optional[str]] = mapped_column(String(100))
    display_name: Mapped[Optional[str]] = mapped_column(String(100))
    bio: Mapped[Optional[str]] = mapped_column(Text)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    date_of_birth: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    timezone: Mapped[Optional[str]] = mapped_column(String(50))
    language: Mapped[Optional[str]] = mapped_column(String(10), default="en")
    
    preferences: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(True), 
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(True), 
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
        nullable=False
    )
    
    user: Mapped["Users"] = relationship("Users", back_populates="user_profile")
    
