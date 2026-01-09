import { useState, useEffect } from "react";
import { FaThumbtack, FaReply } from "react-icons/fa";
import type { ItemHistory, MessageReaction } from "./types.ts";
import { MessageContextMenu } from "./MessageContextMenu";
import "./MessageList.css";
import { fetchMyProfile } from "../../features/user/api";

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
          <span key={i} className="search-highlight">
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
    goToMessage: (id: number) => void;
  };
}

export function MessageList({
  historyEntries,
  onAction,
  searchQuery = "",
}: MessageListProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    messageId: number;
  } | null>(null);
  const [currentUserFullName, setCurrentUserFullName] = useState<string>("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchMyProfile();
        const fullName = `${profile.firstName} ${profile.lastName}`
          .trim()
          .toLowerCase();
        setCurrentUserFullName(fullName);
      } catch (error) {
        console.error("Błąd pobierania profilu:", error);
      }
    };
    loadProfile();
  }, []);

  if (!historyEntries || historyEntries.length === 0) {
    return <div className="empty-message">Brak historii zmian.</div>;
  }

  const sortedHistory = [...historyEntries].sort((a, b) => {
    return (
      new Date(a.changeDate).getTime() - new Date(b.changeDate).getTime() ||
      a.id - b.id
    );
  });

  const filteredHistory = sortedHistory.filter((entry) =>
    entry.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeMessageForMenu = contextMenu
    ? historyEntries.find((e) => e.id === contextMenu.messageId)
    : null;

  // Sprawdzanie czy otwarta w menu wiadomość jest nasza (na potrzeby Edit/Delete)
  const activeMessageIsMine = !!(
    activeMessageForMenu &&
    activeMessageForMenu.author?.trim().toLowerCase() === currentUserFullName
  );

  return (
    <div className="message-list">
      {filteredHistory.map((entry) => {
        const authorInDb = entry.author?.trim().toLowerCase();
        const isMine = authorInDb === currentUserFullName;

        return (
          <div
            key={entry.id}
            id={`msg-${entry.id}`}
            className={`message-wrapper ${isMine ? "mine" : "others"}`}
          >
            <div className="message-meta">
              <span className="author">
                {isMine ? "Ty" : entry.author || "System"}
              </span>
              <span className="date"> • {formatDate(entry.changeDate)}</span>
            </div>

            <div
              className={`chat-bubble ${entry.isPinned ? "pinned-bubble" : ""}`}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.pageX, y: e.pageY, messageId: entry.id });
              }}
            >
              {/* Pinezka */}
              {entry.isPinned && <FaThumbtack className="pin-badge" />}

              {/* Sekcja Odpowiedzi (Reply) */}
              {entry.replyTo && (
                <div
                  className="reply-preview"
                  /* Upewnij się, że scrollToMessage jest dostępne w zasięgu tego komponentu */
                  onClick={(e) => {
                    e.stopPropagation(); // Zapobiega otwarciu menu kontekstowego przy kliknięciu w podgląd
                    onAction.goToMessage(entry.replyTo!.id);
                  }}
                >
                  <div className="reply-author">
                    <FaReply
                      style={{
                        fontSize: "0.6rem",
                        marginRight: "4px",
                        transform: "scaleX(-1)",
                      }}
                    />
                    {entry.replyTo.author?.trim().toLowerCase() ===
                    currentUserFullName?.toLowerCase()
                      ? "Ty"
                      : entry.replyTo.author}
                  </div>
                  <div className="reply-content-text">
                    {entry.replyTo.description}
                  </div>
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

              {/* Reakcje */}
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
        );
      })}

      {contextMenu && activeMessageForMenu && (
        <MessageContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          isPinned={activeMessageForMenu.isPinned || false}
          isAuthor={activeMessageIsMine} // Kluczowe dla edycji
          onReact={(emoji) => {
            onAction.addReaction(activeMessageForMenu.id, emoji);
            setContextMenu(null);
          }}
          onReply={() => {
            onAction.setReplyTo(activeMessageForMenu);
            setContextMenu(null);
          }}
          onEdit={() => {
            onAction.editMessage(activeMessageForMenu);
            setContextMenu(null);
          }}
          onCopy={() => {
            navigator.clipboard.writeText(activeMessageForMenu.description);
            setContextMenu(null);
          }}
          onPin={() => {
            onAction.togglePin(activeMessageForMenu.id);
            setContextMenu(null);
          }}
          onDelete={() => {
            onAction.deleteMessage(activeMessageForMenu.id);
            setContextMenu(null);
          }}
        />
      )}
    </div>
  );
}
