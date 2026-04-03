from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate, UserLogin
from app.services.auth_service import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/user", tags=["user"])

def calculate_goal(user: User) -> int:
    if user.custom_daily_goal_ml:
        return user.custom_daily_goal_ml
    return int(user.weight_kg * 35)

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pw = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_pw,
        name=user.name,
        weight_kg=user.weight_kg
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    setattr(new_user, 'daily_goal_ml', calculate_goal(new_user))
    return new_user

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    setattr(db_user, 'daily_goal_ml', calculate_goal(db_user))
    return db_user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.name:
        db_user.name = user_update.name
    if user_update.weight_kg is not None:
        db_user.weight_kg = user_update.weight_kg
    if user_update.custom_daily_goal_ml is not None:
        db_user.custom_daily_goal_ml = user_update.custom_daily_goal_ml
    if user_update.reminder_enabled is not None:
        db_user.reminder_enabled = user_update.reminder_enabled
        
    db.commit()
    db.refresh(db_user)
    
    setattr(db_user, 'daily_goal_ml', calculate_goal(db_user))
    return db_user
