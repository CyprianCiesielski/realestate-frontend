import { useState } from "react";
import { updateProject, type CreateProjectDto } from "./api";
import type { Project } from "./types";
import "./CreateProjectModal.css"; // Użyjemy tych samych stylów + dodamy jeden nowy

interface EditProjectModalProps {
  project: Project; // 👈 Musimy wiedzieć co edytujemy
  onClose: () => void;
  onSuccess: (updatedProject: Project) => void;
  onArchive: () => void; // Funkcja do archiwizacji przekazana z rodzica
}

export function EditProjectModal({
  project,
  onClose,
  onSuccess,
  onArchive,
}: EditProjectModalProps) {
  // 1. Inicjalizacja stanu danymi z projektu
  const [formData, setFormData] = useState<CreateProjectDto>({
    name: project.name,
    place: project.place || "",
    contractor: project.contractor || "",
    companyResposible: project.companyResposible || "",
    state: project.state,
    startDate: project.startDate || "",
    priority: project.priority || 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Obsługa zmian (taka sama jak przy tworzeniu)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Zapisywanie zmian (UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await updateProject(project.id, formData);
      onSuccess(updated);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Nie udało się zaktualizować projektu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edytuj Projekt</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nazwa projektu</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Lokalizacja</label>
            <input
              name="place"
              value={formData.place}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Wykonawca</label>
            <input
              name="contractor"
              value={formData.contractor}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Spółka odpowiedzialna</label>
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

          <div className="form-group">
            <label>Data startu</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              style={{ padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
            >
              <option value="active">Aktywny</option>
              <option value="finished">Zakończony</option>
              <option value="archived">Zarchiwizowany</option>
            </select>
          </div>

          {/* PRZYCISKI AKCJI */}
          <div
            className="modal-actions"
            style={{ justifyContent: "space-between" }}
          >
            {/* LEWA STRONA: Czerwony przycisk usuwania */}
            <button
              type="button"
              className="btn-delete"
              onClick={() => {
                if (
                  window.confirm(
                    "Czy na pewno chcesz zarchiwizować ten projekt?",
                  )
                ) {
                  onArchive();
                }
              }}
            >
              Archiwizuj Projekt
            </button>

            {/* PRAWA STRONA: Anuluj / Zapisz */}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={onClose} className="btn-cancel">
                Anuluj
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={isSubmitting}
              >
                Zapisz zmiany
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
