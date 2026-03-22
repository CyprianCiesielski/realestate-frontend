import { useState, useEffect } from "react";
import { createItem, type CreateItemDto } from "./api";
import type { Item } from "./types";
import "./CreateItemModal.css";
import { useRefresh } from "../../context/RefreshContext";
import type { Tag } from "../tag/types.ts";
import { getAllTags } from "../tag/api";
import { TagSelector } from "../tag/TagSelector.tsx";
import type { Company } from "../company/types.ts";
import { createPortal } from "react-dom";

interface CreateItemModalProps {
  projectId: string;
  pillarId: string;
  onClose: () => void;
  onSuccess: (newItem: Item) => void;
}

// Typ pomocniczy do formularza
interface ItemFormData extends Omit<CreateItemDto, "company"> {
  company: Company | null;
}

export function CreateItemModal({
  projectId,
  pillarId,
  onClose,
  onSuccess,
}: CreateItemModalProps) {
  const { triggerRefresh } = useRefresh();

  // 1. TAGI
  const [allAvailableTags, setAllAvailableTags] = useState<Tag[]>([]);
  useEffect(() => {
    getAllTags()
      .then((data) => setAllAvailableTags(data))
      .catch((err) => console.error("Błąd pobierania tagów:", err));
  }, []);

  // 2. NOWY STAN: ID folderu Google Drive
  const [customDriveFolderId] = useState("");

  // 3. STAN FORMULARZA
  const [formData, setFormData] = useState<ItemFormData>({
    name: "",
    state: "active",
    company: null, // Obiekt
    personResponsible: "",
    deadline: "",
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
        // Dodajemy ID folderu Google Drive (jeśli podano)
        customDriveFolderId: customDriveFolderId.trim() || undefined,
      };

      // @ts-ignore
      const newItem = await createItem(projectId, pillarId, payload);
      onSuccess(newItem);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Nie udało się utworzyć wątku.");
    } finally {
      triggerRefresh();
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Nowy Wątek</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nazwa wątku *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="np. Prace ziemne"
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
