import { useState } from "react";
import { FaThumbtack } from "react-icons/fa";
import type { ItemHistory, MessageReaction } from "./types.ts";
import { MessageContextMenu } from "./MessageContextMenu";
import "./MessageList.css";

const HighlightedText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim()) return <>{text}</>;

  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} style={{ backgroundColor: "#fff566", color: "black" }}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
};

const formatDate = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const groupReactions = (reactions: MessageReaction[]) => {
  if (!reactions) return {};
  const groups: Record<string, { count: number; users: string[] }> = {};
  reactions.forEach((r) => {
    if (!groups[r.emojiCode]) {
      groups[r.emojiCode] = { count: 0, users: [] };
    }
    groups[r.emojiCode].count += 1;
    groups[r.emojiCode].users.push(r.userName);
  });
  return groups;
};

interface MessageListProps {
  historyEntries: ItemHistory[];
  searchQuery?: string;
  onAction: {
    addReaction: (id: number, emoji: string) => void;
    setReplyTo: (entry: ItemHistory) => void;
    togglePin: (id: number) => void;
    deleteMessage: (id: number) => void;
    editMessage: (entry: ItemHistory) => void;
  };
}

interface ContextMenuState {
  x: number;
  y: number;
  messageId: number;
}

export function MessageList({
  historyEntries,
  onAction,
  searchQuery = "",
}: MessageListProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  if (!historyEntries || historyEntries.length === 0) {
    return <div className="empty-message">Brak historii zmian.</div>;
  }

  const sortedHistory = [...historyEntries].sort((a, b) => {
    const dateA = new Date(a.changeDate).getTime();
    const dateB = new Date(b.changeDate).getTime();
    const diff = dateA - dateB;
    if (diff !== 0) return diff;
    return a.id - b.id;
  });

  const filteredHistory = sortedHistory.filter((entry) =>
    entry.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleContextMenu = (e: React.MouseEvent, msgId: number) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      messageId: msgId,
    });
  };

  const handleCloseMenu = () => setContextMenu(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const activeMessageForMenu = contextMenu
    ? historyEntries.find((e) => e.id === contextMenu.messageId)
    : null;

  if (filteredHistory.length === 0 && searchQuery) {
    return (
      <div className="empty-message">
        Brak wiadomości pasujących do wyszukiwania.
      </div>
    );
  }

  return (
    <div className="message-list">
      {filteredHistory.map((entry) => (
        <div key={entry.id} id={`msg-${entry.id}`} className="message-wrapper">
          <div className="message-meta">
            <span className="author">{entry.author || "System"}</span>
            <span className="date"> • {formatDate(entry.changeDate)}</span>
          </div>

          <div
            className={`chat-bubble ${entry.isPinned ? "pinned-bubble" : ""}`}
            onContextMenu={(e) => handleContextMenu(e, entry.id)}
          >
            {entry.isPinned && (
              <div className="pin-badge" title="Przypięta wiadomość">
                <FaThumbtack />
              </div>
            )}

            <p className="content">
              <HighlightedText
                text={entry.description}
                highlight={searchQuery}
              />
            </p>

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

            {entry.reactions && entry.reactions.length > 0 && (
              <div className="reactions-container">
                {Object.entries(groupReactions(entry.reactions)).map(
                  ([emoji, data]) => (
                    <div
                      key={emoji}
                      className="reaction-pill"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction.addReaction(entry.id, emoji);
                      }}
                      title={`Reakcje: ${data.users.join(", ")}`}
                    >
                      <span>{emoji}</span>
                      {data.count > 1 && (
                        <span className="reaction-count">{data.count}</span>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {contextMenu && activeMessageForMenu && (
        <MessageContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={handleCloseMenu}
          isPinned={activeMessageForMenu.isPinned || false}
          onReact={(emoji) =>
            onAction.addReaction(activeMessageForMenu.id, emoji)
          }
          onReply={() => onAction.setReplyTo(activeMessageForMenu)}
          onEdit={() => onAction.editMessage(activeMessageForMenu)}
          onCopy={() => handleCopy(activeMessageForMenu.description)}
          onPin={() => onAction.togglePin(activeMessageForMenu.id)}
          onDelete={() => onAction.deleteMessage(activeMessageForMenu.id)}
        />
      )}
    </div>
  );
}
