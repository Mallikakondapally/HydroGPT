from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from sqlalchemy import func
from app.db.database import get_db
from app.models.water import WaterLog
from app.schemas.water import WaterLogCreate, WaterLogResponse
from typing import List

router = APIRouter(prefix="/water", tags=["water"])

# Hydration Efficiency Mapping
EFFICIENCY_MAP = {
    "Water": 1.0,
    "Coffee": 0.8,
    "Tea": 0.85,
    "Juice": 0.9,
    "Soda": 0.7
}

@router.post("/add", response_model=WaterLogResponse)
def add_water(water: WaterLogCreate, db: Session = Depends(get_db)):
    efficiency = EFFICIENCY_MAP.get(water.drink_type, 1.0)
    db_water = WaterLog(
        amount_ml=water.amount_ml, 
        user_id=water.user_id or 1,
        drink_type=water.drink_type,
        hydration_efficiency=efficiency
    )
    db.add(db_water)
    db.commit()
    db.refresh(db_water)
    return db_water

@router.get("/today")
def get_today_intake(user_id: int = 1, db: Session = Depends(get_db)):
    today = date.today()
    entries = db.query(WaterLog).filter(
        func.date(WaterLog.timestamp) == today,
        WaterLog.user_id == user_id
    ).all()
    
    # Calculate raw total and effective total
    total_raw = sum(entry.amount_ml for entry in entries)
    total_effective = sum(entry.amount_ml * entry.hydration_efficiency for entry in entries)
    
    return {
        "total_amount_ml": int(total_effective),
        "raw_total_ml": total_raw,
        "user_id": user_id,
        "entries": entries
    }

@router.delete("/{log_id}")
def delete_water_log(log_id: int, user_id: int, db: Session = Depends(get_db)):
    db_log = db.query(WaterLog).filter(WaterLog.id == log_id, WaterLog.user_id == user_id).first()
    if not db_log:
        return {"error": "Log not found"}
    db.delete(db_log)
    db.commit()
    return {"status": "deleted"}
