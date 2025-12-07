import type { ItemHistory } from "./types.ts";
import "./MessageList.css";

interface MessageListProps {
  historyEntries: ItemHistory[];
}

export function MessageList({ historyEntries }: MessageListProps) {
  if (!historyEntries || historyEntries.length === 0) {
    return <div className="empty-message">Brak historii zmian.</div>;
  }

  const sortedHistory = [...historyEntries].sort(
    (a, b) =>
      new Date(a.changeDate).getTime() - new Date(b.changeDate).getTime(),
  );

  return (
    <div className="message-list">
      {sortedHistory.map((entry) => (
        <div key={entry.id} className="message-wrapper">
          {/* Autor i Data */}
          <div className="message-meta">
            <span className="author">{entry.author || "System"}</span>
            <span className="date"> • {entry.changeDate}</span>
          </div>

          {/* Niebieski dymek */}
          <div className="chat-bubble">
            <p className="content">{entry.description}</p>

            {entry.googleFileId && (
              <a
                href={entry.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="attachment-link"
              >
                📎 Załącznik
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
