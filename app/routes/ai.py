from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from sqlalchemy import func
from app.db.database import get_db
from app.models.water import WaterLog
from app.services.ai_service import generate_hydration_insights
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["ai"])

@router.get("/insights")
def get_ai_insights(user_id: int = 1, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return {"insights": "User profile not found. Please set up your profile first."}

    today = date.today()
    entries = db.query(WaterLog).filter(
        func.date(WaterLog.timestamp) == today,
        WaterLog.user_id == user_id
    ).all()
    total = sum(entry.amount_ml for entry in entries)
    
    # Calculate goal (copying logic briefly or importing it)
    daily_goal = db_user.custom_daily_goal_ml or int(db_user.weight_kg * 35)

    data = {
        "total_amount_ml": total,
        "entries": entries,
        "user_name": db_user.name,
        "daily_goal": daily_goal
    }
    
    insights = generate_hydration_insights(data)
    
    return {
        "insights": insights
    }
