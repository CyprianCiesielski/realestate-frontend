import { useState, useEffect } from "react";
import { updateProject, type CreateProjectDto } from "./api";
import type { Project } from "./types";
import { getAllTags } from "../tag/api"; // 👈 1. IMPORT API
import "./CreateProjectModal.css";
import { TagSelector } from "../tag/TagSelector.tsx";
import type { Tag } from "../tag/types.ts";

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSuccess: (updatedProject: Project) => void;
  onArchive: () => void;
}

export function EditProjectModal({
  project,
  onClose,
  onSuccess,
  onArchive,
}: EditProjectModalProps) {
  // 2. STAN NA POBRANE TAGI Z BAZY
  const [allAvailableTags, setAllAvailableTags] = useState<Tag[]>([]);

  // 3. POBIERANIE TAGÓW PRZY OTWARCIU
  useEffect(() => {
    getAllTags()
      .then((data) => {
        setAllAvailableTags(data);
      })
      .catch((err) => console.error("Błąd pobierania tagów w edycji:", err));
  }, []);

  const [formData, setFormData] = useState<CreateProjectDto>({
    name: project.name,
    place: project.place || "",
    contractor: project.contractor || "",
    companyResposible: project.companyResposible || "",
    state: project.state,
    startDate: project.startDate || "",
    priority: project.priority || 1,
  });

  // Inicjalizacja wybranych tagów tymi, które projekt już ma
  const [selectedTags, setSelectedTags] = useState<Tag[]>(project.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obsługa zmian w polach
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "priority" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: selectedTags.map((tag) => ({ id: tag.id })),
      };

      const updated = await updateProject(project.id, payload);
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
            <label>Project name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* 4. TAG SELECTOR Z DANYMI Z BAZY */}
          <div
            className="form-group"
            style={{ position: "relative", zIndex: 101 }}
          >
            <label>Tags</label>
            <TagSelector
              selectedTags={selectedTags}
              onChange={setSelectedTags}
              allTags={allAvailableTags} // 👈 Teraz zmienna istnieje i ma dane
            />
          </div>

          <div className="form-group">
            <label>Place</label>
            <input
              name="place"
              value={formData.place}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Contractor</label>
            <input
              name="contractor"
              value={formData.contractor}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Company responsible</label>
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
              onChange={handleChange}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3 </option>
              <option value={4}>4</option>
              <option value={5}>5 </option>
            </select>
          </div>

          <div className="form-group">
            <label>Start date</label>
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

          <div
            className="modal-actions"
            style={{ justifyContent: "space-between" }}
          >
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
