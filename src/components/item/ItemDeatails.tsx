import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Item } from "./types";
import { archiveItem, getItemById } from "./api";
import {
  addHistoryEntry,
  addReaction,
  archiveItemHistory,
  pinItemHistory,
  updateItemHistory,
} from "../itemHistory/api";
import { MessageList } from "../itemHistory/MessageList.tsx";
import { MessageInput } from "../itemHistory/MessageInput.tsx";
import "./ItemDetails.css";
import { FaCog, FaSearch, FaThumbtack, FaTimes } from "react-icons/fa";
import { EditItemModal } from "./EditItemModal.tsx";
import { useRefresh } from "../../context/RefreshContext.tsx";
import { Breadcrumbs } from "../common/Breadcrumbs.tsx";
import { PinnedMessagesModal } from "../itemHistory/PinnedMessagesModal.tsx";

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

  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isPinnedListOpen, setIsPinnedListOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  const editingMessageText =
    item?.historyEntries?.find((e) => e.id === editingMessageId)?.description ||
    null;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSearch();
      }
    }

    if (isSearchActive) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchActive]);

  const closeSearch = () => {
    setIsSearchActive(false);
    setSearchQuery("");
  };

  const scrollToMessage = (msgId: number) => {
    setSearchQuery("");
    setIsSearchActive(false);

    setTimeout(() => {
      const container = document.querySelector(".message-list-scrollable");
      const element = document.getElementById(`msg-${msgId}`);

      if (container && element) {
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offset = elementRect.top - containerRect.top;
        const targetScroll =
          container.scrollTop +
          offset -
          container.clientHeight / 2 +
          elementRect.height / 2;

        container.scrollTo({
          top: targetScroll,
          behavior: "smooth",
        });

        element.classList.add("flash-highlight");
        setTimeout(() => element.classList.remove("flash-highlight"), 2000);
      }
    }, 100);
  };

  const handleArchive = async () => {
    if (!item || !projectId || !pillarId) return;
    try {
      await archiveItem(projectId, pillarId, item.id);
      triggerRefresh();
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error(err);
      alert("Archive Error.");
    }
  };

  const handleTogglePin = async (historyId: number) => {
    if (!itemId || !projectId || !pillarId) return;

    setItem((prevItem) => {
      if (!prevItem) return null;
      return {
        ...prevItem,
        historyEntries: prevItem.historyEntries.map((entry) =>
          entry.id === historyId
            ? { ...entry, isPinned: !entry.isPinned }
            : entry,
        ),
      };
    });

    try {
      await pinItemHistory(projectId, pillarId, itemId, historyId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (historyId: number) => {
    if (
      !itemId ||
      !projectId ||
      !pillarId ||
      !window.confirm("Are you sure you want to delete this message?")
    )
      return;

    setItem((prevItem) => {
      if (!prevItem) return null;
      return {
        ...prevItem,
        historyEntries: prevItem.historyEntries.filter(
          (entry) => entry.id !== historyId,
        ),
      };
    });

    try {
      await archiveItemHistory(projectId, pillarId, itemId, historyId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddReaction = async (historyId: number, emoji: string) => {
    if (!itemId || !projectId || !pillarId) return;

    try {
      const updatedEntry = await addReaction(
        projectId,
        pillarId,
        itemId,
        historyId,
        emoji,
      );

      setItem((prevItem) => {
        if (!prevItem) return null;
        return {
          ...prevItem,
          historyEntries: prevItem.historyEntries.map((entry) =>
            entry.id === historyId ? updatedEntry : entry,
          ),
        };
      });
    } catch (e) {
      console.error(e);
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

    if (editingMessageId) {
      try {
        const updatedEntry = await updateItemHistory(
          projectId,
          pillarId,
          itemId,
          editingMessageId,
          {
            description: text,
            author: "User",
          },
        );

        setEditingMessageId(null);

        setItem((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            historyEntries: prev.historyEntries.map((e) =>
              e.id === editingMessageId ? updatedEntry : e,
            ),
          };
        });
      } catch (e) {
        console.error(e);
        alert("Nie udało się zapisać zmian.");
      }
    } else {
      try {
        const historyDto = { description: text, author: "User" };
        const newEntry = await addHistoryEntry(
          projectId,
          pillarId,
          itemId,
          historyDto,
        );

        setItem((prevItem) => {
          if (!prevItem) return null;
          return {
            ...prevItem,
            historyEntries: [...(prevItem.historyEntries || []), newEntry],
          };
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (isLoading) return <div className="loading">Ładowanie danych...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!item) return <div className="not-found">Nie znaleziono zadania.</div>;

  const pinnedMessages = item?.historyEntries?.filter((e) => e.isPinned) || [];

  return (
    <div className="project-details-container">
      <div className="item-info-section">
        <header className="project-header">
          <div className="header-left">
            <Breadcrumbs />
            <h1 className="project-title">{item.name}</h1>
          </div>

          <div className="header-right">
            {isSearchActive ? (
              <div className="local-search-bar" ref={searchRef}>
                <FaSearch className="search-icon-inside" />
                <input
                  type="text"
                  placeholder="Szukaj..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="local-search-input"
                />
                <button className="search-close-btn" onClick={closeSearch}>
                  <FaTimes />
                </button>
              </div>
            ) : (
              <button
                className="search-btn"
                onClick={() => setIsSearchActive(true)}
                title="Szukaj w czacie"
              >
                <FaSearch />
              </button>
            )}

            <button
              className="search-btn"
              onClick={() => setIsPinnedListOpen(true)}
              title="Pokaż przypięte"
              style={{ position: "relative" }}
            >
              <FaThumbtack />
              {pinnedMessages.length > 0 && (
                <span className="badge-count">{pinnedMessages.length}</span>
              )}
            </button>

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
          <InfoItem
            label="Osoba odpowiedzialna"
            value={item.personResponsible}
          />
          <InfoItem
            label="Firma odpowiedzialna"
            value={item.companyResposible}
          />
          <InfoItem label="Deadline" value={item.deadline} />
          <InfoItem label="Data startu" value={item.startDate} />
          <InfoItem
            label="Priorytet"
            value={`${item.priority > 0 ? item.priority : "—"}`}
          />
        </div>
      </div>

      <div className="chat-area">
        <div className="message-list-scrollable">
          <MessageList
            historyEntries={item.historyEntries || []}
            searchQuery={searchQuery}
            onAction={{
              addReaction: handleAddReaction,
              setReplyTo: () => console.log("not implemented"),
              togglePin: handleTogglePin,
              deleteMessage: handleDelete,
              editMessage: (entry) => setEditingMessageId(entry.id),
            }}
          />
        </div>

        <div className="chat-input-wrapper">
          <MessageInput
            onSendMessage={handleSendMessage}
            editingText={editingMessageText}
            onCancelEdit={() => setEditingMessageId(null)}
          />
        </div>
      </div>

      {isPinnedListOpen && (
        <PinnedMessagesModal
          pinnedMessages={pinnedMessages}
          onClose={() => setIsPinnedListOpen(false)}
          onGoToMessage={scrollToMessage}
        />
      )}

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
