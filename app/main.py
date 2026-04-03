from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import os
from app.db.database import engine, Base
from app.routes import water, ai, user, social
from dotenv import load_dotenv

# Load .env
load_dotenv()

from app.models.user import User
from app.models.water import WaterLog

# Create tables in correct order
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HydroGPT Ultra")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_index():
    return FileResponse('static/index.html')

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Include Routers
app.include_router(user.router)
app.include_router(water.router)
app.include_router(ai.router)
app.include_router(social.router)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
