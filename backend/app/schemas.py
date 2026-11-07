
from datetime import datetime, date
from typing import Literal

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ConfigDict
)


# =================================
# USER SCHEMAS 
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
# WORKOUT SCHEMAS 
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
# PROGRESS SCHEMAS 
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
# GOAL SCHEMAS 
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

# =================================
# WORKOUT PLAN SCHEMAS 
# =================================

class WorkoutPlanCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=2,
        max_length=150
    )

    description: str | None = Field(
        default=None,
        max_length=2000
    )

    scheduled_date: date


class WorkoutPlanUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=2,
        max_length=150
    )

    description: str | None = Field(
        default=None,
        max_length=2000
    )

    scheduled_date: date | None = None


class WorkoutPlanResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str | None
    scheduled_date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# =================================
# EXERCISE SCHEMAS 
# =================================

class ExerciseResponse(BaseModel):
    id: int
    name: str
    category: str
    description: str
    duration: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExerciseWorkoutCreate(BaseModel):
    workout_date: date = Field(default_factory=date.today)

    duration: int | None = Field(
        default=None,
        gt=0
    )

    calories_burned: int = Field(
        default=0,
        ge=0
    )


class ExerciseWorkoutResponse(BaseModel):
    id: int
    user_id: int
    workout_name: str
    category: str
    duration: int
    calories_burned: int
    workout_date: date

    model_config = ConfigDict(from_attributes=True)
