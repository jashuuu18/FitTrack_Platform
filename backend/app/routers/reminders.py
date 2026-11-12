from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Reminder, User
from app.schemas import (
    ReminderCreate,
    ReminderUpdate,
    ReminderResponse,
)


router = APIRouter(
    prefix="/api/v1/reminders",
    tags=["Reminders"]
)


def convert_to_utc_naive(value: datetime) -> datetime:
    """
    Convert an incoming datetime to UTC without timezone information.
    This keeps comparisons compatible with SQLite DateTime values.
    """
    if value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)

    # Treat a datetime without timezone information as UTC.
    return value


@router.post(
    "/",
    response_model=ReminderResponse,
    status_code=status.HTTP_201_CREATED
)
def create_reminder(
    reminder_data: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reminder = Reminder(
        user_id=current_user.id,
        title=reminder_data.title.strip(),
        message=reminder_data.message.strip(),
        reminder_type=reminder_data.reminder_type,
        scheduled_at=convert_to_utc_naive(
            reminder_data.scheduled_at
        ),
        is_active=True,
        is_sent=False
    )

    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    return reminder


@router.get(
    "/",
    response_model=list[ReminderResponse]
)
def get_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Reminder)
        .filter(Reminder.user_id == current_user.id)
        .order_by(Reminder.scheduled_at.asc())
        .all()
    )


@router.patch(
    "/{reminder_id}",
    response_model=ReminderResponse
)
def update_reminder(
    reminder_id: int,
    reminder_data: ReminderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reminder = (
        db.query(Reminder)
        .filter(
            Reminder.id == reminder_id,
            Reminder.user_id == current_user.id
        )
        .first()
    )

    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )

    update_data = reminder_data.model_dump(exclude_unset=True)

    if "title" in update_data and update_data["title"] is not None:
        update_data["title"] = update_data["title"].strip()

    if "message" in update_data and update_data["message"] is not None:
        update_data["message"] = update_data["message"].strip()

    if (
        "scheduled_at" in update_data
        and update_data["scheduled_at"] is not None
    ):
        update_data["scheduled_at"] = convert_to_utc_naive(
            update_data["scheduled_at"]
        )

        # Editing the schedule allows the reminder to be sent again.
        reminder.is_sent = False
        reminder.is_active = True

    for field, value in update_data.items():
        setattr(reminder, field, value)

    db.commit()
    db.refresh(reminder)

    return reminder


@router.delete("/{reminder_id}")
def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reminder = (
        db.query(Reminder)
        .filter(
            Reminder.id == reminder_id,
            Reminder.user_id == current_user.id
        )
        .first()
    )

    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )

    db.delete(reminder)
    db.commit()

    return {
        "message": "Reminder deleted successfully"
    }