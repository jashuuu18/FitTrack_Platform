
from datetime import datetime, date as DateType
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

    workout_date: DateType


class WorkoutResponse(BaseModel):
    id: int
    user_id: int
    workout_name: str
    category: str
    duration: int
    calories_burned: int
    workout_date: DateType
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
    date: DateType
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =================================
# GOAL SCHEMAS
# =================================

class GoalCreate(BaseModel):
    goal_type: Literal[
        "Weight Loss",
        "Muscle Gain",
        "Steps"
    ]

    target_value: float = Field(gt=0)

    current_value: float = Field(ge=0)

    deadline: DateType


class GoalUpdate(BaseModel):
    goal_type: Literal[
        "Weight Loss",
        "Muscle Gain",
        "Steps"
    ]

    target_value: float = Field(gt=0)

    current_value: float = Field(ge=0)

    deadline: DateType


class GoalProgressUpdate(BaseModel):
    current_value: float = Field(ge=0)


class GoalResponse(BaseModel):
    id: int
    user_id: int
    goal_type: str
    target_value: float
    current_value: float
    starting_value: float
    deadline: DateType
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

    scheduled_date: DateType


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

    scheduled_date: DateType | None = None


class WorkoutPlanResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str | None
    scheduled_date: DateType
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
    workout_date: DateType = Field(
        default_factory=DateType.today
    )

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
    workout_date: DateType

    model_config = ConfigDict(from_attributes=True)


# =================================
# MEAL SCHEMAS
# =================================

class MealCreate(BaseModel):
    meal_type: Literal[
        "Breakfast",
        "Lunch",
        "Dinner",
        "Snacks"
    ]

    food_name: str = Field(
        min_length=2,
        max_length=150
    )

    calories: float = Field(
        ge=0,
        le=10000
    )

    protein: float = Field(
        ge=0,
        le=1000
    )

    carbs: float = Field(
        ge=0,
        le=1000
    )

    fats: float = Field(
        ge=0,
        le=1000
    )


class MealResponse(BaseModel):
    id: int
    user_id: int
    meal_type: str
    food_name: str
    calories: float
    protein: float
    carbs: float
    fats: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NutritionSummary(BaseModel):
    selected_date: str
    total_meals: int
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fats: float


# =================================
# WATER TRACKING SCHEMAS
# =================================

class WaterTrackingCreate(BaseModel):
    quantity: int = Field(
        gt=0,
        le=10000
    )

    date: DateType | None = None


class WaterTrackingResponse(BaseModel):
    id: int
    user_id: int
    quantity: int
    date: DateType
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WaterSummaryResponse(BaseModel):
    selected_date: DateType
    total_intake: int
    daily_goal: int
    remaining: int
    progress_percentage: float
    total_entries: int

#===============================

class ExerciseSuggestionItem(BaseModel):
    id: int
    name: str
    category: str
    description: str | None = None
    duration: int


class WorkoutSuggestionsResponse(BaseModel):
    goal_focus: str
    reasoning: str
    weekly_tip: str
    current_streak: int
    recent_workouts_count: int
    recommendations: list[ExerciseSuggestionItem]
#================================   
# WORKOUT SESSION SCHEMAS
#===============================
class WorkoutSessionCreate(BaseModel):
    workout_name: str = Field(min_length=2, max_length=150)
    category: Literal["Cardio", "Strength", "Yoga", "Other"]


class WorkoutSessionFinish(BaseModel):
    duration_seconds: int = Field(ge=1, le=86400)


class WorkoutSessionResponse(BaseModel):
    id: int
    user_id: int
    workout_name: str
    category: str
    started_at: datetime
    ended_at: datetime | None
    duration_seconds: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
#=============================
# SCHEMAS
#=============================
FitnessProvider = Literal["health_connect", "apple_health"]


class FitnessProviderConnectionResponse(BaseModel):
    id: int
    user_id: int
    provider: FitnessProvider
    status: str
    connected_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExternalActivityImport(BaseModel):
    provider: FitnessProvider
    external_record_id: str = Field(min_length=1, max_length=150)
    activity_type: str = Field(min_length=2, max_length=100)
    duration_seconds: int = Field(gt=0, le=86400)
    calories_burned: float = Field(ge=0, le=100000)
    steps: int | None = Field(default=None, ge=0)
    distance_meters: float | None = Field(default=None, ge=0)
    started_at: datetime


class ExternalActivityResponse(BaseModel):
    id: int
    user_id: int
    provider: FitnessProvider
    external_record_id: str
    activity_type: str
    duration_seconds: int
    calories_burned: float
    steps: int | None
    distance_meters: float | None
    started_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
    
#=============================
# REMINDER SCHEMAS
#=============================
ReminderType = Literal[
    "workout",
    "water",
    "meal",
    "goal",
    "general"
]


class ReminderCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    message: str = Field(min_length=1)
    reminder_type: ReminderType = "general"
    scheduled_at: datetime


class ReminderUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=150)
    message: str | None = Field(default=None, min_length=1)
    reminder_type: ReminderType | None = None
    scheduled_at: datetime | None = None
    is_active: bool | None = None


class ReminderResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    reminder_type: str
    scheduled_at: datetime
    is_active: bool
    is_sent: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)