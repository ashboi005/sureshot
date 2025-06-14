"""
Predefined vaccine templates for baby vaccination tracking
Based on Indian immunization schedule
"""

# Standard vaccine templates for babies
BABY_VACCINE_TEMPLATES = [
    # Birth vaccines
    {
        "vaccine_name": "BCG",
        "disease_prevented": "Tuberculosis",
        "recommended_age_days": 0,  # At birth
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": True,
        "description": "Bacillus Calmette-Guérin vaccine to prevent tuberculosis"
    },
    {
        "vaccine_name": "Hepatitis B",
        "disease_prevented": "Hepatitis B",
        "recommended_age_days": 0,  # At birth
        "total_doses": 3,
        "dose_interval_days": 30,  # 30 days between doses
        "is_mandatory": True,
        "description": "Hepatitis B vaccine to prevent hepatitis B infection"
    },
    {
        "vaccine_name": "OPV",
        "disease_prevented": "Poliomyelitis",
        "recommended_age_days": 0,  # Birth dose
        "total_doses": 4,
        "dose_interval_days": 42,  # 6 weeks between doses
        "is_mandatory": True,
        "description": "Oral Polio Vaccine to prevent poliomyelitis"
    },
    
    # 6 weeks vaccines
    {
        "vaccine_name": "DPT",
        "disease_prevented": "Diphtheria, Pertussis, Tetanus",
        "recommended_age_days": 42,  # 6 weeks
        "total_doses": 3,
        "dose_interval_days": 28,  # 4 weeks between doses
        "is_mandatory": True,
        "description": "Diphtheria, Pertussis, and Tetanus vaccine"
    },
    {
        "vaccine_name": "Hib",
        "disease_prevented": "Haemophilus influenzae type b",
        "recommended_age_days": 42,  # 6 weeks
        "total_doses": 3,
        "dose_interval_days": 28,  # 4 weeks between doses
        "is_mandatory": True,
        "description": "Haemophilus influenzae type b vaccine"
    },
    {
        "vaccine_name": "Rotavirus",
        "disease_prevented": "Rotavirus gastroenteritis",
        "recommended_age_days": 42,  # 6 weeks
        "total_doses": 3,
        "dose_interval_days": 28,  # 4 weeks between doses
        "is_mandatory": True,
        "description": "Rotavirus vaccine to prevent severe diarrhea"
    },
    {
        "vaccine_name": "Pneumococcal (PCV)",
        "disease_prevented": "Pneumococcal disease",
        "recommended_age_days": 42,  # 6 weeks
        "total_doses": 3,
        "dose_interval_days": 28,  # 4 weeks between doses
        "is_mandatory": True,
        "description": "Pneumococcal conjugate vaccine"
    },
    
    # 9 months vaccines
    {
        "vaccine_name": "Measles",
        "disease_prevented": "Measles",
        "recommended_age_days": 270,  # 9 months
        "total_doses": 2,
        "dose_interval_days": 90,  # 3 months between doses
        "is_mandatory": True,
        "description": "Measles vaccine"
    },
    
    # 12 months vaccines
    {
        "vaccine_name": "MMR",
        "disease_prevented": "Measles, Mumps, Rubella",
        "recommended_age_days": 365,  # 12 months
        "total_doses": 2,
        "dose_interval_days": 180,  # 6 months between doses
        "is_mandatory": True,
        "description": "Measles, Mumps, and Rubella vaccine"
    },
    
    # 15-18 months vaccines
    {
        "vaccine_name": "Varicella",
        "disease_prevented": "Chickenpox",
        "recommended_age_days": 456,  # 15 months
        "total_doses": 2,
        "dose_interval_days": 90,  # 3 months between doses
        "is_mandatory": True,
        "description": "Varicella (chickenpox) vaccine"
    },
    
    # 16-24 months vaccines
    {
        "vaccine_name": "DPT Booster",
        "disease_prevented": "Diphtheria, Pertussis, Tetanus",
        "recommended_age_days": 456,  # 15 months
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": True,
        "description": "DPT booster vaccine"
    },
    {
        "vaccine_name": "OPV Booster",
        "disease_prevented": "Poliomyelitis",
        "recommended_age_days": 456,  # 15 months
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": True,
        "description": "OPV booster vaccine"
    },
    
    # 2 years vaccines
    {
        "vaccine_name": "Typhoid",
        "disease_prevented": "Typhoid fever",
        "recommended_age_days": 730,  # 2 years
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": False,
        "description": "Typhoid vaccine"
    },
    
    # 5 years vaccines
    {
        "vaccine_name": "DPT (5 years)",
        "disease_prevented": "Diphtheria, Pertussis, Tetanus",
        "recommended_age_days": 1825,  # 5 years
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": True,
        "description": "DPT vaccine at 5 years"
    },
    {
        "vaccine_name": "OPV (5 years)",
        "disease_prevented": "Poliomyelitis",
        "recommended_age_days": 1825,  # 5 years
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": True,
        "description": "OPV vaccine at 5 years"
    },
    
    # 10 years vaccines
    {
        "vaccine_name": "Td",
        "disease_prevented": "Tetanus, Diphtheria",
        "recommended_age_days": 3650,  # 10 years
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": True,
        "description": "Tetanus and Diphtheria vaccine"
    },
    
    # Optional vaccines
    {
        "vaccine_name": "Hepatitis A",
        "disease_prevented": "Hepatitis A",
        "recommended_age_days": 365,  # 12 months
        "total_doses": 2,
        "dose_interval_days": 180,  # 6 months between doses
        "is_mandatory": False,
        "description": "Hepatitis A vaccine"
    },
    {
        "vaccine_name": "Influenza",
        "disease_prevented": "Seasonal Influenza",
        "recommended_age_days": 180,  # 6 months
        "total_doses": 1,
        "dose_interval_days": 365,  # Annual
        "is_mandatory": False,
        "description": "Seasonal influenza vaccine (annual)"
    },
    {
        "vaccine_name": "Meningococcal",
        "disease_prevented": "Meningococcal disease",
        "recommended_age_days": 730,  # 2 years
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": False,
        "description": "Meningococcal vaccine"
    },
    {
        "vaccine_name": "BCG",
        "disease_prevented": "Tuberculosis",
        "recommended_age_days": 0,  # At birth
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": True,
        "description": "Bacillus Calmette-Guérin vaccine to prevent tuberculosis"
    },
    {
        "vaccine_name": "Hepatitis B Birth Dose",
        "disease_prevented": "Hepatitis B",
        "recommended_age_days": 0,  # At birth
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": True,
        "description": "First dose of Hepatitis B vaccine given at birth"
    },
    {
        "vaccine_name": "OPV (Oral Polio Vaccine)",
        "disease_prevented": "Poliomyelitis",
        "recommended_age_days": 0,  # At birth
        "total_doses": 4,  # 0, 6, 10, 14 weeks
        "dose_interval_days": 28,  # 4 weeks interval
        "is_mandatory": True,
        "description": "Oral polio vaccine to prevent poliomyelitis"
    },
    {
        "vaccine_name": "DPT (Diphtheria, Pertussis, Tetanus)",
        "disease_prevented": "Diphtheria, Pertussis, Tetanus",
        "recommended_age_days": 42,  # 6 weeks
        "total_doses": 3,  # 6, 10, 14 weeks
        "dose_interval_days": 28,  # 4 weeks interval
        "is_mandatory": True,
        "description": "Combined vaccine against diphtheria, pertussis (whooping cough), and tetanus"
    },
    {
        "vaccine_name": "Hepatitis B",
        "disease_prevented": "Hepatitis B",
        "recommended_age_days": 42,  # 6 weeks
        "total_doses": 2,  # 6 and 14 weeks (birth dose separate)
        "dose_interval_days": 56,  # 8 weeks interval
        "is_mandatory": True,
        "description": "Hepatitis B vaccine series (excluding birth dose)"
    },
    {
        "vaccine_name": "Hib (Haemophilus influenzae type b)",
        "disease_prevented": "Haemophilus influenzae type b infections",
        "recommended_age_days": 42,  # 6 weeks
        "total_doses": 3,  # 6, 10, 14 weeks
        "dose_interval_days": 28,  # 4 weeks interval
        "is_mandatory": True,
        "description": "Vaccine against Haemophilus influenzae type b"
    },
    {
        "vaccine_name": "IPV (Inactivated Polio Vaccine)",
        "disease_prevented": "Poliomyelitis",
        "recommended_age_days": 98,  # 14 weeks
        "total_doses": 2,  # 14 weeks and 9 months
        "dose_interval_days": 210,  # About 7 months interval
        "is_mandatory": True,
        "description": "Inactivated polio vaccine"
    },
    {
        "vaccine_name": "Pneumococcal Conjugate Vaccine (PCV)",
        "disease_prevented": "Pneumococcal infections",
        "recommended_age_days": 42,  # 6 weeks
        "total_doses": 3,  # 6, 10, 14 weeks
        "dose_interval_days": 28,  # 4 weeks interval
        "is_mandatory": False,
        "description": "Vaccine against pneumococcal bacteria"
    },
    {
        "vaccine_name": "Rotavirus Vaccine",
        "disease_prevented": "Rotavirus gastroenteritis",
        "recommended_age_days": 42,  # 6 weeks
        "total_doses": 3,  # 6, 10, 14 weeks
        "dose_interval_days": 28,  # 4 weeks interval
        "is_mandatory": False,
        "description": "Oral vaccine against rotavirus"
    },
    {
        "vaccine_name": "Measles",
        "disease_prevented": "Measles",
        "recommended_age_days": 270,  # 9 months
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": True,
        "description": "First dose of measles vaccine"
    },
    {
        "vaccine_name": "Japanese Encephalitis (JE)",
        "disease_prevented": "Japanese Encephalitis",
        "recommended_age_days": 270,  # 9 months
        "total_doses": 2,  # 9 months, then 16-24 months
        "dose_interval_days": 365,  # 1 year interval
        "is_mandatory": True,
        "description": "Vaccine against Japanese Encephalitis"
    },
    {
        "vaccine_name": "Vitamin A",
        "disease_prevented": "Vitamin A deficiency",
        "recommended_age_days": 270,  # 9 months
        "total_doses": 4,  # Every 6 months from 9 months
        "dose_interval_days": 180,  # 6 months interval
        "is_mandatory": True,
        "description": "Vitamin A supplementation"
    },
    {
        "vaccine_name": "MMR (Measles, Mumps, Rubella)",
        "disease_prevented": "Measles, Mumps, Rubella",
        "recommended_age_days": 365,  # 12 months
        "total_doses": 2,  # 12 months and 15-18 months
        "dose_interval_days": 120,  # 4 months interval
        "is_mandatory": True,
        "description": "Combined vaccine against measles, mumps, and rubella"
    },
    {
        "vaccine_name": "Typhoid",
        "disease_prevented": "Typhoid fever",
        "recommended_age_days": 365,  # 12 months
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": False,
        "description": "Vaccine against typhoid fever"
    },
    {
        "vaccine_name": "Hepatitis A",
        "disease_prevented": "Hepatitis A",
        "recommended_age_days": 365,  # 12 months
        "total_doses": 2,  # 12 months and 18 months
        "dose_interval_days": 180,  # 6 months interval
        "is_mandatory": False,
        "description": "Vaccine against Hepatitis A"
    },
    {
        "vaccine_name": "Varicella (Chickenpox)",
        "disease_prevented": "Chickenpox",
        "recommended_age_days": 365,  # 12 months
        "total_doses": 2,  # 12 months and 15-18 months
        "dose_interval_days": 120,  # 4 months interval
        "is_mandatory": False,
        "description": "Vaccine against chickenpox"
    },
    {
        "vaccine_name": "DPT Booster 1",
        "disease_prevented": "Diphtheria, Pertussis, Tetanus",
        "recommended_age_days": 540,  # 18 months
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": True,
        "description": "First booster dose of DPT vaccine"
    },
    {
        "vaccine_name": "OPV Booster 1",
        "disease_prevented": "Poliomyelitis",
        "recommended_age_days": 540,  # 18 months
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": True,
        "description": "First booster dose of OPV vaccine"
    },
    {
        "vaccine_name": "DPT Booster 2",
        "disease_prevented": "Diphtheria, Pertussis, Tetanus",
        "recommended_age_days": 1825,  # 5 years
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": True,
        "description": "Second booster dose of DPT vaccine"
    },
    {
        "vaccine_name": "OPV Booster 2",
        "disease_prevented": "Poliomyelitis",
        "recommended_age_days": 1825,  # 5 years
        "total_doses": 1,
        "dose_interval_days": 0,
        "is_mandatory": True,
        "description": "Second booster dose of OPV vaccine"
    }
]
