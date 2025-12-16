import { useState, useEffect } from "react";
import { createItem, type CreateItemDto } from "./api";
import type { Item } from "./types";
import "./CreateItemModal.css";
import { useRefresh } from "../../context/RefreshContext";
import type { Tag } from "../tag/types.ts";
import { getAllTags } from "../tag/api"; // 👈 1. Import API
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

  // 2. Stan na tagi z bazy
  const [allAvailableTags, setAllAvailableTags] = useState<Tag[]>([]);

  // 3. Pobieranie tagów przy otwarciu
  useEffect(() => {
    getAllTags()
      .then((data) => setAllAvailableTags(data))
      .catch((err) => console.error("Błąd pobierania tagów:", err));
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

      const newItem = await createItem(projectId, pillarId, payload);
      onSuccess(newItem);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Nie udało się utworzyć itemu.");
    } finally {
      triggerRefresh();
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>New Item</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
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

          {/* 4. TAG SELECTOR Z DANYMI I STYLEM */}
          <div
            className="form-group"
            style={{ position: "relative", zIndex: 101 }}
          >
            <label>Tags</label>
            <TagSelector
              selectedTags={selectedTags}
              onChange={setSelectedTags}
              allTags={allAvailableTags} // 👈 Przekazujemy tagi
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <input
              name="status"
              value={formData.status}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              name="description"
              value={formData.description}
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
              onChange={(e) => {
                const { name, value } = e.target;
                setFormData((prev) => ({ ...prev, [name]: Number(value) }));
              }}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
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
