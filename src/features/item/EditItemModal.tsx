import { useState, useEffect } from "react";
import { updateItem, type CreateItemDto } from "./api";
import type { Item } from "./types";
import "../project/CreateProjectModal.css";
import { getAllTags } from "../tag/api"; // 👈 1. Import API
import { TagSelector } from "../tag/TagSelector.tsx";
import type { Tag } from "../tag/types.ts";

interface EditItemModalProps {
  project_id: string;
  pillar_id: string;
  item: Item;
  onClose: () => void;
  onSuccess: (updatedItem: Item) => void;
  onArchive: () => void;
}

export function EditItemModal({
  project_id,
  pillar_id,
  item,
  onClose,
  onSuccess,
  onArchive,
}: EditItemModalProps) {
  // 2. Stan na tagi z bazy
  const [allAvailableTags, setAllAvailableTags] = useState<Tag[]>([]);

  // 3. Pobieranie tagów
  useEffect(() => {
    getAllTags()
      .then((data) => setAllAvailableTags(data))
      .catch((err) => console.error(err));
  }, []);

  const [formData, setFormData] = useState<CreateItemDto>({
    name: item.name || "",
    state: item.state || "active",
    companyResposible: item.companyResposible || "",
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: selectedTags.map((tag) => ({ id: tag.id })),
      };
      const updated = await updateItem(project_id, pillar_id, item.id, payload);
      onSuccess(updated);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to edit item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edytuj Item: {item.name}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nazwa itemu *</label>
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
              onChange={(e) => {
                const { name, value } = e.target;
                setFormData((prev) => ({ ...prev, [name]: Number(value) }));
              }}
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
                  window.confirm(
                    "Czy na pewno chcesz zarchiwizować ten projekt?",
                  )
                ) {
                  onArchive();
                }
              }}
            >
              Archive Item
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
