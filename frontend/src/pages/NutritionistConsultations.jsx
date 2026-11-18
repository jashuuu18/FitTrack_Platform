
import { useEffect, useState } from "react";
import  api  from "../services/api";
import "./NutritionistConsultations.css";

function NutritionistConsultations() {
  const [nutritionists, setNutritionists] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedNutritionist, setSelectedNutritionist] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [nutritionistResponse, bookingResponse] = await Promise.all([
        api.get("/nutritionist-consultations/nutritionists"),
        api.get("/nutritionist-consultations/my-bookings"),
      ]);

      setNutritionists(nutritionistResponse.data);
      setBookings(bookingResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load consultation information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBooking = async (event) => {
    event.preventDefault();

    if (!selectedNutritionist || !scheduledAt) {
      setError("Please select a nutritionist and consultation date.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      await api.post("/nutritionist-consultations/book", {
        nutritionist_id: selectedNutritionist.id,
        scheduled_at: `${scheduledAt}:00`,
        notes: notes.trim() || null,
      });

      setMessage("Your consultation has been booked successfully!");
      setSelectedNutritionist(null);
      setScheduledAt("");
      setNotes("");

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to book the consultation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (consultationId) => {
    if (!window.confirm("Are you sure you want to cancel this consultation?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.patch(
        `/nutritionist-consultations/${consultationId}/cancel`
      );

      setMessage("Consultation cancelled successfully.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to cancel this consultation."
      );
    }
  };

  if (loading) {
    return (
      <div className="consultation-page">
        Loading nutritionists and bookings...
      </div>
    );
  }

  return (
    <div className="consultation-page">
      <header className="consultation-header">
        <div>
          <span className="consultation-eyebrow">EXPERT NUTRITION SUPPORT</span>
          <h1>Nutritionist Consultations</h1>
          <p>
            Connect with nutrition professionals and plan your next step.
          </p>
        </div>
      </header>

      {message && <div className="consultation-success">{message}</div>}
      {error && <div className="consultation-error">{error}</div>}

      <section className="nutritionist-section">
        <div className="consultation-section-heading">
          <div>
            <h2>Available Nutritionists</h2>
            <p>Choose a professional for your consultation.</p>
          </div>
        </div>

        {nutritionists.length === 0 ? (
          <p className="consultation-empty">No nutritionists are available.</p>
        ) : (
          <div className="nutritionist-grid">
            {nutritionists.map((nutritionist) => (
              <article className="nutritionist-card" key={nutritionist.id}>
                <div className="nutritionist-avatar">👩‍⚕️</div>

                <h3>{nutritionist.full_name}</h3>
                <p className="nutritionist-specialization">
                  {nutritionist.specialization}
                </p>

                <div className="nutritionist-details">
                  <p>
                    <strong>Qualification:</strong>{" "}
                    {nutritionist.qualification}
                  </p>
                  <p>
                    <strong>Experience:</strong>{" "}
                    {nutritionist.experience_years} years
                  </p>
                  <p>
                    <strong>Consultation fee:</strong>{" "}
                    ₹{Number(nutritionist.consultation_fee).toLocaleString("en-IN")}
                  </p>
                </div>

                <p className="nutritionist-bio">{nutritionist.bio}</p>

                <button
                  className="consultation-book-button"
                  onClick={() => {
                    setSelectedNutritionist(nutritionist);
                    setMessage("");
                    setError("");
                  }}
                >
                  Book Consultation
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedNutritionist && (
        <section className="consultation-form-section">
          <h2>Book Your Consultation</h2>
          <p>
            Selected nutritionist:{" "}
            <strong>{selectedNutritionist.full_name}</strong>
          </p>

          <form onSubmit={handleBooking} className="consultation-form">
            <label htmlFor="scheduledAt">Choose date and time</label>
            <input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16)}
              onChange={(event) => setScheduledAt(event.target.value)}
              required
            />

            <label htmlFor="consultationNotes">Notes (optional)</label>
            <textarea
              id="consultationNotes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Tell the nutritionist about your goals or questions..."
              rows="4"
            />

            <div className="consultation-form-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>

              <button
                type="button"
                className="consultation-close-button"
                onClick={() => setSelectedNutritionist(null)}
              >
                Close
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="my-consultations-section">
        <div className="consultation-section-heading">
          <div>
            <h2>My Consultations</h2>
            <p>Review your upcoming and previous bookings.</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <p className="consultation-empty">
            You have not booked any consultations yet.
          </p>
        ) : (
          <div className="consultation-booking-list">
            {bookings.map((booking) => (
              <article className="consultation-booking-card" key={booking.id}>
                <div>
                  <h3>{booking.nutritionist.full_name}</h3>
                  <p>{booking.nutritionist.specialization}</p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(booking.scheduled_at).toLocaleString()}
                  </p>
                  {booking.notes && (
                    <p>
                      <strong>Notes:</strong> {booking.notes}
                    </p>
                  )}
                </div>

                <div className="booking-actions">
                  <span
                    className={`consultation-status ${booking.status.toLowerCase()}`}
                  >
                    {booking.status}
                  </span>

                  {booking.status === "BOOKED" && (
                    <button
                      className="consultation-cancel-button"
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default NutritionistConsultations;
