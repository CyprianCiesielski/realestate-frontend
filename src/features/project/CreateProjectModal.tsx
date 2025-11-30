import { useState } from "react";
import { createProject, type CreateProjectDto } from "./api";
import type { Project } from "./types";
import "./CreateProjectModal.css";

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: (newProject: Project) => void;
}

export function CreateProjectModal({
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  // 1. Stan formularza
  const [formData, setFormData] = useState<CreateProjectDto>({
    name: "",
    place: "",
    contractor: "",
    companyResposible: "",
    state: "active",
    startDate: new Date().toISOString().split("T")[0],
    priority: 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Obsługa pisania (zbiorcza)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. Obsługa wysyłki
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const newProject = await createProject(formData);
      onSuccess(newProject);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        "Nie udało się utworzyć projektu. Sprawdź, czy nazwa nie jest duplikatem.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* 👇 TUTAJ WKLEJASZ TREŚĆ, KTÓRĄ PODAŁEŚ */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>New Project</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Nazwa */}
          <div className="form-group">
            <label>Project name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="np. Osiedle Dębowe"
            />
          </div>

          {/* Lokalizacja */}
          <div className="form-group">
            <label>Place</label>
            <input
              name="place"
              value={formData.place}
              onChange={handleChange}
            />
          </div>

          {/* Wykonawca */}
          <div className="form-group">
            <label>Contractor</label>
            <input
              name="contractor"
              value={formData.contractor}
              onChange={handleChange}
            />
          </div>

          {/* Spółka (Pamiętaj o literówce z backendu jeśli jej nie poprawiłeś!) */}
          <div className="form-group">
            <label>Company Responsible</label>
            <input
              name="companyResposible"
              value={formData.companyResposible}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={(e) => {
                const { name, value } = e.target;
                setFormData((prev) => ({
                  ...prev,
                  [name]: Number(value), // KONWERSJA NA LICZBĘ jest KLUCZOWA dla 'priority'
                }));
              }}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3 </option>
              <option value={4}>4</option>
              <option value={5}>5 </option>
            </select>
          </div>

          {/* Data */}
          <div className="form-group">
            <label>Start date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          {/* Przyciski */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Anuluj
            </button>

            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Utwórz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
