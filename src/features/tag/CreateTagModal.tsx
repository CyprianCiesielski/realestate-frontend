import { useState } from "react";
import { createTag } from "./api";
import type { Tag, CreateTagDto } from "./types";

interface Props {
  initialName?: string;
  onClose: () => void;
  onSuccess: (newTag: Tag) => void;
}

export function CreateTagModal({
  onClose,
  onSuccess,
  initialName = "",
}: Props) {
  // Stan nazwy inicjowany wartością przekazaną lub pustym ciągiem
  const [name, setName] = useState(initialName);
  // Stan koloru, domyślnie neutralny szary
  const [color, setColor] = useState("#888888");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prosta walidacja
    if (name.trim() === "") {
      setError("Nazwa tagu jest wymagana.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: CreateTagDto = {
      name: name.trim(),
      color: color,
    };

    try {
      // Wywołanie funkcji API
      const newTag = await createTag(payload);
      onSuccess(newTag);
      // Zamykamy modal tylko po sukcesie
      onClose();
    } catch (err) {
      console.error("Błąd tworzenia tagu:", err);
      // Wyświetlenie błędu użytkownikowi (np. z backendu o duplikacie)
      setError("Nie udało się utworzyć tagu. Spróbuj innej nazwy.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDEROWANIE ---
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Tag</h2>

        {error && <div className="error-msg">{error}</div>}

        {/* Usunięto tag <form>. Zawartość formularza umieszczono w div. */}
        <div>
          {/* 1. Pole Nazwy */}
          <div className="form-group">
            <label htmlFor="tag-name">Nazwa Tagu</label>
            <input
              id="tag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 2. Pole Koloru */}
          <div className="form-group">
            <label htmlFor="tag-color">Wybierz Kolor</label>
            <input
              id="tag-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                height: "2.5rem",
                width: "100%",
                padding: "0.3125rem",
                border: "1px solid #dfe1e6",
                borderRadius: "0.25rem",
                cursor: "pointer",
              }}
              disabled={isSubmitting}
            />
          </div>

          {/* 3. Przyciski Akcji */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Anuluj
            </button>
            {/* Zmieniono type="submit" na type="button" i dodano onClick={handleSubmit} */}
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-save"
              disabled={isSubmitting || name.trim() === ""}
            >
              {isSubmitting ? "Tworzenie..." : "Utwórz Tag"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
