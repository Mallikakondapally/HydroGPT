from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class WaterLog(Base):
    __tablename__ = "water_logs"

    id = Column(Integer, primary_key=True, index=True)
    amount_ml = Column(Integer)
    drink_type = Column(String, default="Water")
    hydration_efficiency = Column(Float, default=1.0)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # ForeignKey to link with User
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationship: Each log belongs to a specific user
    user = relationship("User", back_populates="logs")
