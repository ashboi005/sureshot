"""
Script to populate vaccine templates with standard baby vaccines
Run this after creating the database tables
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import VaccineTemplate
from config import get_db

# Standard vaccine schedule for babies (India-specific)
VACCINE_TEMPLATES = [
    {
        "vaccine_name": "BCG",
        "disease_prevented": "Tuberculosis",
        "recommended_age_days": 0,  # At birth
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": True,
        "description": "Bacille Calmette-Guérin vaccine for tuberculosis protection"
    },
    {
        "vaccine_name": "Hepatitis B",
        "disease_prevented": "Hepatitis B",
        "recommended_age_days": 0,  # At birth
        "total_doses": 3,
        "dose_interval_days": 30,  # 1 month intervals (birth, 1 month, 6 months)
        "is_mandatory": True,
        "description": "Hepatitis B vaccine series"
    },
    {
        "vaccine_name": "OPV",
        "disease_prevented": "Poliomyelitis",
        "recommended_age_days": 0,  # Birth dose
        "total_doses": 4,
        "dose_interval_days": 42,  # 6 weeks intervals
        "is_mandatory": True,
        "description": "Oral Polio Vaccine"
    },
    {
        "vaccine_name": "DPT",
        "disease_prevented": "Diphtheria, Pertussis, Tetanus",
        "recommended_age_days": 45,  # 6 weeks
        "total_doses": 3,
        "dose_interval_days": 28,  # 4 weeks intervals
        "is_mandatory": True,
        "description": "Diphtheria, Pertussis, Tetanus combination vaccine"
    },
    {
        "vaccine_name": "Pneumococcal (PCV)",
        "disease_prevented": "Pneumococcal diseases",
        "recommended_age_days": 45,  # 6 weeks
        "total_doses": 3,
        "dose_interval_days": 28,  # 4 weeks intervals
        "is_mandatory": True,
        "description": "Pneumococcal conjugate vaccine"
    },
    {
        "vaccine_name": "Rotavirus",
        "disease_prevented": "Rotavirus gastroenteritis",
        "recommended_age_days": 45,  # 6 weeks
        "total_doses": 3,
        "dose_interval_days": 28,  # 4 weeks intervals
        "is_mandatory": True,
        "description": "Rotavirus vaccine"
    },
    {
        "vaccine_name": "Hib",
        "disease_prevented": "Haemophilus influenzae type b",
        "recommended_age_days": 45,  # 6 weeks
        "total_doses": 3,
        "dose_interval_days": 28,  # 4 weeks intervals
        "is_mandatory": True,
        "description": "Haemophilus influenzae type b vaccine"
    },
    {
        "vaccine_name": "MMR",
        "disease_prevented": "Measles, Mumps, Rubella",
        "recommended_age_days": 270,  # 9 months
        "total_doses": 2,
        "dose_interval_days": 90,  # 3 months interval (9 months, 12 months)
        "is_mandatory": True,
        "description": "Measles, Mumps, Rubella combination vaccine"
    },
    {
        "vaccine_name": "Varicella",
        "disease_prevented": "Chickenpox",
        "recommended_age_days": 365,  # 12 months
        "total_doses": 2,
        "dose_interval_days": 90,  # 3 months interval
        "is_mandatory": True,
        "description": "Varicella (Chickenpox) vaccine"
    },
    {
        "vaccine_name": "Hepatitis A",
        "disease_prevented": "Hepatitis A",
        "recommended_age_days": 365,  # 12 months
        "total_doses": 2,
        "dose_interval_days": 180,  # 6 months interval
        "is_mandatory": True,
        "description": "Hepatitis A vaccine"
    },
    {
        "vaccine_name": "Typhoid",
        "disease_prevented": "Typhoid fever",
        "recommended_age_days": 730,  # 24 months
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": False,
        "description": "Typhoid vaccine"
    },
    {
        "vaccine_name": "Japanese Encephalitis",
        "disease_prevented": "Japanese Encephalitis",
        "recommended_age_days": 270,  # 9 months
        "total_doses": 2,
        "dose_interval_days": 30,  # 1 month interval
        "is_mandatory": False,
        "description": "Japanese Encephalitis vaccine"
    }
]

async def populate_vaccine_templates():
    """Populate the database with standard vaccine templates"""
    async for db in get_db():
        try:
            for template_data in VACCINE_TEMPLATES:
                # Check if template already exists
                existing = await db.execute(
                    select(VaccineTemplate).where(
                        VaccineTemplate.vaccine_name == template_data["vaccine_name"]
                    )
                )
                if not existing.scalar_one_or_none():
                    template = VaccineTemplate(**template_data)
                    db.add(template)
            
            await db.commit()
            print(f"Successfully populated {len(VACCINE_TEMPLATES)} vaccine templates")
            
        except Exception as e:
            await db.rollback()
            print(f"Error populating vaccine templates: {str(e)}")
            raise
        finally:
            break

if __name__ == "__main__":
    import asyncio
    asyncio.run(populate_vaccine_templates())
