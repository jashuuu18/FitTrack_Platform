
from datetime import datetime, timedelta

from app.database import SessionLocal
from app.models import (
    Reminder,
    Notification,
    UserSubscription,
    NutritionistConsultation
)


def create_notification_if_new(db, user_id, title, message):
    """Prevent duplicate automatic notifications."""

    existing = (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.title == title,
            Notification.message == message
        )
        .first()
    )

    if existing:
        return False

    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        is_read=False
    )

    db.add(notification)
    return True


def process_user_due_reminders(db):
    """
    Process user-created reminders.
    Reminder scheduled_at values are stored as UTC-naive.
    """

    now_utc = datetime.utcnow()

    due_reminders = (
        db.query(Reminder)
        .filter(
            Reminder.is_active.is_(True),
            Reminder.is_sent.is_(False),
            Reminder.scheduled_at <= now_utc
        )
        .all()
    )

    for reminder in due_reminders:
        create_notification_if_new(
            db,
            reminder.user_id,
            reminder.title,
            reminder.message
        )

        reminder.is_sent = True
        reminder.is_active = False

    return len(due_reminders)


def process_subscription_expiry_notifications(db):
    """Notify users when an active subscription is nearing expiry."""

    now = datetime.now()
    three_days_from_now = now + timedelta(days=3)
    one_day_from_now = now + timedelta(days=1)

    active_subscriptions = (
        db.query(UserSubscription)
        .filter(
            UserSubscription.status == "ACTIVE",
            UserSubscription.end_date > now,
            UserSubscription.end_date <= three_days_from_now
        )
        .all()
    )

    notifications_created = 0

    for record in active_subscriptions:
        plan_name = record.subscription.name
        expiry_date = record.end_date.strftime("%d-%m-%Y")

        if record.end_date <= one_day_from_now:
            reminder_type = "1-day"
            title = "Subscription Expiring Soon!"
            message = (
                f"Your {plan_name} subscription will expire within "
                f"24 hours, on {expiry_date}. Renew your plan to "
                "continue enjoying its benefits."
            )
        else:
            reminder_type = "3-day"
            title = "Subscription Expiry Reminder"
            message = (
                f"Your {plan_name} subscription will expire within "
                f"3 days, on {expiry_date}. Plan your renewal to "
                "avoid interruption."
            )

        unique_message = (
            f"{message} [Subscription ID: {record.id}; "
            f"Alert: {reminder_type}]"
        )

        if create_notification_if_new(
            db,
            record.user_id,
            title,
            unique_message
        ):
            notifications_created += 1

    return notifications_created


def process_consultation_notifications(db):
    """Notify users about upcoming booked consultations."""

    now = datetime.now()
    twenty_four_hours_from_now = now + timedelta(hours=24)
    one_hour_from_now = now + timedelta(hours=1)

    upcoming_consultations = (
        db.query(NutritionistConsultation)
        .filter(
            NutritionistConsultation.status == "BOOKED",
            NutritionistConsultation.scheduled_at > now,
            NutritionistConsultation.scheduled_at <= twenty_four_hours_from_now
        )
        .all()
    )

    notifications_created = 0

    for consultation in upcoming_consultations:
        scheduled_time = consultation.scheduled_at.strftime(
            "%d-%m-%Y at %I:%M %p"
        )

        if consultation.scheduled_at <= one_hour_from_now:
            alert_type = "1-hour"
            title = "Consultation Starting Soon!"
            message = (
                f"Your nutritionist consultation is scheduled for "
                f"{scheduled_time}. Your appointment is within one hour."
            )
        else:
            alert_type = "24-hour"
            title = "Upcoming Nutritionist Consultation"
            message = (
                f"You have a nutritionist consultation scheduled for "
                f"{scheduled_time}. Your appointment is within 24 hours."
            )

        unique_message = (
            f"{message} [Consultation ID: {consultation.id}; "
            f"Alert: {alert_type}]"
        )

        if create_notification_if_new(
            db,
            consultation.user_id,
            title,
            unique_message
        ):
            notifications_created += 1

    return notifications_created


def process_due_reminders():
    """
    Main scheduler function.
    Runs every 30 seconds from main.py.
    """

    db = SessionLocal()

    try:
        reminder_count = process_user_due_reminders(db)

        subscription_count = (
            process_subscription_expiry_notifications(db)
        )

        consultation_count = (
            process_consultation_notifications(db)
        )

        db.commit()

        if (
            reminder_count
            or subscription_count
            or consultation_count
        ):
            print(
                "FitTrack notifications processed: "
                f"Reminders={reminder_count}, "
                f"Subscriptions={subscription_count}, "
                f"Consultations={consultation_count}"
            )

    except Exception as error:
        db.rollback()
        print(f"Reminder scheduler error: {error}")
        raise

    finally:
        db.close()
