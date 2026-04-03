from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class WaterLogBase(BaseModel):
    amount_ml: int
    user_id: Optional[int] = 1
    drink_type: str = "Water"

class WaterLogCreate(WaterLogBase):
    pass

class WaterLogResponse(WaterLogBase):
    id: int
    hydration_efficiency: float
    timestamp: datetime

    class Config:
        from_attributes = True
