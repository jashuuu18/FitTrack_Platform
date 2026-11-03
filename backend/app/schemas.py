
from datetime import datetime, date
from typing import Literal

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ConfigDict
)


# =================================
# USER SCHEMAS - MODULE 1
# =================================

class UserCreate(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=50
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=72
    )


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# =================================
# WORKOUT SCHEMAS - MODULE 2
# =================================

class WorkoutCreate(BaseModel):
    workout_name: str = Field(
        min_length=2,
        max_length=100
    )

    category: Literal[
        "Cardio",
        "Strength",
        "Yoga"
    ]

    duration: int = Field(
        gt=0,
        le=1440
    )

    calories_burned: int = Field(
        ge=0,
        le=100000
    )

    workout_date: date


class WorkoutResponse(BaseModel):
    id: int
    user_id: int
    workout_name: str
    category: str
    duration: int
    calories_burned: int
    workout_date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =================================
# PROGRESS SCHEMAS - MODULE 3
# =================================

class ProgressResponse(BaseModel):
    id: int
    user_id: int
    total_workouts: int
    total_calories: int
    date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

#================================
# GOAL SCHEMAS - MODULE 4
#================================

class GoalCreate(BaseModel):
    goal_type: Literal["Weight Loss", "Muscle Gain", "Steps"]

    target_value: float = Field(gt=0)

    current_value: float = Field(ge=0)

    deadline: date


class GoalUpdate(BaseModel):
    goal_type: Literal["Weight Loss", "Muscle Gain", "Steps"]

    target_value: float = Field(gt=0)

    current_value: float = Field(ge=0)

    deadline: date


class GoalProgressUpdate(BaseModel):
    current_value: float = Field(ge=0)


class GoalResponse(BaseModel):
    id: int
    user_id: int
    goal_type: str
    target_value: float
    current_value: float
    starting_value: float
    deadline: date
    status: str
    progress_percentage: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
