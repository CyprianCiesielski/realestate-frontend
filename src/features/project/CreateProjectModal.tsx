import { useState, useEffect } from "react";
import { createProject, type CreateProjectDto } from "./api";
import { getAllTags } from "../tag/api"; // 👈 IMPORTUJEMY API TAGÓW
import type { Project } from "./types";
import "./CreateProjectModal.css";
import type { Tag } from "../tag/types.ts";
import { TagSelector } from "../tag/TagSelector.tsx";

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: (newProject: Project) => void;
  // Usunęliśmy allAvailableTags z propsów, modal sam sobie je pobierze
}

export function CreateProjectModal({
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  // 1. Stan na listę wszystkich tagów z bazy
  const [allAvailableTags, setAllAvailableTags] = useState<Tag[]>([]);

  // 2. Pobieramy tagi od razu po otwarciu modala
  useEffect(() => {
    getAllTags()
      .then((data) => {
        console.log("Tagi pobrane z bazy:", data);
        setAllAvailableTags(data);
      })
      .catch((err) => console.error("Błąd pobierania tagów:", err));
  }, []);

  // --- Reszta stanu formularza bez zmian ---
  const [formData, setFormData] = useState<CreateProjectDto>({
    name: "",
    deadline: new Date().toISOString(),
    personResponsible: "",
    companyResposible: "",
    state: "active",
    startDate: new Date().toISOString().split("T")[0],
    priority: 0,
  });

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    try {
      const payload = {
        ...formData,
        tags: selectedTags.map((tag) => ({ id: tag.id })),
      };

      const newProject = await createProject(payload);
      onSuccess(newProject);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Nie udało się utworzyć projektu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Nowy Projekt</h2>
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Nazwa */}
          <div className="form-group">
            <label>Nazwa projektu *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="np. Osiedle Dębowe"
            />
          </div>

          {/* TAGI - Tutaj przekazujemy pobrane wyżej tagi */}
          <div
            className="form-group"
            style={{ position: "relative", zIndex: 101 }}
          >
            <label>Tagi</label>
            <TagSelector
              selectedTags={selectedTags}
              onChange={setSelectedTags}
              allTags={allAvailableTags} // 👈 Przekazujemy to co pobrał useEffect
            />
          </div>

          {/* Reszta pól... */}
          <div className="form-group">
            <label>Osoba odpowiedzialna</label>
            <input
              name="personResponsible"
              value={formData.personResponsible}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Firma Odpowiedzialna</label>
            <input
              name="companyResposible"
              value={formData.companyResposible}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Data Startu</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
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
              <option value={0}></option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Anuluj
            </button>
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              Utwórz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
