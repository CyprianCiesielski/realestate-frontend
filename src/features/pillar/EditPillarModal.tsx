import { useState } from "react";
import { updatePillar, type CreatePillarDto } from "./api"; // 👈 Używamy updatePillar
import type { Pillar } from "./types";
import "./CreatePillarModal.css"; // Używamy tych samych stylów

interface EditPillarModalProps {
  project_id: string; // ID projektu (potrzebne do URL API)
  pillar: Pillar; // 👈 Aktualny obiekt filaru do pre-fillingu
  onClose: () => void;
  onSuccess: (updatedPillar: Pillar) => void;
  onArchive: () => void; // Funkcja do archiwizacji
}

export function EditPillarModal({
  project_id,
  pillar,
  onClose,
  onSuccess,
  onArchive,
}: EditPillarModalProps) {
  // Stan formularza inicjowany danymi z aktualnego filaru
  const [formData, setFormData] = useState<CreatePillarDto>({
    name: pillar.name,
    state: pillar.state,
    startDate: pillar.startDate || new Date().toISOString().split("T")[0],
    priority: pillar.priority || 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Wywołujemy funkcję UPDATE z ID filaru!
      const updated = await updatePillar(project_id, pillar.id, formData);
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
            <label>Nazwa filaru</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
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

          <div className="form-group">
            <label>Data startu</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
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
            {/* LEWA STRONA: Przycisk Archiwizacji */}
            <button type="button" className="btn-delete" onClick={onArchive}>
              Archiwizuj Filar
            </button>

            {/* PRAWA STRONA: Zapisz / Anuluj */}
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
