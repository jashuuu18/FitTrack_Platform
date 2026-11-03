
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
# USER MODEL - MODULE 1
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
# WORKOUT MODEL - MODULE 2
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
# PROGRESS MODEL - MODULE 3
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
# GOAL MODEL - MODULE 4 
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
# NOTIFICATION MODEL - MODULE 5 
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