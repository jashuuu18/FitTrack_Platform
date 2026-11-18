
from datetime import datetime, timedelta, timezone

from app.models import Reminder


def to_utc_naive(value: datetime) -> datetime:
    """
    Convert local or timezone-aware datetimes into
    UTC-naive datetimes for the Reminder table.
    """

    if value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(
            tzinfo=None
        )

    # Treat naive dates as the server's local time.
    return value.astimezone(timezone.utc).replace(
        tzinfo=None
    )


def add_reminder(
    db,
    user_id: int,
    title: str,
    message: str,
    scheduled_at: datetime,
    reminder_type: str
):
    reminder = Reminder(
        user_id=user_id,
        title=title,
        message=message,
        reminder_type=reminder_type,
        scheduled_at=to_utc_naive(scheduled_at),
        is_active=True,
        is_sent=False
    )

    db.add(reminder)
    return reminder


def create_subscription_expiry_reminders(
    db,
    user_subscription
):
    end_date = user_subscription.end_date
    now = datetime.now()

    reminder_offsets = [
        (3, "3 days"),
        (1, "1 day")
    ]

    for days, label in reminder_offsets:
        reminder_time = end_date - timedelta(days=days)

        if reminder_time > now:
            add_reminder(
                db=db,
                user_id=user_subscription.user_id,
                title="Subscription Expiry Reminder",
                message=(
                    f"Your {user_subscription.subscription.name} "
                    f"subscription will expire in {label}. "
                    "Renew your subscription to continue enjoying "
                    "your benefits."
                ),
                scheduled_at=reminder_time,
                reminder_type="subscription"
            )


def create_consultation_reminders(
    db,
    consultation
):
    scheduled_at = consultation.scheduled_at
    now = datetime.now()

    reminder_offsets = [
        (24, "24 hours"),
        (1, "1 hour")
    ]

    for hours, label in reminder_offsets:
        reminder_time = scheduled_at - timedelta(hours=hours)

        if reminder_time > now:
            add_reminder(
                db=db,
                user_id=consultation.user_id,
                title="Nutritionist Consultation Reminder",
                message=(
                    f"Your nutritionist consultation "
                    f"(booking ID: {consultation.id}) "
                    f"is scheduled in {label}. "
                    "Please be ready for your appointment."
                ),
                scheduled_at=reminder_time,
                reminder_type="consultation"
            )
