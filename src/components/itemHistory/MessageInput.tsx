import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaTimes, FaPen, FaPlus, FaImage } from "react-icons/fa";
import "./MessageInput.css";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  editingText?: string | null; // 👇 To przychodzi z ItemDetails
  onCancelEdit?: () => void; // 👇 To też
}

export function MessageInput({
  onSendMessage,
  editingText,
  onCancelEdit,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 👇 TEGO BRAKOWAŁO: Synchronizacja propsa ze stanem inputa
  useEffect(() => {
    // Jeśli editingText jest stringiem (nawet pustym) -> wchodzimy w tryb edycji
    if (typeof editingText === "string") {
      setText(editingText);
      textareaRef.current?.focus();
    }
    // Jeśli editingText jest explicite null -> wychodzimy z trybu edycji / anulujemy
    // Ważne: sprawdzamy null, a nie "falsy", żeby nie czyściło przy undefined (start)
    else if (editingText === null) {
      setText("");
    }
  }, [editingText]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
    // Resetuj wysokość textarea po wysłaniu
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Obsługa ESC do anulowania
    if (e.key === "Escape" && editingText && onCancelEdit) {
      onCancelEdit();
      setText("");
    }
  };

  // Automatyczne rozszerzanie inputa
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div
      className={`input-container-wrapper ${editingText ? "editing-mode" : ""}`}
    >
      {/* 1. PASEK INFORMACYJNY O EDYCJI (Pojawia się tylko gdy edytujesz) */}
      {editingText && (
        <div className="editing-info-bar">
          <div className="editing-label">
            <FaPen size={12} /> <span>Edytujesz wiadomość</span>
          </div>
          <button
            className="cancel-edit-btn"
            onClick={() => {
              setText("");
              if (onCancelEdit) onCancelEdit();
            }}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* 2. GŁÓWNY PASEK INPUTA */}
      <div className="input-container">
        <div className="input-actions">
          <button className="icon-btn">
            <FaPlus />
          </button>
          <button className="icon-btn">
            <FaImage />
          </button>
        </div>

        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            className="message-input"
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={
              editingText ? "Zmień treść wiadomości..." : "Napisz wiadomość..."
            }
            rows={1}
          />
        </div>

        <button
          className="send-btn"
          onClick={handleSubmit}
          disabled={!text.trim()}
          title={editingText ? "Zapisz zmiany" : "Wyślij"}
        >
          {/* Zmieniamy ikonkę w zależności od trybu */}
          {editingText ? (
            <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
              Zapisz
            </span>
          ) : (
            <FaPaperPlane />
          )}
        </button>
      </div>
    </div>
  );
}
