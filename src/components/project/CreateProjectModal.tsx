import { useState, useEffect } from "react";
import { createProject, type CreateProjectDto } from "./api";
import { getAllTags } from "../tag/api";
import type { Project } from "./types";
import "./CreateProjectModal.css";
import type { Tag } from "../tag/types.ts";
import { TagSelector } from "../tag/TagSelector.tsx";
import { useRefresh } from "../../context/RefreshContext.tsx";
import { createPortal } from "react-dom";
import type { Company } from "../company/types.ts";
import { getAllCompanies } from "../company/api.ts";

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: (newProject: Project) => void;
}

// Rozszerzamy DTO na potrzeby formularza, żeby company mogło być obiektem lub null
interface ProjectFormData extends Omit<CreateProjectDto, "company"> {
  company: Company | null;
}

export function CreateProjectModal({
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const { triggerRefresh } = useRefresh();

  // 1. TAGI
  const [allAvailableTags, setAllAvailableTags] = useState<Tag[]>([]);
  useEffect(() => {
    getAllTags()
      .then((data) => setAllAvailableTags(data))
      .catch((err) => console.error("Błąd pobierania tagów:", err));
  }, []);

  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);

  // 2. FIRMY
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getAllCompanies();

        console.log("📦 DANE Z API FIRM:", data); // <--- Zobacz w konsoli co to jest!

        let companiesList: Company[] = [];

        // Przypadek 1: Backend zwraca czystą tablicę [ {id:1}, {id:2} ]
        if (Array.isArray(data)) {
          companiesList = data;
        }
        // Przypadek 2: Backend zwraca obiekt Page (Spring Data) { content: [...] }
        // @ts-ignore - tymczasowe obejście typowania, jeśli types.ts nie przewiduje Page
        else if (data && Array.isArray(data.content)) {
          // @ts-ignore
          companiesList = data.content;
        }

        setAvailableCompanies(
          companiesList.filter((c) => c.state !== "archived"),
        );
      } catch (error) {
        console.error("Nie udało się pobrać firm", error);
        setAvailableCompanies([]); // Ustaw pusta listę w razie błędu
      }
    };

    fetchCompanies();
  }, []);

  // 3. FORMULARZ
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    deadline: new Date().toISOString().split("T")[0],
    personResponsible: "",
    company: null, // Tutaj trzymamy obiekt
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
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // Przygotowanie payloadu dla backendu
      const payload = {
        ...formData,
        // Jeśli backend w createProject oczekuje obiektu company, to jest ok.
        // Jeśli oczekuje samego ID, trzeba by zrobić: company: { id: formData.company?.id }
        company: formData.company,
        tags: selectedTags.map((tag) => ({ id: tag.id })),
      };

      // @ts-ignore - ignorujemy niezgodność typów DTO jeśli api.ts nie jest zaktualizowane
      const newProject = await createProject(payload);
      onSuccess(newProject);
      onClose();
    } catch (err: any) {
      // <--- Dodaj : any
      console.error("Create Item Error:", err);
      setError(err.customMessage || "Nie udało się utworzyć wątku.");
    } finally {
      triggerRefresh();
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Nowy Projekt</h2>
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label>Firma Odpowiedzialna *</label>
            <select
              name="company"
              value={formData.company?.name || ""}
              onChange={(e) => {
                const selectedName = e.target.value;
                const selectedCompanyObj = availableCompanies.find(
                  (c) => c.name === selectedName,
                );
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
            <label>Priorytet</label>
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
    </div>,
    document.body,
  );
}
