from datetime import datetime

from app.database import SessionLocal
from app.models import Reminder, Notification


def process_due_reminders():
    """
    Find reminders whose scheduled time has arrived.
    Create an in-app notification and mark each reminder as sent.
    Times in the database are stored as UTC-naive values.
    """

    db = SessionLocal()

    try:
        now = datetime.utcnow()

        due_reminders = (
            db.query(Reminder)
            .filter(
                Reminder.is_active.is_(True),
                Reminder.is_sent.is_(False),
                Reminder.scheduled_at <= now
            )
            .all()
        )

        for reminder in due_reminders:
            notification = Notification(
                user_id=reminder.user_id,
                title=reminder.title,
                message=reminder.message,
                is_read=False
            )

            db.add(notification)

            reminder.is_sent = True
            reminder.is_active = False

        if due_reminders:
            db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()