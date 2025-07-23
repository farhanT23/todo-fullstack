import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from config import BASE_PATH, app_settings

from utils import lifespan

app = FastAPI(lifespan=lifespan.lifespan,
              version=app_settings.app_version, 
              title=app_settings.app_name)



@app.get("/health")
async def root():
    return {"message": "Up"}
