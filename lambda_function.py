import json
from mangum import Mangum
from main import app

handler = Mangum(app, lifespan="off")

def lambda_handler(event, context):
    return handler(event, context)