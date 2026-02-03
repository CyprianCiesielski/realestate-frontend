import { useState, useEffect } from "react";
import { createPillar, type CreatePillarDto } from "./api";
import type { Pillar } from "./types";
import "./CreatePillarModal.css";
import type { Tag } from "../tag/types.ts";
import { getAllTags } from "../tag/api";
import { TagSelector } from "../tag/TagSelector.tsx";
import { useRefresh } from "../../context/RefreshContext.tsx";
import type { Company } from "../company/types.ts";
import { createPortal } from "react-dom";

interface CreatePillarModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: (newProject: Pillar) => void;
}

// Typ pomocniczy do formularza (żeby company było obiektem)
interface PillarFormData extends Omit<CreatePillarDto, "company"> {
  company: Company | null;
}

export function CreatePillarModal({
  projectId,
  onClose,
  onSuccess,
}: CreatePillarModalProps) {
  const { triggerRefresh } = useRefresh();

  // 1. TAGI
  const [allAvailableTags, setAllAvailableTags] = useState<Tag[]>([]);
  useEffect(() => {
    getAllTags()
      .then((data) => setAllAvailableTags(data))
      .catch((err) => console.error("Błąd pobierania tagów:", err));
  }, []);

  // 3. STAN FORMULARZA
  const [formData, setFormData] = useState<PillarFormData>({
    name: "",
    state: "active",
    company: null, // Obiekt company
    deadline: new Date().toISOString().split("T")[0],
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
        company: formData.company, // Przekazujemy obiekt
        tags: selectedTags.map((tag) => ({ id: tag.id })),
      };

      // @ts-ignore - ignorujemy typy DTO jeśli api.ts nie jest zaktualizowane
      const newPillar = await createPillar(projectId, payload);

      const safePillar = {
        ...newPillar,
        items: newPillar.items || [],
      };

      onSuccess(safePillar);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Nie udało się utworzyć modułu.");
    } finally {
      triggerRefresh();
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Nowy moduł</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nazwa Modułu *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="np. Etap 1"
            />
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
              {isSubmitting ? "Zapisywanie..." : "Utwórz"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
