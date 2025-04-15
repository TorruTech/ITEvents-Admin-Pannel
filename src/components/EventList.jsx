import { useEffect, useState } from "react";
import axios from "axios";

function EventList({ refreshKey }) {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("https://iteventsbackend.onrender.com/api/events");
      setEvents(res.data);
    } catch (error) {
      console.error("Error al obtener eventos", error);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este evento?")) return;
    try {
      await axios.delete(`https://iteventsbackend.onrender.com/api/events/${id}`);
      // Quita el evento eliminado del estado sin necesidad de refetch
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error al eliminar evento", error);
      alert("No se pudo eliminar el evento.");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [refreshKey ?? 0]);

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Eventos registrados</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {events.map((event) => (
          <li
            key={event.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #ccc",
              padding: "0.5rem 0"
            }}
          >
            <span>
              <strong>{event.name}</strong> — {event.dateDescription}
            </span>
            <button
              onClick={() => deleteEvent(event.id)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "red",
                fontWeight: "bold",
                fontSize: "1.2rem",
                cursor: "pointer"
              }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EventList;
