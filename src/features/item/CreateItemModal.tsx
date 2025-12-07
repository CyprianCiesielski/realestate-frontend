import { useState } from "react";
import { createItem, type CreateItemDto } from "./api";
import type { Item } from "./types";
import "./CreateItemModal.css";
import { useRefresh } from "../../context/RefreshContext";
import type { Tag } from "../tag/types.ts";
import { TagSelector } from "../tag/TagSelector.tsx";

interface CreateItemModalProps {
  projectId: string;
  pillarId: string;
  onClose: () => void;
  onSuccess: (newItem: Item) => void;
}

export function CreateItemModal({
  projectId,
  pillarId,
  onClose,
  onSuccess,
}: CreateItemModalProps) {
  const { triggerRefresh } = useRefresh();

  // 1. Stan formularza
  const [formData, setFormData] = useState<CreateItemDto>({
    name: "",
    status: "",
    state: "active",
    description: "",
    deadline: "",
    startDate: new Date().toISOString().split("T")[0],
    priority: 1,
  });

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

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
      const payload = {
        ...formData,
        tags: selectedTags.map((tag) => ({ id: tag.id })),
      };

      const newItem = await createItem(projectId, pillarId, payload);
      onSuccess(newItem);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        "Nie udało się utworzyć itemu. Sprawdź, czy nazwa nie jest duplikatem.",
      );
    } finally {
      triggerRefresh();
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* 👇 TUTAJ WKLEJASZ TREŚĆ, KTÓRĄ PODAŁEŚ */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>New Item</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Nazwa */}
          <div className="form-group">
            <label>Item name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="np. Umowa 1"
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <TagSelector
              selectedTags={selectedTags}
              onChange={setSelectedTags}
            />
          </div>

          {/* Status */}
          <div className="form-group">
            <label>Status</label>
            <input
              name="status"
              value={formData.status}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/*deadline */}
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
