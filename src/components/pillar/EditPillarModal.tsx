import { useState, useEffect } from "react";
import { updatePillar, type CreatePillarDto } from "./api";
import type { Pillar } from "./types";
import "./CreatePillarModal.css";
import type { Tag } from "../tag/types.ts";
import { getAllTags } from "../tag/api";
import { TagSelector } from "../tag/TagSelector.tsx";
import type { Company } from "../company/types.ts";

interface EditPillarModalProps {
  project_id: string;
  pillar: Pillar;
  onClose: () => void;
  onSuccess: (updatedPillar: Pillar) => void;
  onArchive: () => void;
  onUnarchive: () => void;
}

// Typ pomocniczy
interface PillarFormData extends Omit<CreatePillarDto, "company"> {
  company: Company | null;
}

export function EditPillarModal({
  project_id,
  pillar,
  onClose,
  onSuccess,
  onArchive,
  onUnarchive,
}: EditPillarModalProps) {
  // 1. TAGI
  const [allAvailableTags, setAllAvailableTags] = useState<Tag[]>([]);
  useEffect(() => {
    getAllTags()
      .then((data) => setAllAvailableTags(data))
      .catch((err) => console.error(err));
  }, []);

  // 3. STAN FORMULARZA
  const [formData, setFormData] = useState<PillarFormData>({
    name: pillar.name,
    state: pillar.state,
    deadline: pillar.deadline || new Date().toISOString().split("T")[0],
    // ZMIANA: Inicjalizacja obiektem
    company: pillar.company || null,
    startDate: pillar.startDate || new Date().toISOString().split("T")[0],
    priority: pillar.priority || 0,
  });

  const [selectedTags, setSelectedTags] = useState<Tag[]>(pillar.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const updated = await updatePillar(project_id, pillar.id, payload);
      onSuccess(updated);
      onClose();
    } catch (err) {
      alert("Nie udało się zaktualizować modułu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "priority" ? Number(value) : value,
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edytuj Moduł: {pillar.name}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nazwa modułu *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
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

          <div
            className="modal-actions"
            style={{ justifyContent: "space-between" }}
          >
            {pillar.state === "archived" ? (
              <button
                type="button"
                className="btn-save"
                style={{ backgroundColor: "#28a745" }}
                onClick={() => {
                  if (
                    window.confirm(
                      "Czy na pewno chcesz odarchiwizować ten moduł?",
                    )
                  ) {
                    if (onUnarchive) onUnarchive();
                  }
                }}
              >
                Odarchiwizuj Moduł
              </button>
            ) : (
              <button
                type="button"
                className="btn-delete"
                onClick={() => {
                  if (
                    window.confirm(
                      "Czy na pewno chcesz zarchiwizować ten moduł?",
                    )
                  ) {
                    onArchive();
                  }
                }}
              >
                Archiwizuj Moduł
              </button>
            )}

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
