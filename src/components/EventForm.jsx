import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";
import ImageUploader from "./ImageUploader"; 

function EventForm({ onCreate, eventToEdit, cancelEdit }) {
  const methods = useForm();
  const { register, handleSubmit, reset, setValue } = methods;
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

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
        alert("Evento actualizado");
      } else {
        await axios.post("https://iteventsbackend.onrender.com/api/events", payload);
        alert("Evento creado");
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
        <input {...register("description")} placeholder="Descripción" className="eventInput" />
        <input {...register("dateDescription")} placeholder="Fecha texto" className="eventInput" />
        <input type="date" {...register("date")} required className="eventInput" />
        <input {...register("latitude")} placeholder="Latitud" style={{width: "50%"}} />
        <input {...register("longitude")} placeholder="Longitud" style={{width: "50%"}} />
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

        <br />
        
        <ImageUploader />
        <input type="hidden" {...register("imageUrl")}/>

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
