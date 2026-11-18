
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Doctor, DoctorAppointment, Reminder, User
from app.schemas import (
    DoctorResponse,
    DoctorAppointmentCreate,
    DoctorAppointmentResponse
)
from app.diet_reminder_utils import add_reminder

router = APIRouter(
    prefix="/api/v1/doctor-appointments",
    tags=["Doctor Support & Appointments"]
)


@router.get(
    "/doctors",
    response_model=list[DoctorResponse]
)
def get_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Doctor)
        .filter(Doctor.is_available == True)
        .order_by(Doctor.full_name.asc())
        .all()
    )


@router.get(
    "/doctors/{doctor_id}",
    response_model=DoctorResponse
)
def get_doctor_details(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.id == doctor_id,
            Doctor.is_available == True
        )
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found or unavailable."
        )

    return doctor


@router.post(
    "/book",
    response_model=DoctorAppointmentResponse,
    status_code=201
)
def book_doctor_appointment(
    appointment_data: DoctorAppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.id == appointment_data.doctor_id,
            Doctor.is_available == True
        )
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found or unavailable."
        )

    scheduled_at = appointment_data.scheduled_at

    # Convert timezone-aware input into server-local naive time.
    if scheduled_at.tzinfo is not None:
        scheduled_at = scheduled_at.astimezone().replace(
            tzinfo=None
        )

    if scheduled_at <= datetime.now():
        raise HTTPException(
            status_code=400,
            detail="Appointment date and time must be in the future."
        )

    existing_appointment = (
        db.query(DoctorAppointment)
        .filter(
            DoctorAppointment.doctor_id == doctor.id,
            DoctorAppointment.scheduled_at == scheduled_at,
            DoctorAppointment.status == "BOOKED"
        )
        .first()
    )

    if existing_appointment:
        raise HTTPException(
            status_code=409,
            detail=(
                "This doctor already has an appointment "
                "at the selected time. Please choose another time."
            )
        )

    appointment = DoctorAppointment(
        user_id=current_user.id,
        doctor_id=doctor.id,
        scheduled_at=scheduled_at,
        reason=appointment_data.reason,
        status="BOOKED"
    )

    db.add(appointment)
    db.flush()

    # Schedule reminders 24 hours and 1 hour before.
    reminder_offsets = [
        (24, "24 hours"),
        (1, "1 hour")
    ]

    for hours, label in reminder_offsets:
        reminder_time = scheduled_at - timedelta(hours=hours)

        if reminder_time > datetime.now():
            add_reminder(
                db=db,
                user_id=current_user.id,
                title="Doctor Appointment Reminder",
                message=(
                    f"Your appointment with Dr. {doctor.full_name} "
                    f"(booking ID: {appointment.id}) "
                    f"is scheduled in {label}. "
                    "Please be ready for your appointment."
                ),
                scheduled_at=reminder_time,
                reminder_type="doctor"
            )

    db.commit()
    db.refresh(appointment)

    return (
        db.query(DoctorAppointment)
        .options(joinedload(DoctorAppointment.doctor))
        .filter(DoctorAppointment.id == appointment.id)
        .first()
    )


@router.get(
    "/my-appointments",
    response_model=list[DoctorAppointmentResponse]
)
def get_my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(DoctorAppointment)
        .options(joinedload(DoctorAppointment.doctor))
        .filter(
            DoctorAppointment.user_id == current_user.id
        )
        .order_by(DoctorAppointment.scheduled_at.desc())
        .all()
    )


@router.patch(
    "/{appointment_id}/cancel",
    response_model=DoctorAppointmentResponse
)
def cancel_doctor_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appointment = (
        db.query(DoctorAppointment)
        .options(joinedload(DoctorAppointment.doctor))
        .filter(
            DoctorAppointment.id == appointment_id,
            DoctorAppointment.user_id == current_user.id
        )
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found."
        )

    if appointment.status != "BOOKED":
        raise HTTPException(
            status_code=400,
            detail="Only booked appointments can be cancelled."
        )

    if appointment.scheduled_at <= datetime.now():
        raise HTTPException(
            status_code=400,
            detail="An appointment that has already started cannot be cancelled."
        )

    appointment.status = "CANCELLED"

    # Delete unsent reminders belonging to this appointment.
    db.query(Reminder).filter(
        Reminder.user_id == current_user.id,
        Reminder.reminder_type == "doctor",
        Reminder.is_sent == False,
        Reminder.message.contains(
            f"booking ID: {appointment.id}"
        )
    ).delete(synchronize_session=False)

    db.commit()
    db.refresh(appointment)

    return (
        db.query(DoctorAppointment)
        .options(joinedload(DoctorAppointment.doctor))
        .filter(DoctorAppointment.id == appointment.id)
        .first()
    )
