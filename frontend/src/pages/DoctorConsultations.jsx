
import { useEffect, useState } from "react";
import api from "../services/api";
import "./DoctorConsultations.css";

function DoctorConsultations() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [doctorResponse, appointmentResponse] =
        await Promise.all([
          api.get("/doctor-appointments/doctors"),
          api.get("/doctor-appointments/my-appointments")
        ]);

      setDoctors(doctorResponse.data);
      setAppointments(appointmentResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load doctor information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedDoctor) {
      setError("Please select a doctor.");
      return;
    }

    if (!scheduledAt) {
      setError("Please select an appointment date and time.");
      return;
    }

    const localDate = new Date(scheduledAt);

    if (localDate <= new Date()) {
      setError("Please select a future date and time.");
      return;
    }

    setBooking(true);

    try {
      await api.post("/doctor-appointments/book", {
        doctor_id: selectedDoctor.id,
        scheduled_at: localDate.toISOString(),
        reason: reason.trim() || null
      });

      setSuccess("Doctor appointment booked successfully!");

      setSelectedDoctor(null);
      setScheduledAt("");
      setReason("");

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to book your appointment."
      );
    } finally {
      setBooking(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.patch(
        `/doctor-appointments/${appointmentId}/cancel`
      );

      setSuccess("Appointment cancelled successfully.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to cancel appointment."
      );
    }
  };

  const getStatusClass = (status) => {
    if (status === "BOOKED") return "doctor-status-booked";
    if (status === "CANCELLED") return "doctor-status-cancelled";
    if (status === "COMPLETED") return "doctor-status-completed";
    return "";
  };

  if (loading) {
    return (
      <div className="doctor-page">
        <p>Loading doctor information...</p>
      </div>
    );
  }

  return (
    <div className="doctor-page">
      <div className="doctor-page-header">
        <div>
          <h1>Doctor Support</h1>
          <p>
            Browse doctors and manage your health appointments.
          </p>
        </div>

        <button
          className="doctor-refresh-button"
          onClick={loadData}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="doctor-alert error">
          {error}
        </div>
      )}

      {success && (
        <div className="doctor-alert success">
          {success}
        </div>
      )}

      <section className="doctor-section">
        <div className="doctor-section-heading">
          <h2>Available Doctors</h2>
          <span>{doctors.length} doctors available</span>
        </div>

        {doctors.length === 0 ? (
          <div className="doctor-empty">
            No doctors are currently available.
          </div>
        ) : (
          <div className="doctor-grid">
            {doctors.map((doctor) => (
              <div className="doctor-card" key={doctor.id}>
                <div className="doctor-avatar">👨‍⚕️</div>

                <h3>{doctor.full_name}</h3>
                <p className="doctor-specialization">
                  {doctor.specialization}
                </p>

                <p>{doctor.qualification}</p>

                <div className="doctor-details">
                  <span>
                    Experience: {doctor.experience_years} years
                  </span>

                  <strong>
                    ₹{Number(doctor.consultation_fee).toFixed(2)}
                  </strong>
                </div>

                <p className="doctor-bio">
                  {doctor.bio || "Doctor profile"}
                </p>

                <button
                  className="doctor-book-button"
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setError("");
                    setSuccess("");
                  }}
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedDoctor && (
        <section className="doctor-booking-card">
          <div className="doctor-section-heading">
            <h2>Book Appointment</h2>

            <button
              className="doctor-close-button"
              onClick={() => setSelectedDoctor(null)}
            >
              Close
            </button>
          </div>

          <p>
            Selected doctor: <strong>{selectedDoctor.full_name}</strong>
          </p>

          <form onSubmit={handleBooking}>
            <div className="doctor-form-field">
              <label>Appointment Date and Time</label>

              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) =>
                  setScheduledAt(e.target.value)
                }
                required
              />
            </div>

            <div className="doctor-form-field">
              <label>Reason for Appointment</label>

              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe the reason for your visit"
              />
            </div>

            <button
              type="submit"
              className="doctor-book-button"
              disabled={booking}
            >
              {booking ? "Booking..." : "Confirm Appointment"}
            </button>
          </form>
        </section>
      )}

      <section className="doctor-section doctor-history-section">
        <div className="doctor-section-heading">
          <h2>My Appointments</h2>
          <span>{appointments.length} total</span>
        </div>

        {appointments.length === 0 ? (
          <div className="doctor-empty">
            You have not booked any appointments yet.
          </div>
        ) : (
          <div className="doctor-appointment-list">
            {appointments.map((appointment) => (
              <div
                className="doctor-appointment-card"
                key={appointment.id}
              >
                <div>
                  <h3>{appointment.doctor?.full_name}</h3>

                  <p>
                    {appointment.doctor?.specialization}
                  </p>

                  <p>
                    Date:{" "}
                    {new Date(
                      appointment.scheduled_at
                    ).toLocaleString()}
                  </p>

                  <p>
                    Reason: {appointment.reason || "Not provided"}
                  </p>

                  <p>Booking ID: {appointment.id}</p>
                </div>

                <div className="doctor-appointment-actions">
                  <span
                    className={`doctor-status ${getStatusClass(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>

                  {appointment.status === "BOOKED" &&
                    new Date(appointment.scheduled_at) >
                      new Date() && (
                      <button
                        className="doctor-cancel-button"
                        onClick={() =>
                          cancelAppointment(appointment.id)
                        }
                      >
                        Cancel Appointment
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DoctorConsultations;
