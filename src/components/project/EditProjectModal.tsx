import { useState, useEffect } from "react";
import { updateProject, type CreateProjectDto } from "./api";
import type { Project } from "./types";
import { getAllTags } from "../tag/api";
import "./CreateProjectModal.css";
import { TagSelector } from "../tag/TagSelector.tsx";
import type { Tag } from "../tag/types.ts";
import { getAllCompanies } from "../company/api.ts";
import type { Company } from "../company/types.ts";
import { useRefresh } from "../../context/RefreshContext.tsx";

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSuccess: (updatedProject: Project) => void;
  onArchive: () => void;
}

// Interfejs lokalny dla stanu formularza
interface ProjectFormData extends Omit<CreateProjectDto, "company"> {
  company: Company | null;
}

export function EditProjectModal({
  project,
  onClose,
  onSuccess,
  onArchive,
}: EditProjectModalProps) {
  const { triggerRefresh } = useRefresh();

  // 1. TAGI
  const [allAvailableTags, setAllAvailableTags] = useState<Tag[]>([]);
  useEffect(() => {
    getAllTags()
      .then((data) => setAllAvailableTags(data))
      .catch((err) => console.error("Błąd pobierania tagów:", err));
  }, []);

  // 2. FIRMY
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getAllCompanies();
        setAvailableCompanies(data.filter((c) => c.state !== "archived"));
      } catch (error) {
        console.error("Nie udało się pobrać firm", error);
      }
    };
    fetchCompanies();
  }, []);

  // 3. STAN FORMULARZA
  // Inicjalizujemy pole 'company' obiektem z projektu (jeśli istnieje)
  const [formData, setFormData] = useState<ProjectFormData>({
    name: project.name,
    personResponsible: project.personResponsible || "",
    deadline: project.deadline || "",
    // ZMIANA: używamy pola company z projektu (obiektu)
    company: project.company || null,
    state: project.state,
    startDate: project.startDate || "",
    priority: project.priority || 1,
  });

  const [selectedTags, setSelectedTags] = useState<Tag[]>(project.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        // Backend oczekuje obiektu company (tak jak w create)
        company: formData.company,
        tags: selectedTags.map((tag) => ({ id: tag.id })),
      };

      // @ts-ignore
      const updated = await updateProject(project.id, payload);
      onSuccess(updated);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Nie udało się zaktualizować projektu.");
    } finally {
      triggerRefresh();
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edytuj Projekt</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nazwa projektu *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* SELECT FIRMY - NAPRAWIONY */}
          <div className="form-group">
            <label>Firma Odpowiedzialna *</label>
            <select
              name="company"
              // Wyświetlamy nazwę z obiektu w stanie
              value={formData.company?.name || ""}
              onChange={(e) => {
                const selectedName = e.target.value;
                const selectedCompanyObj = availableCompanies.find(
                  (c) => c.name === selectedName,
                );
                // Ręczna aktualizacja stanu obiektem
                setFormData((prev) => ({
                  ...prev,
                  company: selectedCompanyObj || null,
                }));
              }}
              className="form-control"
              style={{
                padding: "8px",
                width: "100%",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">-- Wybierz firmę --</option>
              {availableCompanies.map((company) => (
                <option key={company.id} value={company.name}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div
            className="form-group"
            style={{ position: "relative", zIndex: 101 }}
          >
            <label>Tagi</label>
            <TagSelector
              selectedTags={selectedTags}
              onChange={setSelectedTags}
              allTags={allAvailableTags}
            />
          </div>

          <div className="form-group">
            <label>Osoba odpowiedzialna</label>
            <input
              name="personResponsible"
              value={formData.personResponsible}
              onChange={handleChange}
            />
          </div>

          {/* Reszta bez zmian */}
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
            <label>Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
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
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
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
