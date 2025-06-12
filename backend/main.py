from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from fastapi.responses import HTMLResponse
from fastapi import Request, HTTPException
import os

from routers.auth.auth import router as auth_router
from routers.users.users import router as users_router

ENVIRONMENT = os.getenv("ENVIRONMENT", "dev")
IS_PRODUCTION = ENVIRONMENT == "prod"

app = FastAPI(
    title="Vaxtrack API",
    description="A comprehensive API for Vaxtrack",
    version="1.0.0",
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
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)

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
    <title>Vaxtrack API DOCS</title>

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
def home():
    """This is the first and default route for the Vaxtrack Backend"""
    return """
    <html>
      <head>
        <title>Vaxtrack API</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background-color: #f8f9fa; }
          h1 { color: #333; }
          ul { list-style-type: none; padding: 0; }
          li { margin: 10px 0; }
          a { color: #0066cc; text-decoration: none; }
          a:hover { text-decoration: underline; }
          hr { margin: 20px 0; }
          h2 { color: #555; }
        </style>
      </head>
      <body>
        <h1>Welcome to Vaxtrack API</h1>
        <hr>
        <ul>
          <li><a href="/Prod/docs">Spotlight API Documentation</a></li>
          <li><a href="/Prod/redoc">Redoc API Documentation</a></li>
          <li><a href="/Prod/apidocs">Swagger API Documentation</a></li>
          <li><a href="/Prod/openapi.json">OpenAPI Specification</a></li>
          <hr>
          <li><a href="http://localhost:3000">Frontend Website</a></li>
          <hr>
        </ul>
      </body>
    </html>
    """


handler = Mangum(app)
