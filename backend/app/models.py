
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