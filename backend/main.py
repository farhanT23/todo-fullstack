import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from config import BASE_PATH, app_settings

from modules.user import router as user_router
from modules.todos import router as todo_router
from utils import lifespan
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(lifespan=lifespan.lifespan,
              version=app_settings.app_version, 
              title=app_settings.app_name)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or "*" for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(todo_router)




@app.get("/health")
async def root():
    return {"message": "Up"}
