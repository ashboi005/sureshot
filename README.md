# VaxTrack - Vaccine Tracking System

VaxTrack is a comprehensive vaccine management system designed to help doctors, patients, and healthcare workers track and manage vaccination schedules efficiently.

## Features

### Doctor Dashboard
- **Enhanced UI**: Modern, intuitive interface with improved visualization of patient data and vaccination statistics
- **QR Code Scanning**: Doctors can scan patient QR codes to quickly administer vaccines
- **Real-time Updates**: Immediate updates to vaccination records after administration
- **Patient Management**: View and manage patient details, vaccination schedules, and history

### QR-based Vaccine Administration
- Doctors can scan patient QR codes (format: `http://localhost:3000/customers/home/register/{User-id}/vaccine_template_id`)
- The system automatically extracts user_id and vaccine_template_id from the QR code
- Form pre-populated with doctor's ID and current date
- Notes field for doctor's observations
- Elegant loading and success animations during vaccine administration

## Tech Stack

### Frontend
- Next.js
- TypeScript
- TailwindCSS
- Shadcn UI Components
- Framer Motion (animations)

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL
- Alembic (migrations)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   
   cd ../backend
   pip install -r requirements.txt
   ```
3. Set up environment variables
4. Run the development servers:
   ```bash
   # Frontend
   cd frontend
   npm run dev
   
   # Backend
   cd backend
   uvicorn main:app --reload
   ```

## QR Scanning Feature

The QR scanning feature lets doctors quickly administer vaccines by scanning a patient's QR code. The workflow is:

1. Doctor scans the QR code using the "Scan Vaccine QR" button
2. The system extracts user_id and vaccine_template_id from the QR URL
3. Doctor adds optional notes
4. System records the administration with current date and doctor's ID
5. Patient records are immediately updated

## API Endpoints

### Vaccine Administration
```
POST /Prod/vaccination/administer
```

**Request Body:**
```json
{
  "user_id": "string",
  "vaccine_template_id": "string",
  "dose_number": 0,
  "doctor_id": "string",
  "administered_date": "YYYY-MM-DD",
  "notes": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vaccine successfully administered"
}
```
