import { useState } from "react";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage(""); // Czyścimy pole po wysłaniu
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="input-container">
      {/* Ikony akcji (na przyszłość) */}
      <div className="input-actions">
        <button className="icon-btn" title="Dodaj plik">
          📂
        </button>
        <button className="icon-btn" title="Wybierz z dysku">
          📎
        </button>
      </div>

      {/* Pole tekstowe */}
      <div className="input-wrapper">
        <input
          type="text"
          className="message-input"
          placeholder="Napisz wiadomość..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Przycisk Wyślij */}
      <button
        className="send-btn"
        onClick={handleSend}
        disabled={!message.trim()}
      >
        ➤
      </button>
    </div>
  );
}
