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
  const PRESET_COLORS = [
    "#ef4444", // Czerwony
    "#f97316", // Pomarańczowy
    "#eab308", // Żółty
    "#22c55e", // Zielony
    "#06b6d4", // Turkusowy
    "#3b82f6", // Niebieski
    "#a855f7", // Fioletowy
    "#64748b", // Szary
  ];

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
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Wybierz Kolor
            </label>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button" // WAŻNE: żeby nie wysyłało formularza po kliknięciu
                  onClick={() => setColor(presetColor)}
                  disabled={isSubmitting}
                  style={{
                    width: "2rem", // 32px
                    height: "2rem", // 32px
                    borderRadius: "50%", // Kółeczko
                    backgroundColor: presetColor,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    border:
                      color === presetColor
                        ? "3px solid #172b4d" // Pogrubiona ramka dla wybranego
                        : "2px solid transparent", // Brak ramki dla niewybranych
                    boxShadow:
                      color === presetColor
                        ? "0 0 0 2px #fff inset" // Efekt "pierścienia" w środku
                        : "none",
                    transition: "transform 0.2s",
                    transform:
                      color === presetColor ? "scale(1.1)" : "scale(1)",
                  }}
                  aria-label={`Wybierz kolor ${presetColor}`}
                />
              ))}
            </div>

            {/* Opcjonalnie: Input ukryty, jeśli chcesz zachować logikę HTML, ale nie jest konieczny */}
            <input type="hidden" name="color" value={color} />
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
