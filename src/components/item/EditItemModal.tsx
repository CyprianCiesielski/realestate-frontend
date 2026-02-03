import { useState, useEffect } from "react";
import { updateItem, type CreateItemDto } from "./api";
import type { Item } from "./types";
import "../project/CreateProjectModal.css";
import { getAllTags } from "../tag/api";
import { TagSelector } from "../tag/TagSelector.tsx";
import type { Tag } from "../tag/types.ts";
import type { Company } from "../company/types.ts";

interface EditItemModalProps {
  project_id: string;
  pillar_id: string;
  item: Item;
  onClose: () => void;
  onSuccess: (updatedItem: Item) => void;
  onArchive: () => void;
}

// Typ pomocniczy
interface ItemFormData extends Omit<CreateItemDto, "company"> {
  company: Company | null;
}

export function EditItemModal({
  project_id,
  pillar_id,
  item,
  onClose,
  onSuccess,
  onArchive,
}: EditItemModalProps) {
  // 1. TAGI
  const [allAvailableTags, setAllAvailableTags] = useState<Tag[]>([]);
  useEffect(() => {
    getAllTags()
      .then((data) => setAllAvailableTags(data))
      .catch((err) => console.error(err));
  }, []);

  // 3. STAN FORMULARZA
  const [formData, setFormData] = useState<ItemFormData>({
    name: item.name || "",
    state: item.state || "active",
    // ZMIANA: Inicjalizacja obiektem
    company: item.company || null,
    personResponsible: item.personResponsible || "",
    deadline: item.deadline || "",
    startDate: item.startDate || new Date().toISOString().split("T")[0],
    priority: item.priority || 0,
  });

  const [selectedTags, setSelectedTags] = useState<Tag[]>(item.tags || []);
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
        company: formData.company, // Obiekt
        tags: selectedTags.map((tag) => ({ id: tag.id })),
      };
      // @ts-ignore
      const updated = await updateItem(project_id, pillar_id, item.id, payload);
      onSuccess(updated);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Nie udało się edytować wątku.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edytuj Wątek: {item.name}</h2>

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

          <div
            className="modal-actions"
            style={{ justifyContent: "space-between" }}
          >
            <button
              type="button"
              className="btn-delete"
              onClick={() => {
                if (
                  window.confirm("Czy na pewno chcesz zarchiwizować ten wątek?")
                ) {
                  onArchive();
                }
              }}
            >
              Archiwizuj Wątek
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
