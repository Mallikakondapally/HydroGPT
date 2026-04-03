from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.user import User
from app.models.water import WaterLog
from datetime import date

router = APIRouter(prefix="/social", tags=["social"])

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    today = date.today()
    
    # Subquery to calculate effective hydration per user for today
    users = db.query(User).all()
    leaderboard = []
    
    for user in users:
        # Calculate daily goal
        goal = user.custom_daily_goal_ml or int(user.weight_kg * 35)
        
        # Get user's today logs
        logs = db.query(WaterLog).filter(
            func.date(WaterLog.timestamp) == today,
            WaterLog.user_id == user.id
        ).all()
        
        total_effective = sum(log.amount_ml * log.hydration_efficiency for log in logs)
        percentage = min(int((total_effective / goal) * 100), 200) if goal > 0 else 0
        
        leaderboard.append({
            "name": user.name,
            "percentage": percentage,
            "total_ml": int(total_effective)
        })
    
    # Sort by percentage descending
    leaderboard.sort(key=lambda x: x["percentage"], reverse=True)
    
    return leaderboard[:10] # Top 10
