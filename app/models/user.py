from sqlalchemy import Column, Integer, String, Float, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    weight_kg = Column(Float, default=70.0)
    custom_daily_goal_ml = Column(Integer, nullable=True)
    reminder_enabled = Column(Boolean, default=True)

    # Relationship: One user has many water logs
    logs = relationship("WaterLog", back_populates="user")
