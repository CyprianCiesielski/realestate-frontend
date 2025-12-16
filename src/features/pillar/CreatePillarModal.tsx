import { useState, useEffect } from "react";
import { createPillar, type CreatePillarDto } from "./api";
import type { Pillar } from "./types";
import "./CreatePillarModal.css";
import type { Tag } from "../tag/types.ts";
import { getAllTags } from "../tag/api"; // 👈 1. Importujemy API tagów
import { TagSelector } from "../tag/TagSelector.tsx";

interface CreatePillarModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: (newProject: Pillar) => void;
}

export function CreatePillarModal({
  projectId,
  onClose,
  onSuccess,
}: CreatePillarModalProps) {
  // 2. Stan na wszystkie dostępne tagi
  const [allAvailableTags, setAllAvailableTags] = useState<Tag[]>([]);

  // 3. Pobieranie tagów przy otwarciu
  useEffect(() => {
    getAllTags()
      .then((data) => {
        setAllAvailableTags(data);
      })
      .catch((err) => console.error("Błąd pobierania tagów:", err));
  }, []);

  const [formData, setFormData] = useState<CreatePillarDto>({
    name: "",
    state: "active",
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

      const newPillar = await createPillar(projectId, payload);
      onSuccess(newPillar);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Nie udało się utworzyć filaru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>New pillar</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pillar name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="np. Market"
            />
          </div>

          {/* 4. TAG SELECTOR Z DANYMI I STYLEM */}
          <div
            className="form-group"
            style={{ position: "relative", zIndex: 101 }} // Ważne dla dropdowna
          >
            <label>Tags</label>
            <TagSelector
              selectedTags={selectedTags}
              onChange={setSelectedTags}
              allTags={allAvailableTags} // 👈 Przekazujemy pobrane tagi
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
                  [name]: Number(value),
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

          <div className="form-group">
            <label>Start Date</label>
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
              {isSubmitting ? "Zapisywanie..." : "Utwórz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
