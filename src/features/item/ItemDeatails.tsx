import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Item } from "./types";
import { archiveItem, getItemById } from "./api";
import { addHistoryEntry } from "../itemHistory/api";
import { MessageList } from "../itemHistory/MessageList.tsx";
import { MessageInput } from "../itemHistory/MessageInput.tsx";
import "./ItemDetails.css";
import { FaCog } from "react-icons/fa";
import { EditItemModal } from "./EditItemModal.tsx";
import { useRefresh } from "../../context/RefreshContext.tsx";

export function ItemDetails() {
  const { projectId, pillarId, itemId } = useParams<{
    projectId: string;
    pillarId: string;
    itemId: string;
  }>();

  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { triggerRefresh } = useRefresh();

  const handleArchive = async () => {
    if (!item || !projectId || !pillarId) return;
    try {
      await archiveItem(projectId, pillarId, item.id);

      // Odświeżamy kontekst globalny (żeby zniknęło z menu)
      triggerRefresh();

      // Przekierowujemy do widoku projektu
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error(err);
      alert("Archive Error.");
    }
  };

  useEffect(() => {
    if (itemId && projectId && pillarId) {
      setIsLoading(true);
      setError(null);
      getItemById(projectId, pillarId, itemId)
        .then((data) => {
          setItem(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Nie udało się pobrać szczegółów zadania.");
          setIsLoading(false);
        });
    }
  }, [itemId, projectId, pillarId]);

  const handleSendMessage = async (text: string) => {
    if (!item || !projectId || !pillarId || !itemId) return;
    try {
      // 👇 ZMIANA: Usunąłem changeDate. Backend sam ustawia datę.
      const historyDto = {
        description: text,
        author: "User", // Tutaj w przyszłości wepniesz dane zalogowanego usera
        // webViewLink: ... (opcjonalnie)
        // googleFileId: ... (opcjonalnie)
      };

      const newEntry = await addHistoryEntry(
        projectId,
        pillarId,
        itemId,
        historyDto,
      );

      // Aktualizujemy stan lokalny, żeby wiadomość pojawiła się natychmiast
      setItem((prevItem) => {
        if (!prevItem) return null;
        return {
          ...prevItem,
          historyEntries: [...(prevItem.historyEntries || []), newEntry],
        };
      });
    } catch (err) {
      console.error("Błąd wysyłania wiadomości:", err);
      alert("Nie udało się wysłać wiadomości.");
    }
  };

  if (isLoading) return <div className="loading">Ładowanie danych...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!item) return <div className="not-found">Nie znaleziono zadania.</div>;

  return (
    <div className="project-details-container">
      <div className="item-info-section">
        <header className="project-header">
          <div className="header-left">
            <h1 className="project-title">{item.name}</h1>
            <span
              className={`project-status ${item.state === "active" ? "active" : ""}`}
            >
              ● {item.state}
            </span>

            {/* Wyświetlanie tagów */}
            <div className="project-tags-row">
              {item.tags &&
                item.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="tag-badge"
                    style={{
                      backgroundColor: tag.color || "#94a3b8",
                      color: "#fff",
                      borderColor: tag.color || "#94a3b8",
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
            </div>
          </div>

          <div className="header-right">
            <button
              className="settings-btn"
              onClick={() => setIsEditModalOpen(true)}
              title="Edytuj zadanie"
            >
              <FaCog />
            </button>
          </div>
        </header>

        <div className="project-info-grid">
          <InfoItem label="Status" value={item.status} />
          <InfoItem label="Data startu" value={item.startDate} />
          <InfoItem label="Deadline" value={item.deadline} />
          <InfoItem label="Priorytet" value={`${item.priority}`} />
        </div>
      </div>

      <div className="chat-area">
        <div className="chat-section-header">Chat / Historia</div>

        {/* Kontener z wiadomościami */}
        <div className="message-list-scrollable">
          <MessageList historyEntries={item.historyEntries || []} />
        </div>

        {/* Input na dole */}
        <div className="chat-input-wrapper">
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>

      {isEditModalOpen && item && (
        <EditItemModal
          project_id={projectId!}
          pillar_id={pillarId!}
          item={item}
          onClose={() => setIsEditModalOpen(false)}
          onArchive={() => {
            handleArchive();
            setIsEditModalOpen(false);
          }}
          onSuccess={(updatedItem) => {
            setItem((prev) => (prev ? { ...prev, ...updatedItem } : null));
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="info-box">
      <small className="info-label">{label}</small>
      <div className="info-value">{value || "—"}</div>
    </div>
  );
}
