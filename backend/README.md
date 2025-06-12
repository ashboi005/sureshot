# FastAPI + Supabase Auth Boilerplate

A complete FastAPI backend boilerplate with Supabase authentication, PostgreSQL database, and AWS Lambda deployment support.

## 🚀 Features

- **Authentication**: Complete auth system using Supabase Auth
  - User registration, login, logout
  - JWT token-based authentication
  - Password reset functionality
  - Email verification
- **User Management**: Comprehensive user profile management
  - Profile information (username, bio, custom settings)
  - Profile image upload/management via Supabase Storage
  - Public profile viewing
  - User search functionality
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations
- **Storage**: Supabase Storage integration for file uploads
- **Deployment**: AWS Lambda ready with SAM template
- **Development**: Local development with hot reload

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL database (or use Supabase's built-in database)
- Supabase account
- AWS CLI (for deployment)
- SAM CLI (for AWS deployment)

## 🛠️ Setup Instructions

### 1. Clone and Initial Configuration

```bash
git clone https://github.com/ashboi005/fastapi-supabase-boilerplate
cd fastapi-supabase-boilerplate
```

**Important: Configure SAM deployment file**

After cloning, you'll need to set up your SAM configuration:

1. **Rename samconfig.txt to samconfig.toml**:
   ```powershell
   Rename-Item samconfig.txt samconfig.toml
   ```

2. **Update samconfig.toml with your values**:
   Open `samconfig.toml` and replace the following placeholders:
   - `your-app-name-backend` → Your application name (e.g., `my-awesome-app-backend`)
   - `your-app-name` → Your S3 prefix (e.g., `my-awesome-app`)
   - `your-aws-region` → Your AWS region (e.g., `us-east-1`, `ap-south-1`)
   - `your-aws-profile` → Your AWS CLI profile name (e.g., `default`)
   - `YOUR_SUPABASE_URL` → Your Supabase project URL
   - `YOUR_SUPABASE_ANON_KEY` → Your Supabase anonymous key
   - `YOUR_SUPABASE_SERVICE_ROLE_KEY` → Your Supabase service role key
   - `YOUR_DATABASE_URL` → Your Supabase database connection string
   - `YOUR_JWT_SECRET_KEY` → Generate a secure JWT secret key
   - `YOUR_STORAGE_BUCKET` → Your Supabase storage bucket name

```bash
pip install -r requirements.txt
```

### 3. Supabase Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your Project URL and API Keys

2. **Configure Authentication**:
   - Go to Authentication > Settings
   - Configure your auth providers (email, OAuth, etc.)
   - Set up email templates if needed

3. **Set up Storage (Optional)**:
   - Go to Storage
   - Create a bucket named `your-storage-bucket` (or your preferred name)
   - Configure bucket policies for public/private access

4. **Database Setup**:
   - You can use Supabase's built-in PostgreSQL
   - Or connect to your own PostgreSQL instance
   - Get the connection string from Settings > Database

### 4. Environment Configuration

Create a `.env` file in the project directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Configuration
DATABASE_URL=postgresql+asyncpg://postgres:password@host:port/database_name

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-here

# Storage Configuration
SUPABASE_STORAGE_BUCKET=your-storage-bucket

# Environment
ENVIRONMENT=dev
AWS_REGION=your-aws-region
```

### 5. Database Migrations

Initialize and run the database migrations:

```powershell
# Initialize Alembic (if not already done)
alembic init migrations

# Important: Use the provided env.py file
# Move the provided env.py file to the migrations folder (it's pre-configured for this boilerplate)
Move-Item env.py migrations/env.py

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Run migrations
alembic upgrade head
```

**Note**: The provided `env.py` file is already configured to work with this boilerplate's async database setup and will automatically handle the conversion between async and sync database connections for Alembic.

### 6. Local Development

Run the development server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Access the API documentation at: `http://localhost:8000/docs`

## 📁 Project Structure

```
fastapi-supabase-boilerplate/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration and database setup
├── models.py              # SQLAlchemy models
├── requirements.txt       # Python dependencies
├── alembic.ini            # Alembic configuration
├── template.yaml          # AWS SAM template
├── samconfig.txt          # Template for SAM configuration (rename to .toml)
├── README.md              # This file
├── routers/               # API route modules
│   ├── __init__.py
│   └── auth/              # Authentication routes
│       ├── __init__.py
│       ├── auth.py        # Auth endpoints
│       ├── helpers.py     # Auth helper functions
│       └── schemas.py     # Pydantic schemas
├── migrations/            # Alembic migration files (created after alembic init)
│   ├── env.py
│   ├── script.py.mako
│   └── versions/          # Migration version files
└── utils/                 # Utility modules
    └── util.py
```

## 🔐 Authentication Flow

### User Registration
```python
POST /auth/register
{
  "email": "user@example.com",
  "password": "securepassword",
  "username": "username",
  "full_name": "Full Name"
}
```

### User Login
```python
POST /auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Protected Routes
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📝 API Endpoints

### Authentication Routes (`/auth`)

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh-token` - Refresh JWT token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

## 🗃️ Database Models

### UserProfile Model
```python
class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(String, primary_key=True)  # Supabase Auth user ID
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    profile_image_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

## 📦 Deployment

### AWS Lambda Deployment with Docker Integration

**Important**: Make sure you've completed the samconfig setup from Step 1 before deploying!

1. **Configure AWS CLI**:
```powershell
aws configure
```

2. **Ensure samconfig.toml is properly configured**:
   - Verify you've renamed `samconfig.txt` to `samconfig.toml`
   - Double-check all placeholder values have been replaced
   - Ensure your AWS credentials and region are correct

3. **Build and Deploy with Docker Integration**:
   
   **For first-time deployment:**
   ```powershell
   # Build the application (Docker image will be built automatically)
   sam build
   
   # Deploy with image repository resolution and your AWS profile
   sam deploy --resolve-image-repos --profile your-aws-profile
   ```
   
   **For subsequent deployments:**
   ```powershell
   # Build the application
   sam build
   
   # Deploy using existing configuration
   sam deploy --profile your-aws-profile
   ```

   **Note**: 
   - SAM automatically builds the Docker image when you run `sam build`
   - The `--resolve-image-repos` flag creates ECR repositories for your Docker images if they don't exist
   - Replace `your-aws-profile` with your actual AWS CLI profile name

4. **Local Testing with SAM and Docker**:
```powershell
# Build the application
sam build

# Start local API Gateway with Docker container
sam local start-api

# Test a specific function
sam local invoke FastApiFunction
```

## 🔧 Configuration Details

### SAM Configuration Security
- **Never commit samconfig.toml**: This file contains sensitive credentials and is already in .gitignore
- **Always rename samconfig.txt**: Remember to rename the template file to samconfig.toml after cloning
- **Generate secure keys**: Use strong, randomly generated keys for JWT_SECRET_KEY
- **Use environment-specific configurations**: Consider separate samconfig files for different environments

### Database Configuration
- Uses SQLAlchemy with async support
- Configured for pgbouncer compatibility
- Automatic connection pooling and recycling

### Supabase Integration
- Lazy client initialization for Lambda compatibility
- Separate admin client for elevated operations
- Storage integration ready

### CORS Configuration
- Configured for development and production
- Allows all origins in development (configure for production)

## 🚀 Extending the Boilerplate

### Adding New Models
1. Add model to `models.py`
2. Create migration: `alembic revision --autogenerate -m "Description"`
3. Run migration: `alembic upgrade head`

### Adding New Routes
1. Create new router in `routers/` directory
2. Include router in `main.py`
3. Add appropriate schemas in router's `schemas.py`

### File Upload Setup
The boilerplate includes Supabase Storage configuration. To implement file uploads:
1. Use the `get_supabase_storage()` function from `config.py`
2. Create upload endpoints with proper authentication
3. Store file URLs in database models

## 🔍 API Documentation

Once running, access the interactive API documentation:
- **Spotlight UI**: `/docs`
- **Swagger UI**: `/apidocs`
- **ReDoc**: `/redoc`
- **OpenAPI JSON**: `/openapi.json`

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Check firewall/security group settings
   - Ensure database is accessible from your environment

2. **Supabase Authentication Issues**:
   - Verify SUPABASE_URL and keys are correct
   - Check Supabase project settings
   - Ensure auth is enabled in Supabase dashboard

3. **Migration Issues**:
   - Check database connection
   - Verify Alembic configuration in `alembic.ini`
   - Ensure proper environment variables are set

### Environment Variables Checklist
- [ ] Placed env.py into migrations folder/replaced with env.py in migrations
- [ ] Renamed `samconfig.txt` to `samconfig.toml`
- [ ] Updated all placeholders in `samconfig.toml`
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] DATABASE_URL
- [ ] JWT_SECRET_KEY
- [ ] AWS region and profile configured
- [ ] Created `.env` file for local development

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📝 Notes

- This boilerplate uses Supabase Auth for user management
- The UserProfile model syncs with Supabase's auth.users table via the ID field
- JWT tokens are handled by Supabase's GoTrue service
- Ready for production deployment on AWS Lambda
