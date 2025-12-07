import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Item } from "./types";
import { archiveItem, getItemById } from "./api";
import { addHistoryEntry } from "../itemHistory/api"; // Import funkcji API
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

      triggerRefresh();
      navigate(`/projects/${projectId}`);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Archive Error.");
    }
  };

  // 1. Pobieranie danych przy starcie
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

  // 2. Logika wysyłania wiadomości
  const handleSendMessage = async (text: string) => {
    if (!item || !projectId || !pillarId || !itemId) return;

    try {
      // Tworzymy obiekt zgodny z Twoim typem CreateHistoryDto
      const historyDto = {
        description: text,
        changeDate: new Date().toISOString(), // Backend wymaga daty
        author: "User", // TODO: Podmień to na dane z logowania (np. user.name)
        // Opcjonalne pola (jeśli będziesz robić upload plików):
        // googleFileId: ...,
        // webViewLink: ...
      };

      // Wysyłamy do API
      const newEntry = await addHistoryEntry(
        projectId,
        pillarId,
        itemId,
        historyDto,
      );

      // Aktualizujemy stan lokalny (dodajemy wpis do listy bez odświeżania strony)
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

  // 3. Stany ładowania/błędu
  if (isLoading) return <div className="loading">Ładowanie danych...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!item) return <div className="not-found">Nie znaleziono zadania.</div>;

  return (
    <div className="project-details-container">
      {/* --- GÓRNA SEKCJA: INFO O ZADANIU --- */}
      <div className="item-info-section">
        <header className="project-header">
          <div className="header-left">
            <h1 className="project-title">{item.name}</h1>
            <span
              className={`project-status ${item.state === "active" ? "active" : ""}`}
            >
              ● {item.state}
            </span>

            <div className="project-tags-row">
              {item.tags &&
                item.tags.map((tag) => (
                  <span key={tag.id} className="tag-badge">
                    #{tag.name}
                  </span>
                ))}
            </div>
          </div>

          <div className="header-right">
            <button
              className="settings-btn"
              onClick={() => setIsEditModalOpen(true)}
              title="Edytuj projekt"
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

        {/* Miejsce na opis, jeśli masz takie pole w itemie */}
        {/* <div className="description-section">{item.description}</div> */}
      </div>

      {/* --- DOLNA SEKCJA: CZAT / HISTORIA --- */}
      <div className="chat-area">
        <div className="chat-section-header">Chat</div>

        {/* Lista wiadomości (Scrollowana) */}
        <div className="message-list-scrollable">
          <MessageList historyEntries={item.historyEntries || []} />
        </div>

        {/* Input (Przyklejony do dołu) */}
        <div className="chat-input-wrapper">
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>

      {isEditModalOpen && item && (
        <EditItemModal
          project_id={projectId!} // Używamy projectId z URL
          pillar_id={pillarId!} // 👈 ZMIANA: nazwa propsa musi pasować do definicji w modalu
          item={item}
          onClose={() => setIsEditModalOpen(false)}
          onArchive={() => {
            handleArchive();
            setIsEditModalOpen(false);
          }}
          onSuccess={(updatedItem) => {
            // Aktualizujemy lokalny stan Itemu nowymi danymi (w tym tagami)
            setItem((prev) => (prev ? { ...prev, ...updatedItem } : null));
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// Pomocniczy komponent do wyświetlania pól w gridzie
function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="info-box">
      <small className="info-label">{label}</small>
      <div className="info-value">{value || "—"}</div>
    </div>
  );
}
