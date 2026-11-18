
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models import (
    User,
    Nutritionist,
    NutritionistConsultation,
    UserSubscription,
    Reminder
)
from app.schemas import (
    NutritionistResponse,
    ConsultationCreate,
    ConsultationResponse
)
from app.diet_reminder_utils import (
    create_consultation_reminders
)

router = APIRouter(
    prefix="/api/v1/nutritionist-consultations",
    tags=["Nutritionist Consultations"]
)


def get_active_premium_subscription(db: Session, user_id: int):
    now = datetime.now()

    records = (
        db.query(UserSubscription)
        .options(joinedload(UserSubscription.subscription))
        .filter(
            UserSubscription.user_id == user_id,
            UserSubscription.status == "ACTIVE"
        )
        .order_by(UserSubscription.created_at.desc())
        .all()
    )

    for record in records:
        if record.end_date <= now:
            record.status = "EXPIRED"
            continue

        if record.subscription.name in ["Premium", "Pro"]:
            db.commit()
            return record

    db.commit()
    return None


@router.get(
    "/nutritionists",
    response_model=list[NutritionistResponse]
)
def get_nutritionists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Nutritionist)
        .filter(Nutritionist.is_available == True)
        .order_by(Nutritionist.full_name.asc())
        .all()
    )


@router.post(
    "/book",
    response_model=ConsultationResponse
)
def book_consultation(
    booking: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only Premium and Pro users can book.
    active_subscription = get_active_premium_subscription(
        db,
        current_user.id
    )

    if not active_subscription:
        raise HTTPException(
            status_code=403,
            detail=(
                "An active Premium or Pro subscription is required "
                "to book a nutritionist consultation."
            )
        )

    nutritionist = (
        db.query(Nutritionist)
        .filter(
            Nutritionist.id == booking.nutritionist_id,
            Nutritionist.is_available == True
        )
        .first()
    )

    if not nutritionist:
        raise HTTPException(
            status_code=404,
            detail="Nutritionist not found or unavailable."
        )

    scheduled_at = booking.scheduled_at

    if scheduled_at.tzinfo is not None:
        scheduled_at = scheduled_at.astimezone().replace(
            tzinfo=None
        )

    if scheduled_at <= datetime.now():
        raise HTTPException(
            status_code=400,
            detail="Consultation date and time must be in the future."
        )

    existing_booking = (
        db.query(NutritionistConsultation)
        .filter(
            NutritionistConsultation.nutritionist_id == nutritionist.id,
            NutritionistConsultation.scheduled_at == scheduled_at,
            NutritionistConsultation.status == "BOOKED"
        )
        .first()
    )

    if existing_booking:
        raise HTTPException(
            status_code=409,
            detail=(
                "This consultation time is already booked. "
                "Please choose another time."
            )
        )

    new_booking = NutritionistConsultation(
        user_id=current_user.id,
        nutritionist_id=nutritionist.id,
        scheduled_at=scheduled_at,
        notes=booking.notes,
        status="BOOKED"
    )

    db.add(new_booking)
    db.flush()

    # Automatically schedule consultation reminders.
    create_consultation_reminders(
        db,
        new_booking
    )

    db.commit()
    db.refresh(new_booking)

    result = (
        db.query(NutritionistConsultation)
        .options(joinedload(NutritionistConsultation.nutritionist))
        .filter(
            NutritionistConsultation.id == new_booking.id
        )
        .first()
    )

    return result


@router.get(
    "/my-bookings",
    response_model=list[ConsultationResponse]
)
def get_my_consultations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(NutritionistConsultation)
        .options(joinedload(NutritionistConsultation.nutritionist))
        .filter(
            NutritionistConsultation.user_id == current_user.id
        )
        .order_by(NutritionistConsultation.scheduled_at.desc())
        .all()
    )


@router.patch(
    "/{consultation_id}/cancel",
    response_model=ConsultationResponse
)
def cancel_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    consultation = (
        db.query(NutritionistConsultation)
        .options(joinedload(NutritionistConsultation.nutritionist))
        .filter(
            NutritionistConsultation.id == consultation_id,
            NutritionistConsultation.user_id == current_user.id
        )
        .first()
    )

    if not consultation:
        raise HTTPException(
            status_code=404,
            detail="Consultation booking not found."
        )

    if consultation.status != "BOOKED":
        raise HTTPException(
            status_code=400,
            detail="Only booked consultations can be cancelled."
        )

    if consultation.scheduled_at <= datetime.now():
        raise HTTPException(
            status_code=400,
            detail=(
                "A consultation that has already started "
                "cannot be cancelled."
            )
        )

    consultation.status = "CANCELLED"

    # Remove pending reminders for this booking.
    db.query(Reminder).filter(
        Reminder.user_id == current_user.id,
        Reminder.reminder_type == "consultation",
        Reminder.is_sent == False,
        Reminder.message.contains(
            f"booking ID: {consultation.id}"
        )
    ).delete(synchronize_session=False)

    db.commit()
    db.refresh(consultation)

    return consultation
