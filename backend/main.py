from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from fastapi.responses import HTMLResponse
from fastapi import Request, HTTPException
import os
import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from routers.auth.auth import router as auth_router
from routers.users.users import router as users_router
from routers.admin.admin import router as admin_router
from routers.workers.workers import router as workers_router
from routers.vaccines.vaccines import router as vaccines_router
from routers.doctors.doctors import router as doctors_router
from config import async_engine, get_db
from models import VaccineTemplate
from vaccine_data import BABY_VACCINE_TEMPLATES

ENVIRONMENT = os.getenv("ENVIRONMENT", "dev")
IS_PRODUCTION = ENVIRONMENT == "prod"

app = FastAPI(
    title="Vaxtrack API - Baby Vaccination Tracker",
    description="A comprehensive API for tracking baby vaccinations",
    version="2.0.0",
    root_path="/Prod" if IS_PRODUCTION else "",
    docs_url="/apidocs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    servers=[
        {"url": "https://your-aws-api.execute-api.region.amazonaws.com/Prod", "description": "Production Server"},
        {"url": "http://localhost:8000", "description": "Local Development Server"},
        {"url": "https://your-ngrok-tunnel.ngrok-free.app/", "description": "Ngrok Tunnel"},
    ],
)

async def populate_vaccine_templates():
    """Populate the database with predefined vaccine templates"""
    try:
        print("Checking existing vaccine templates...")
        # Create a proper async session
        async with AsyncSession(async_engine) as session:
            # Get existing template names to avoid duplicates
            result = await session.execute(select(VaccineTemplate.vaccine_name))
            existing_names = set(result.scalars().all())
            print(f"Found {len(existing_names)} existing templates: {existing_names}")
            
            # Process templates one by one to avoid bulk insert issues
            new_count = 0
            for template_data in BABY_VACCINE_TEMPLATES:
                if template_data["vaccine_name"] not in existing_names:
                    try:
                        template = VaccineTemplate(
                            vaccine_name=template_data["vaccine_name"],
                            disease_prevented=template_data["disease_prevented"],
                            recommended_age_days=template_data["recommended_age_days"],
                            total_doses=template_data["total_doses"],
                            dose_interval_days=template_data["dose_interval_days"],
                            is_mandatory=template_data["is_mandatory"],
                            description=template_data["description"]
                        )
                        session.add(template)
                        await session.commit()
                        print(f"Created template: {template_data['vaccine_name']}")
                        new_count += 1
                    except IntegrityError as ie:
                        await session.rollback()
                        print(f"Template {template_data['vaccine_name']} already exists, skipping...")
                        continue
                    except Exception as te:
                        await session.rollback()
                        print(f"Error creating template {template_data['vaccine_name']}: {te}")
                        continue
            
            if new_count > 0:
                print(f"Successfully created {new_count} new vaccine templates")
            else:
                print("All vaccine templates already exist - no new templates added")
            
    except Exception as e:
        print(f"Error populating vaccine templates: {e}")
        import traceback
        traceback.print_exc()
        # Continue startup even if template population fails
        pass
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(admin_router) 
app.include_router(workers_router)
app.include_router(vaccines_router)
app.include_router(doctors_router)

@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    print("Starting Vaxtrack API...")
    await populate_vaccine_templates()
    print("Vaxtrack API startup completed")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on shutdown"""
    await async_engine.dispose()
    print("Vaxtrack API shutdown completed")

@app.get("/docs", include_in_schema=False)
async def api_documentation(request: Request):
    openapi_url = "/Prod/openapi.json" if IS_PRODUCTION else "/openapi.json"
    
    return HTMLResponse(
        f"""
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title> API DOCS</title>

    <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
  </head>
  <body>

    <elements-api
      apiDescriptionUrl="{openapi_url}"
      router="hash"
      theme="dark"
    />

  </body>
</html>"""
    )

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint with API information"""
    return """
    <html>
        <head>
            <title>Vaxtrack API - Baby Vaccination Tracker</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { color: #2e7d32; }
                .section { margin: 20px 0; }
                a { color: #1976d2; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1 class="header">🩺 Vaxtrack API - Baby Vaccination Tracker</h1>
            <div class="section">
                <p>A comprehensive API for tracking baby vaccinations and managing healthcare records.</p>
                <p><strong>Version:</strong> 2.0.0</p>
            </div>
            <div class="section">
                <h3>📖 API Documentation</h3>
                <ul>
                    <li><a href="/apidocs">Interactive API Documentation (Swagger UI)</a></li>
                    <li><a href="/redoc">Alternative Documentation (ReDoc)</a></li>
                    <li><a href="/openapi.json">OpenAPI JSON Schema</a></li>
                </ul>
            </div>
            <div class="section">
                <h3>🚀 Key Features</h3>
                <ul>
                    <li>Baby profile management with parent information</li>
                    <li>Comprehensive vaccine tracking and scheduling</li>
                    <li>Doctor-patient relationship management</li>
                    <li>Vaccination history and due date reminders</li>
                    <li>Profile image upload with Supabase storage</li>
                </ul>
            </div>
        </body>
    </html>
    """

handler = Mangum(app)
