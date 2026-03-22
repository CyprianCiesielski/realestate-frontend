import React, { useRef, useState, useEffect } from "react";
import { FaPlus, FaTimes, FaPaperclip } from "react-icons/fa";
import { AiOutlineSend } from "react-icons/ai";
import "./MessageInput.css";
import { type ItemHistory } from "../itemHistory/types";

interface MessageInputProps {
  onSendMessage: (text: string, file?: File) => void;
  editingText: string | null;
  onCancelEdit: () => void;
  replyTo: ItemHistory | null;
  onCancelReply: () => void;
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

  // 1. Inicjalizacja tekstu przy edycji
  useEffect(() => {
    if (editingText !== null) {
      setText(editingText);
      textareaRef.current?.focus();
    } else {
      setText("");
    }
  }, [editingText]);

  // 2. Focus przy odpowiedzi
  useEffect(() => {
    if (replyTo) {
      textareaRef.current?.focus();
    }
  }, [replyTo]);

  // 👇 NOWY KROK: Automatyczne dostosowanie wysokości przy KAŻDEJ zmianie tekstu
  useEffect(() => {
    if (textareaRef.current) {
      // Reset do auto pozwala na zmniejszanie pola po usunięciu tekstu
      textareaRef.current.style.height = "auto";
      // Ustawienie nowej wysokości na podstawie realnej zawartości
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]); // Zależność [text] sprawia, że działa to też przy wczytaniu edycji

  const handleSubmit = () => {
    if (!text.trim() && !selectedFile) return;
    onSendMessage(text, selectedFile || undefined);
    setText("");
    setSelectedFile(null);
    // Usunięto ręczne resetowanie wysokości, bo useEffect(..., [text]) zrobi to automatycznie za nas
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Usunięto ręczną zmianę wysokości stąd - logika jest teraz w useEffect
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={`input-container-wrapper ${
        editingText !== null ? "editing-mode" : ""
      } ${replyTo ? "reply-mode" : ""}`}
    >
      {editingText !== null && (
        <div className="action-bar editing-bar">
          Edytujesz wiadomość
          <button className="cancel-btn" onClick={onCancelEdit}>
            Anuluj
          </button>
        </div>
      )}

      {replyTo && (
        <div className="action-bar reply-bar">
          Replying to <strong>{replyTo.author}</strong>
          <button className="cancel-btn" onClick={onCancelReply}>
            Cancel
          </button>
        </div>
      )}

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
            title="Upload file"
          >
            <FaPlus size={22} />
          </button>
        </div>

        <div className="input-wrapper">
          {selectedFile && (
            <div className="selected-file-preview">
              <div className="file-info">
                <FaPaperclip className="file-icon" />
                <span className="file-name">{selectedFile.name}</span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="remove-file-btn"
                title="Usuń załącznik"
              >
                <FaTimes />
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
            rows={2}
          />
        </div>

        <button
          className="send-btn"
          onClick={handleSubmit}
          disabled={!text.trim() && !selectedFile}
        >
          <AiOutlineSend />
        </button>
      </div>
    </div>
  );
}
