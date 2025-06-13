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
    Column,
    Enum as SQLAlchemyEnum
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship, foreign, remote
from sqlalchemy.ext.declarative import declarative_base
from typing import Optional, List
import uuid
import enum

Base = declarative_base()


class AccountType(enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    WORKER = "WORKER"
    DOCTOR = "DOCTOR"


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
    
    worker_details: Mapped[Optional["WorkerDetails"]] = relationship(
        "WorkerDetails", 
        back_populates="user", 
        uselist=False,
        cascade="all, delete-orphan"
    )
    
    doctor_details: Mapped[Optional["DoctorDetails"]] = relationship(
        "DoctorDetails", 
        back_populates="user", 
        uselist=False,
        cascade="all, delete-orphan"
    )


class UserProfile(Base):
    """
    User profile table for baby vaccination tracking
    Each profile represents a baby managed by their parent/guardian
    """
    __tablename__ = "user_profiles"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False    )
    
    # User account information
    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    first_name: Mapped[Optional[str]] = mapped_column(String(100))
    last_name: Mapped[Optional[str]] = mapped_column(String(100))
    display_name: Mapped[Optional[str]] = mapped_column(String(100))
    bio: Mapped[Optional[str]] = mapped_column(Text)
    date_of_birth: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    timezone: Mapped[Optional[str]] = mapped_column(String(50))
    language: Mapped[Optional[str]] = mapped_column(String(10))
    preferences: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    # Baby information
    baby_name: Mapped[Optional[str]] = mapped_column(String(100))
    baby_date_of_birth: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    gender: Mapped[Optional[str]] = mapped_column(String(10))
    blood_group: Mapped[Optional[str]] = mapped_column(String(10))
    
    # Parent/Guardian information
    parent_name: Mapped[Optional[str]] = mapped_column(String(100))
    parent_mobile: Mapped[Optional[str]] = mapped_column(String(20))
    parent_email: Mapped[Optional[str]] = mapped_column(String(255))      # Address information
    address: Mapped[Optional[str]] = mapped_column(Text)
    city: Mapped[Optional[str]] = mapped_column(String(100))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    pin_code: Mapped[Optional[str]] = mapped_column(String(10))
    
    # Profile image
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    account_type: Mapped[AccountType] = mapped_column(
        SQLAlchemyEnum(AccountType, name='accounttype', native_enum=True),
        nullable=False, 
        default=AccountType.USER,
        server_default=AccountType.USER.value
    )
    
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
    )    # Relationships
    user: Mapped["Users"] = relationship("Users", back_populates="user_profile")
    vaccination_records: Mapped[List["VaccinationRecord"]] = relationship(
        "VaccinationRecord", 
        primaryjoin="UserProfile.user_id == VaccinationRecord.user_id",
        foreign_keys="[VaccinationRecord.user_id]",
        viewonly=True
    )
    doctor_relationships: Mapped[List["DoctorPatientRelationship"]] = relationship(
        "DoctorPatientRelationship", 
        primaryjoin="UserProfile.user_id == DoctorPatientRelationship.user_id",
        foreign_keys="[DoctorPatientRelationship.user_id]",
        viewonly=True
    )


class WorkerDetails(Base):
    """
    Worker details table for healthcare workers who perform vaccinations
    """
    __tablename__ = "worker_details"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )
      # Required city for worker
    city_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    
    # Professional credentials
    government_id_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Additional details
    specialization: Mapped[Optional[str]] = mapped_column(String(100))
    experience_years: Mapped[Optional[int]] = mapped_column()
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
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
      # Relationships
    user: Mapped["Users"] = relationship("Users", back_populates="worker_details")
    
    # Many-to-many relationship with vaccination drives through assignments
    vaccination_drives: Mapped[List["VaccinationDrive"]] = relationship(
        "VaccinationDrive",
        secondary="drive_worker_assignments",
        back_populates="assigned_workers",
        lazy="selectin"
    )


class DoctorDetails(Base):
    """
    Doctor details table for medical professionals who oversee vaccination programs
    """
    __tablename__ = "doctor_details"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )
      # Professional credentials
    medical_council_registration_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Professional details
    specialization: Mapped[Optional[str]] = mapped_column(String(100))
    hospital_affiliation: Mapped[Optional[str]] = mapped_column(String(200))
    experience_years: Mapped[Optional[int]] = mapped_column()
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
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
    )      # Relationships
    user: Mapped["Users"] = relationship("Users", back_populates="doctor_details")
    vaccination_records: Mapped[List["VaccinationRecord"]] = relationship(
        "VaccinationRecord", 
        back_populates="doctor",
        cascade="all, delete-orphan"
    )
    patient_relationships: Mapped[List["DoctorPatientRelationship"]] = relationship(
        "DoctorPatientRelationship", 
        back_populates="doctor",
        cascade="all, delete-orphan"
    )


class VaccinationDrive(Base):
    """
    Vaccination drive table for organizing vaccination campaigns
    """
    __tablename__ = "vaccination_drives"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
      # Drive details
    vaccination_name: Mapped[str] = mapped_column(String(200), nullable=False)
    start_date: Mapped[DateTime] = mapped_column(DateTime(True), nullable=False)
    end_date: Mapped[DateTime] = mapped_column(DateTime(True), nullable=False)
    vaccination_city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    
    # Optional details
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Admin who created the drive
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("auth.users.id"),
        nullable=False
    )
    
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
      # Relationships
    admin: Mapped["Users"] = relationship("Users", foreign_keys=[created_by])
    assigned_workers: Mapped[List["WorkerDetails"]] = relationship(
        "WorkerDetails", 
        secondary="drive_worker_assignments",
        back_populates="vaccination_drives",
        lazy="selectin"
    )
    participants: Mapped[List["DriveParticipant"]] = relationship(
        "DriveParticipant",
        back_populates="vaccination_drive",
        cascade="all, delete-orphan"
    )


