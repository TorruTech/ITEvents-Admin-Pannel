import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";
import ImageUploader from "./ImageUploader";
import { toast } from "react-toastify";


function EventForm({ onCreate, eventToEdit, cancelEdit }) {
  const methods = useForm();
  const { register, handleSubmit, reset, setValue, watch } = methods;
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const requiresTicket = watch("requiresTicket");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axios.get("https://iteventsbackend.onrender.com/api/categories");
        const locRes = await axios.get("https://iteventsbackend.onrender.com/api/locations");
        setCategories(catRes.data);
        setLocations(locRes.data);
      } catch (error) {
        console.error("Error al cargar categorías o localizaciones", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (eventToEdit) {
      setValue("name", eventToEdit.name);
      setValue("description", eventToEdit.description);
      setValue("dateDescription", eventToEdit.dateDescription);
      setValue("date", eventToEdit.date);
      setValue("latitude", eventToEdit.latitude);
      setValue("longitude", eventToEdit.longitude);
      setValue("requiresTicket", eventToEdit.requiresTicket);
      setValue("totalTickets", eventToEdit.totalTickets);
      setValue("availableTickets", eventToEdit.availableTickets);
      setValue("webUrl", eventToEdit.webUrl);

      let parsedLabels = eventToEdit.labels;

      if (typeof parsedLabels === "string") {
        try {
          parsedLabels = JSON.parse(parsedLabels);
        } catch (err) {
          console.warn("Error al parsear labels:", err);
          parsedLabels = [];
        }
      }

      setValue("labels", parsedLabels.join(", "));

      setValue("imageUrl", eventToEdit.imageUrl);
      setValue("categoryId", eventToEdit.category?.id);
      setValue("locationId", eventToEdit.location?.id);
    } else {
      reset(); 
    }
  }, [eventToEdit, setValue, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      labels: JSON.stringify(data.labels.split(",").map((label) => label.trim())),
      category: { id: parseInt(data.categoryId) },
      location: { id: parseInt(data.locationId) },
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude)
    };
    
    try {
      if (eventToEdit) {
        await axios.put(`https://iteventsbackend.onrender.com/api/events/${eventToEdit.id}`, payload);
        toast.success("Evento actualizado correctamente");
      } else {
        await axios.post("https://iteventsbackend.onrender.com/api/events", payload);
        toast.success("Evento creado correctamente");
      }

      reset();
      if (onCreate) onCreate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-300">
        <h2>{eventToEdit ? "Editar Evento" : "Crear Evento"}</h2>

        <input {...register("name")} placeholder="Nombre del evento" required className="eventInput" />
        <input {...register("description")} placeholder="Descripción" required className="eventInput" />
        <input {...register("dateDescription")} placeholder="Fecha texto" required className="eventInput" />
        <input type="date" {...register("date")} required className="eventInput" />
        <input {...register("latitude")} placeholder="Latitud" style={{width: "50%"}} />
        <input {...register("longitude")} placeholder="Longitud" style={{width: "50%"}} />
        <input {...register("webUrl")} placeholder="URL Web" required className="eventInput" />
        <input {...register("labels")} placeholder="Etiquetas separadas por coma" className="eventInput" />

        <select {...register("categoryId")} required>
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select {...register("locationId")} required>
          <option value="">Selecciona una ciudad</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
    
        <div style={{ textAlign: "center", margin: "5px 0", display: "flex", alignSelf: "center", flexDirection: "column" }}>
          <label style={{ fontWeight: "bold"}}>{" "}¿Requiere entrada?</label>
          <input type="checkbox" {...register("requiresTicket")} />
        </div>

        {requiresTicket && (
          <div>
            <input
              type="number"
              {...register("totalTickets", { required: requiresTicket })}
              placeholder="Total de entradas"
              className="eventInput"
              style={{ width: "50%" }}
            />

            <input
              type="number"
              {...register("availableTickets", { required: requiresTicket })}
              placeholder="Entradas disponibles"
              className="eventInput"
              style={{ width: "50%" }}
            />
          </div>
        )}

        <ImageUploader />
        <input type="hidden" {...register("imageUrl")} required/>

        <button type="submit" style={{margin: "5px 0"}}>{eventToEdit ? "Actualizar" : "Guardar"}</button>
        {eventToEdit && (
          <button type="button" className="ml-2" onClick={() => {
            reset();
            if (cancelEdit) cancelEdit(); 
          }}>
            Limpiar
          </button>        
        )}
      </form>
    </FormProvider>
  );
}

export default EventForm;
