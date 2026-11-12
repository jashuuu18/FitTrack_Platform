
from sqlalchemy import (
    Column,
    Boolean,
    Text,
    Integer,
    String,
    Float,
    DateTime,
    Date,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint
)
from sqlalchemy.sql import func

from app.database import Base


# =================================
# USER MODEL 
# =================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String(50),
        unique=True,
        index=True,
        nullable=False
    )

    email = Column(
        String(120),
        unique=True,
        index=True,
        nullable=False
    )

    hashed_password = Column(
        String(255),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


# =================================
# WORKOUT MODEL 
# =================================

class Workout(Base):
    __tablename__ = "workouts"

    __table_args__ = (
        CheckConstraint(
            "duration > 0",
            name="check_workout_duration"
        ),
        CheckConstraint(
            "calories_burned >= 0",
            name="check_workout_calories"
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    workout_name = Column(
        String(100),
        nullable=False
    )

    category = Column(
        String(30),
        nullable=False
    )

    duration = Column(
        Integer,
        nullable=False
    )

    calories_burned = Column(
        Integer,
        nullable=False
    )

    workout_date = Column(
        Date,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


# =================================
# PROGRESS MODEL 
# =================================

class Progress(Base):
    __tablename__ = "progress"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "date",
            name="unique_user_daily_progress"
        ),

        CheckConstraint(
            "total_workouts >= 0",
            name="check_total_workouts"
        ),

        CheckConstraint(
            "total_calories >= 0",
            name="check_total_calories"
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    total_workouts = Column(
        Integer,
        default=0,
        nullable=False
    )

    total_calories = Column(
        Integer,
        default=0,
        nullable=False
    )

    date = Column(
        Date,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

#=============================
# GOAL MODEL  
#=============================

class Goal(Base):
    __tablename__ = "goals"

    __table_args__ = (
        CheckConstraint("target_value > 0", name="check_goal_target_positive"),
        CheckConstraint("current_value >= 0", name="check_goal_current_nonnegative"),
        CheckConstraint(
            "starting_value >= 0",
            name="check_goal_starting_nonnegative"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    goal_type = Column(String(50), nullable=False)

    target_value = Column(Float, nullable=False)

    current_value = Column(Float, nullable=False, default=0)

    starting_value = Column(Float, nullable=False, default=0)

    deadline = Column(Date, nullable=False)

    status = Column(String(20), nullable=False, default="IN_PROGRESS")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
#==========================
# NOTIFICATION MODEL 
#==========================
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)

    is_read = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )


# =================================
# WORKOUT PLAN MODEL 
# =================================

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    __table_args__ = (
        CheckConstraint(
            "length(title) > 0",
            name="check_workout_plan_title"
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    title = Column(
        String(150),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    scheduled_date = Column(
        Date,
        nullable=False,
        index=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

# =================================
# EXERCISE MODEL 
# =================================

class Exercise(Base):
    __tablename__ = "exercises"

    __table_args__ = (
        CheckConstraint(
            "duration > 0",
            name="check_exercise_duration"
        ),
        CheckConstraint(
            "category IN ('Cardio', 'Strength', 'Yoga')",
            name="check_exercise_category"
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(150),
        nullable=False,
        index=True
    )

    category = Column(
        String(30),
        nullable=False,
        index=True
    )

    description = Column(
        Text,
        nullable=False
    )

    duration = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
#=============================
# STREAK MODEL
#=============================
class Streak(Base):
    __tablename__ = "streaks"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True
    )

    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_workout_date = Column(Date, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(50), nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

#=============================
# USER BADGE MODEL
#=============================
class UserBadge(Base):
    __tablename__ = "user_badges"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "badge_id",
            name="unique_user_badge"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    badge_id = Column(
        Integer,
        ForeignKey("badges.id"),
        nullable=False,
        index=True
    )

    earned_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
#=============================
# MEAL MODEL   
#=============================
class Meal(Base):
    __tablename__ = "meals"

    __table_args__ = (
        CheckConstraint(
            "calories >= 0",
            name="check_meal_calories"
        ),
        CheckConstraint(
            "protein >= 0",
            name="check_meal_protein"
        ),
        CheckConstraint(
            "carbs >= 0",
            name="check_meal_carbs"
        ),
        CheckConstraint(
            "fats >= 0",
            name="check_meal_fats"
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    meal_type = Column(
        String(30),
        nullable=False
    )

    food_name = Column(
        String(150),
        nullable=False
    )

    calories = Column(
        Float,
        nullable=False,
        default=0
    )

    protein = Column(
        Float,
        nullable=False,
        default=0
    )

    carbs = Column(
        Float,
        nullable=False,
        default=0
    )

    fats = Column(
        Float,
        nullable=False,
        default=0
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
#=============================
# WATER TRACKING MODEL
#=============================
class WaterTracking(Base):
    __tablename__ = "water_tracking"

    __table_args__ = (
        CheckConstraint(
            "quantity > 0",
            name="check_water_quantity_positive"
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    date = Column(
        Date,
        nullable=False,
        index=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
#=============================
# WORKOUT SESSION MODEL
#=============================
class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    __table_args__ = (
        CheckConstraint(
            "duration_seconds >= 0",
            name="check_session_duration_nonnegative"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    workout_name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)

    started_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    ended_at = Column(DateTime(timezone=True), nullable=True)

    duration_seconds = Column(
        Integer,
        nullable=False,
        default=0
    )

    status = Column(
        String(20),
        nullable=False,
        default="active"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

#=============================
#  MODEL
#=============================
class FitnessProviderConnection(Base):
    __tablename__ = "fitness_provider_connections"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "provider",
            name="uq_user_fitness_provider"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    provider = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False, default="connected")

    connected_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )


class ExternalActivity(Base):
    __tablename__ = "external_activities"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "provider",
            "external_record_id",
            name="uq_external_activity_record"
        ),
        CheckConstraint(
            "duration_seconds > 0",
            name="check_external_activity_duration"
        ),
        CheckConstraint(
            "calories_burned >= 0",
            name="check_external_activity_calories"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    provider = Column(String(50), nullable=False)
    external_record_id = Column(String(150), nullable=False)

    activity_type = Column(String(100), nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    calories_burned = Column(Float, nullable=False, default=0)

    steps = Column(Integer, nullable=True)
    distance_meters = Column(Float, nullable=True)

    started_at = Column(DateTime(timezone=True), nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
#=============================
# REMINDER MODEL
#=============================
class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)

    reminder_type = Column(String(30), nullable=False, default="general")

    # Store scheduled_at as UTC without timezone information.
    scheduled_at = Column(DateTime, nullable=False, index=True)

    is_active = Column(Boolean, nullable=False, default=True)
    is_sent = Column(Boolean, nullable=False, default=False)

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )