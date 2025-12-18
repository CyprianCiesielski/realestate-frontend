import { useState, useEffect } from "react";
import { updatePillar, type CreatePillarDto } from "./api";
import type { Pillar } from "./types";
import "./CreatePillarModal.css";
import type { Tag } from "../tag/types.ts";
import { getAllTags } from "../tag/api"; // 👈 1. Import API
import { TagSelector } from "../tag/TagSelector.tsx";

interface EditPillarModalProps {
  project_id: string;
  pillar: Pillar;
  onClose: () => void;
  onSuccess: (updatedPillar: Pillar) => void;
  onArchive: () => void;
}

export function EditPillarModal({
  project_id,
  pillar,
  onClose,
  onSuccess,
  onArchive,
}: EditPillarModalProps) {
  // 2. Stan na tagi z bazy
  const [allAvailableTags, setAllAvailableTags] = useState<Tag[]>([]);

  // 3. Pobieranie tagów
  useEffect(() => {
    getAllTags()
      .then((data) => setAllAvailableTags(data))
      .catch((err) => console.error(err));
  }, []);

  const [formData, setFormData] = useState<CreatePillarDto>({
    name: pillar.name,
    state: pillar.state,
    deadline: pillar.deadline || new Date().toISOString(),
    companyResposible: pillar.companyResposible,
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
        tags: selectedTags.map((tag) => ({ id: tag.id })),
      };

      const updated = await updatePillar(project_id, pillar.id, payload);
      onSuccess(updated);
      onClose();
    } catch (err) {
      alert("Nie udało się zaktualizować filaru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edytuj Filar: {pillar.name}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nazwa filaru *</label>
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
                setFormData((prev) => ({
                  ...prev,
                  [name]: Number(value),
                }));
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
            <button type="button" className="btn-delete" onClick={onArchive}>
              Archiwizuj Filar
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
