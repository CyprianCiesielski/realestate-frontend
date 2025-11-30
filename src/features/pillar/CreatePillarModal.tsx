import { useState } from "react";
import { createPillar, type CreatePillarDto } from "./api";
import type { Pillar } from "./types";
import "./CreatePillarModal.css";

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
  // 1. Stan formularza
  const [formData, setFormData] = useState<CreatePillarDto>({
    name: "",
    state: "active",
    startDate: new Date().toISOString().split("T")[0],
    priority: 1,
  });

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
      const newPillar = await createPillar(projectId, formData);
      onSuccess(newPillar);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        "Nie udało się utworzyć filaru. Sprawdź, czy nazwa nie jest duplikatem.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* 👇 TUTAJ WKLEJASZ TREŚĆ, KTÓRĄ PODAŁEŚ */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>New pillar</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Nazwa */}
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
            <label>Start Date</label>
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
