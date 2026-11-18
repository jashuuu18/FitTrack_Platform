
import json
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Subscription, UserSubscription, User
from app.schemas import (
    SubscriptionResponse,
    UserSubscriptionResponse
)
from app.diet_reminder_utils import (
    create_subscription_expiry_reminders
)

router = APIRouter(
    prefix="/api/v1/subscriptions",
    tags=["Subscription Management"]
)


def format_subscription(plan):
    return {
        "id": plan.id,
        "name": plan.name,
        "price": plan.price,
        "duration": plan.duration,
        "description": plan.description,
        "features": json.loads(plan.features),
        "is_active": plan.is_active
    }


def format_user_subscription(user_subscription):
    return {
        "id": user_subscription.id,
        "user_id": user_subscription.user_id,
        "subscription_id": user_subscription.subscription_id,
        "start_date": user_subscription.start_date,
        "end_date": user_subscription.end_date,
        "status": user_subscription.status,
        "subscription": format_subscription(
            user_subscription.subscription
        )
    }


@router.get("/", response_model=list[SubscriptionResponse])
def get_subscriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plans = (
        db.query(Subscription)
        .filter(Subscription.is_active == True)
        .order_by(Subscription.price.asc())
        .all()
    )

    return [format_subscription(plan) for plan in plans]


@router.get("/current", response_model=UserSubscriptionResponse)
def get_current_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now()

    current = (
        db.query(UserSubscription)
        .options(joinedload(UserSubscription.subscription))
        .filter(
            UserSubscription.user_id == current_user.id,
            UserSubscription.status == "ACTIVE"
        )
        .order_by(UserSubscription.created_at.desc())
        .first()
    )

    if not current:
        raise HTTPException(
            status_code=404,
            detail="You do not have an active subscription."
        )

    if current.end_date <= now:
        current.status = "EXPIRED"
        db.commit()

        raise HTTPException(
            status_code=404,
            detail="Your subscription has expired."
        )

    return format_user_subscription(current)


@router.get("/history", response_model=list[UserSubscriptionResponse])
def get_subscription_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = (
        db.query(UserSubscription)
        .options(joinedload(UserSubscription.subscription))
        .filter(UserSubscription.user_id == current_user.id)
        .order_by(UserSubscription.created_at.desc())
        .all()
    )

    now = datetime.now()

    for record in records:
        if record.status == "ACTIVE" and record.end_date <= now:
            record.status = "EXPIRED"

    db.commit()

    return [
        format_user_subscription(record)
        for record in records
    ]


@router.post(
    "/{subscription_id}/subscribe",
    response_model=UserSubscriptionResponse
)
def subscribe_to_plan(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = (
        db.query(Subscription)
        .filter(
            Subscription.id == subscription_id,
            Subscription.is_active == True
        )
        .first()
    )

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Subscription plan not found."
        )

    now = datetime.now()

    active_records = (
        db.query(UserSubscription)
        .filter(
            UserSubscription.user_id == current_user.id,
            UserSubscription.status == "ACTIVE"
        )
        .all()
    )

    for record in active_records:
        record.status = (
            "EXPIRED" if record.end_date <= now
            else "CANCELLED"
        )

    new_record = UserSubscription(
        user_id=current_user.id,
        subscription_id=plan.id,
        start_date=now,
        end_date=now + timedelta(days=plan.duration),
        status="ACTIVE"
    )

    db.add(new_record)
    db.flush()

    # Load the plan relationship before scheduling.
    new_record.subscription = plan

    # Automatically create expiry reminders.
    create_subscription_expiry_reminders(
        db,
        new_record
    )

    db.commit()
    db.refresh(new_record)

    new_record = (
        db.query(UserSubscription)
        .options(joinedload(UserSubscription.subscription))
        .filter(UserSubscription.id == new_record.id)
        .first()
    )

    return format_user_subscription(new_record)