# Association table for many-to-many relationship between drives and workers
class DriveWorkerAssignment(Base):
    """
    Association table for assigning workers to vaccination drives
    """
    __tablename__ = "drive_worker_assignments"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    drive_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("vaccination_drives.id", ondelete="CASCADE"),
        nullable=False
    )
    worker_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("worker_details.id", ondelete="CASCADE"),
        nullable=False
    )
    
    assigned_at: Mapped[DateTime] = mapped_column(
        DateTime(True), 
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False
    )
    
    # Ensure unique assignment
    __table_args__ = (
        UniqueConstraint('drive_id', 'worker_id', name='unique_drive_worker_assignment'),
    )


class DriveParticipant(Base):
    """
    Tracks participants in vaccination drives - babies/users in the drive's city
    """
    __tablename__ = "drive_participants"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vaccination_drive_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("vaccination_drives.id", ondelete="CASCADE"),
        nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        nullable=False
    )
    worker_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("worker_details.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Vaccination status
    is_vaccinated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    vaccination_date: Mapped[Optional[DateTime]] = mapped_column(DateTime(True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Cached user info for worker convenience
    baby_name: Mapped[str] = mapped_column(String(100), nullable=False)
    parent_name: Mapped[str] = mapped_column(String(100), nullable=False)
    parent_mobile: Mapped[str] = mapped_column(String(20), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    
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
    
    # Relationships
    vaccination_drive: Mapped["VaccinationDrive"] = relationship(
        "VaccinationDrive",
        back_populates="participants"
    )
    user: Mapped["Users"] = relationship("Users", foreign_keys=[user_id])
    worker: Mapped[Optional["WorkerDetails"]] = relationship("WorkerDetails", foreign_keys=[worker_id])
    
    # Unique constraint
    __table_args__ = (
        UniqueConstraint('vaccination_drive_id', 'user_id', name='unique_drive_user_participant'),
    )


# Baby Vaccination Tracking Models

class VaccineTemplate(Base):
    """
    Master template for all vaccines with their standard schedules
    """
    __tablename__ = "vaccine_templates"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vaccine_name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    disease_prevented: Mapped[str] = mapped_column(String(200), nullable=False)
    recommended_age_days: Mapped[int] = mapped_column(nullable=False)  # Days after birth
    total_doses: Mapped[int] = mapped_column(nullable=False, default=1)
    dose_interval_days: Mapped[int] = mapped_column(nullable=False, default=0)  # Days between doses
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(True), 
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False
    )
    
    # Relationships
    vaccination_records: Mapped[List["VaccinationRecord"]] = relationship(
        "VaccinationRecord", 
        back_populates="vaccine_template",
        cascade="all, delete-orphan"
    )


class VaccinationRecord(Base):
    """
    Individual vaccination record for each baby
    """
    __tablename__ = "vaccination_records"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        nullable=False
    )
    vaccine_template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("vaccine_templates.id", ondelete="CASCADE"),
        nullable=False
    )
    dose_number: Mapped[int] = mapped_column(nullable=False)  # 1, 2, 3, etc.
    doctor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("doctor_details.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Vaccination status
    administered_date: Mapped[Optional[DateTime]] = mapped_column(DateTime(True))
    due_date: Mapped[DateTime] = mapped_column(DateTime(True), nullable=False)
    is_administered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
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
    )    # Relationships
    user_profile: Mapped["UserProfile"] = relationship(
        "UserProfile", 
        primaryjoin="VaccinationRecord.user_id == UserProfile.user_id",
        foreign_keys="[VaccinationRecord.user_id]",
        viewonly=True
    )
    vaccine_template: Mapped["VaccineTemplate"] = relationship("VaccineTemplate", back_populates="vaccination_records")
    doctor: Mapped[Optional["DoctorDetails"]] = relationship("DoctorDetails", back_populates="vaccination_records")
    
    # Ensure unique dose per vaccine per user
    __table_args__ = (
        UniqueConstraint('user_id', 'vaccine_template_id', 'dose_number', name='unique_user_vaccine_dose'),
    )


class DoctorPatientRelationship(Base):
    """
    Tracks doctor-patient relationships for babies
    """
    __tablename__ = "doctor_patient_relationships"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        nullable=False
    )
    doctor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("doctor_details.id", ondelete="CASCADE"),
        nullable=False
    )
    first_interaction_date: Mapped[DateTime] = mapped_column(DateTime(True), nullable=False)
    
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(True), 
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False
    )
    
    # Relationships
    patient: Mapped["UserProfile"] = relationship(
        "UserProfile", 
        primaryjoin="DoctorPatientRelationship.user_id == UserProfile.user_id",
        foreign_keys="[DoctorPatientRelationship.user_id]",
        viewonly=True
    )
    doctor: Mapped["DoctorDetails"] = relationship("DoctorDetails", back_populates="patient_relationships")
    
    # Ensure unique doctor-patient relationship
    __table_args__ = (
        UniqueConstraint('user_id', 'doctor_id', name='unique_doctor_patient'),
    )
