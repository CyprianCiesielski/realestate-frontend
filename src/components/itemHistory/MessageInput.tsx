import { useState, useEffect, useRef } from "react";
import {
  FaPaperPlane,
  FaTimes,
  FaPen,
  FaPlus,
  FaImage,
  FaReply,
} from "react-icons/fa";
import type { ItemHistory } from "./types.ts";
import "./MessageInput.css";

interface MessageInputProps {
  onSendMessage: (text: string, file?: File) => void;
  editingText?: string | null;
  onCancelEdit?: () => void;
  replyTo?: ItemHistory | null;
  onCancelReply?: () => void;
}

export function MessageInput({
  onSendMessage,
  editingText,
  onCancelEdit,
  replyTo,
  onCancelReply,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronizacja dla Edycji i Odpowiedzi
  useEffect(() => {
    if (typeof editingText === "string") {
      setText(editingText);
      // Przy wejściu w tryb edycji warto przeliczyć wysokość, aby tekst się zmieścił
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        textareaRef.current.focus();
      }
    } else if (editingText === null && !replyTo) {
      setText("");
      // Reset wysokości przy wyjściu z trybu edycji
      if (textareaRef.current) {
        textareaRef.current.style.height = "";
      }
    }

    if (replyTo) {
      textareaRef.current?.focus();
    }
  }, [editingText, replyTo]);

  const handleSubmit = () => {
    if (!text.trim() && !selectedFile) return;

    onSendMessage(text, selectedFile || undefined);

    setText("");
    setSelectedFile(null);

    // Reset inputu pliku
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // ZMIANA: Resetujemy wysokość do pustego stringa (""),
    // co sprawia, że textarea wraca do domyślnej wysokości z atrybutu rows={3}
    if (textareaRef.current) {
      textareaRef.current.style.height = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      if (editingText && onCancelEdit) onCancelEdit();
      if (replyTo && onCancelReply) onCancelReply();
      if (selectedFile) {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Reset do auto, aby poprawnie obliczyć scrollHeight (zmniejszanie)
    e.target.style.height = "auto";
    // Ustawienie nowej wysokości na podstawie zawartości
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`input-container-wrapper ${editingText ? "editing-mode" : ""} ${replyTo ? "reply-mode" : ""}`}
    >
      {/* 1. PASEK EDYCJI */}
      {editingText && (
        <div className="editing-info-bar">
          <div className="editing-label">
            <FaPen size={12} /> <span>Edytujesz wiadomość</span>
          </div>
          <button className="cancel-edit-btn" onClick={onCancelEdit}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* 2. PASEK ODPOWIEDZI */}
      {replyTo && !editingText && (
        <div className="reply-info-bar">
          <div className="reply-label">
            <FaReply size={12} style={{ transform: "scaleX(-1)" }} />
            <div className="reply-details">
              <span className="reply-to-user">
                Odpowiadasz użytkownikowi <strong>{replyTo.author}</strong>
              </span>
              <span className="reply-to-text">{replyTo.description}</span>
            </div>
          </div>
          <button className="cancel-reply-btn" onClick={onCancelReply}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* 3. GŁÓWNY PASEK INPUTA */}
      <div className="input-container">
        <div className="input-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            className="icon-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Dodaj plik"
          >
            <FaPlus />
          </button>
          <button className="icon-btn">
            <FaImage />
          </button>
        </div>

        <div
          className="input-wrapper"
          style={{ display: "flex", flexDirection: "column" }}
        >
          {selectedFile && (
            <div
              className="selected-file-preview"
              style={{
                fontSize: "12px",
                color: "#666",
                padding: "4px 8px",
                background: "#f0f0f0",
                borderRadius: "4px",
                marginBottom: "4px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>📎 {selectedFile.name}</span>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                style={{
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  color: "#999",
                  display: "flex",
                  alignItems: "center",
                }}
                title="Usuń plik"
              >
                <FaTimes size={10} />
              </button>
            </div>
          )}
          <textarea
            ref={textareaRef}
            className="message-input"
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={editingText ? "Zmień treść..." : "Napisz wiadomość..."}
            rows={3} // ZMIANA: Domyślnie 3 linijki
          />
        </div>

        <button
          className="send-btn"
          onClick={handleSubmit}
          disabled={!text.trim() && !selectedFile}
          title={editingText ? "Zapisz" : "Wyślij"}
        >
          {editingText ? (
            <span className="save-text">Zapisz</span>
          ) : (
            <FaPaperPlane />
          )}
        </button>
      </div>
    </div>
  );
}
