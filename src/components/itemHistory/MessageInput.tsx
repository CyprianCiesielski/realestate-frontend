import { useState, useEffect, useRef } from "react";
import {
  FaPaperPlane,
  FaTimes,
  FaPen,
  FaPlus,
  FaImage,
  FaReply,
} from "react-icons/fa";
import type { ItemHistory } from "./types.ts"; // Importuj typ, aby mieć dostęp do autora i treści
import "./MessageInput.css";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  editingText?: string | null;
  onCancelEdit?: () => void;
  // --- NOWE PROPSY ---
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronizacja dla Edycji i Odpowiedzi
  useEffect(() => {
    if (typeof editingText === "string") {
      setText(editingText);
      textareaRef.current?.focus();
    } else if (editingText === null && !replyTo) {
      setText("");
    }

    // Jeśli pojawia się odpowiedź, fokusujemy input
    if (replyTo) {
      textareaRef.current?.focus();
    }
  }, [editingText, replyTo]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // ESC anuluje edycję lub odpowiedź
    if (e.key === "Escape") {
      if (editingText && onCancelEdit) onCancelEdit();
      if (replyTo && onCancelReply) onCancelReply();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
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

      {/* 2. PASEK ODPOWIEDZI (REPLY INFO BAR) */}
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
            placeholder={editingText ? "Zmień treść..." : "Napisz wiadomość..."}
            rows={1}
          />
        </div>

        <button
          className="send-btn"
          onClick={handleSubmit}
          disabled={!text.trim()}
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
