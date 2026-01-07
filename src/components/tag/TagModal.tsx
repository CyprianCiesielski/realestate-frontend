import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaPlus,
  FaTrash,
  FaPen,
  FaCheck,
  FaHashtag,
} from "react-icons/fa";
import "./TagModal.css";
import type { Tag } from "./types"; // Upewnij się co do ścieżki

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

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  onAddTag: (data: { name: string; color: string }) => void;
  onRemoveTag: (tagId: number) => void;
  onEditTag: (tagId: number, data: { name: string; color: string }) => void;
}

export const TagModal: React.FC<TagModalProps> = ({
  isOpen,
  onClose,
  tags,
  onAddTag,
  onRemoveTag,
  onEditTag,
}) => {
  // --- STAN TWORZENIA ---
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[5]);

  // --- STAN EDYCJI ---
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState("");
  const [editColor, setEditColor] = useState(""); // Kolor edytowanego taga

  useEffect(() => {
    if (isOpen) {
      setNewTagName("");
      setNewTagColor(PRESET_COLORS[5]);
      setEditingTagId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // HANDLERY TWORZENIA
  const handleAdd = () => {
    if (newTagName.trim()) {
      onAddTag({ name: newTagName.trim(), color: newTagColor });
      setNewTagName("");
      setNewTagColor(PRESET_COLORS[5]);
    }
  };

  // HANDLERY EDYCJI
  const handleStartEdit = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditInput(tag.name);
    setEditColor(tag.color); // Wczytujemy obecny kolor taga do edytora
  };

  const handleSaveEdit = () => {
    if (editingTagId !== null && editInput.trim()) {
      onEditTag(editingTagId, {
        name: editInput.trim(),
        color: editColor, // Wysyłamy zmieniony kolor
      });
      setEditingTagId(null);
      setEditInput("");
      setEditColor("");
    }
  };

  return (
    <div className="tag-modal-overlay" onClick={onClose}>
      <div className="tag-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="tag-modal-header">
          <h3>
            <FaHashtag className="header-icon" /> Zarządzaj tagami
          </h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </header>

        <div className="tag-modal-body">
          {/* --- 1. TWORZENIE NOWEGO TAGA --- */}
          <div className="create-section">
            <label className="section-label">Utwórz nowy tag</label>
            <div className="add-input-wrapper">
              <input
                type="text"
                placeholder="Nazwa taga..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                autoFocus
              />
              <button
                className="add-btn"
                onClick={handleAdd}
                disabled={!newTagName.trim()}
                style={{ backgroundColor: newTagColor }}
              >
                <FaPlus />
              </button>
            </div>
            {/* Wybór koloru przy tworzeniu */}
            <div className="color-picker-row">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={`color-dot ${newTagColor === color ? "selected" : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewTagColor(color)}
                />
              ))}
            </div>
          </div>

          {/* --- 2. LISTA TAGÓW --- */}
          <div className="tags-list-container">
            <label className="section-label">Istniejące tagi</label>
            <div className="tags-list">
              {tags.length === 0 ? (
                <div className="empty-tags">Brak tagów.</div>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className={`tag-row ${editingTagId === tag.id ? "editing" : ""}`}
                  >
                    {editingTagId === tag.id ? (
                      // ==========================================
                      // TRYB EDYCJI (Tutaj jest input + kolory)
                      // ==========================================
                      <div className="edit-mode-container">
                        {/* Wiersz z Inputem i Przyciskami */}
                        <div className="edit-top-row">
                          <input
                            className="edit-input"
                            value={editInput}
                            onChange={(e) => setEditInput(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSaveEdit()
                            }
                            autoFocus
                          />
                          <div className="actions">
                            <button
                              className="save-btn"
                              onClick={handleSaveEdit}
                            >
                              <FaCheck />
                            </button>
                            <button
                              className="cancel-btn"
                              onClick={() => setEditingTagId(null)}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </div>

                        {/* 👇 TU JEST WYBÓR KOLORU W EDYCJI 👇 */}
                        <div className="edit-color-row">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              className={`color-dot small ${editColor === color ? "selected" : ""}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setEditColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      // ==========================================
                      // TRYB WYŚWIETLANIA (Zwykły wiersz)
                      // ==========================================
                      <>
                        <div className="tag-display">
                          <span
                            className="tag-color-indicator"
                            style={{ backgroundColor: tag.color || "#888" }}
                          />
                          <span className="tag-text">{tag.name}</span>
                        </div>
                        <div className="actions">
                          <button
                            className="action-btn edit"
                            onClick={() => handleStartEdit(tag)}
                          >
                            <FaPen />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => onRemoveTag(tag.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
