import { useEffect, useState, useMemo, useRef } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useOutletContext,
} from "react-router-dom";
import type { Pillar } from "./types";
import { getPillarById, archivePillar, unarchivePillar } from "./api";
import { EditPillarModal } from "./EditPillarModal";
import "../project/ProjectDetails.css";
import {
  FaPlus,
  FaCog,
  FaSearch,
  FaFilter,
  FaFolderOpen,
  FaThumbtack,
} from "react-icons/fa";
import { PinnedMessagesModal } from "../itemHistory/PinnedMessagesModal.tsx";
import { getPillarPinnedHistory } from "../itemHistory/api";
import type { ItemHistory } from "../itemHistory/types";
import type { Item } from "../item/types.ts";
import { CreateItemModal } from "../item/CreateItemModal.tsx";
import { EditItemModal } from "../item/EditItemModal.tsx"; // Import edycji
import { archiveItem } from "../item/api"; // Import api
import { Breadcrumbs } from "../common/Breadcrumbs.tsx";
import type { Project } from "../project/types.ts";
import { ScopedSearchModal } from "../searching/SearchModal.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { useRefresh } from "../../context/RefreshContext.tsx";

export function PillarDetails() {
  const { projectId, pillarId } = useParams<{
    projectId: string;
    pillarId: string;
    projectName: string;
  }>();
  const navigate = useNavigate();

  const project = useOutletContext<Project>();

  const [pillar, setPillar] = useState<Pillar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pinnedMessages, setPinnedMessages] = useState<ItemHistory[]>([]);
  const [isPinnedListOpen, setIsPinnedListOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false); // Stan modalu edycji
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null); // Wybrany item
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<number[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  const { isAdmin } = useAuth();

  const { refreshTrigger } = useRefresh();

  useEffect(() => {
    if (projectId && pillarId) {
      if (!pillar) {
        setIsLoading(true);
      }

      getPillarPinnedHistory(projectId, pillarId)
        .then(setPinnedMessages)
        .catch(console.error);
    }
  }, [projectId, pillarId, refreshTrigger]);

  const handleGoToMessage = (msgId: number, msg: ItemHistory) => {
    setIsPinnedListOpen(false);
    if (msg.itemId) {
      navigate(
        `/projects/${projectId}/pillars/${pillarId}/items/${msg.itemId}?scrollTo=${msgId}`,
      );
    }
  };

  useEffect(() => {
    if (projectId && pillarId) {
      if (!pillar) {
        setIsLoading(true);
      }
      setError(null);

      getPillarById(projectId, pillarId)
        .then((data) => {
          setPillar(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Nie udało się pobrać szczegółów filaru.");
          setIsLoading(false);
        });
    }
  }, [projectId, pillarId, refreshTrigger]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { uniqueTags, uniquePriorities, uniqueStatuses } = useMemo(() => {
    if (!pillar || !pillar.items)
      return { uniqueTags: [], uniquePriorities: [], uniqueStatuses: [] };

    const tagsSet = new Set<string>();
    const prioSet = new Set<number>();
    const statusSet = new Set<string>();

    pillar.items.forEach((item) => {
      if (item.tags) {
        item.tags.forEach((t) => tagsSet.add(t.name));
      }
      if (item.priority !== undefined && item.priority !== null) {
        prioSet.add(item.priority);
      }
      if (item.state) {
        statusSet.add(item.state);
      }
    });

    return {
      uniqueTags: Array.from(tagsSet).sort(),
      uniquePriorities: Array.from(prioSet).sort((a, b) => a - b),
      uniqueStatuses: Array.from(statusSet).sort(),
    };
  }, [pillar]);

  const filteredItems = useMemo(() => {
    if (!pillar || !pillar.items) return [];

    return pillar.items.filter((item) => {
      if (selectedStatuses.length === 0) {
        return item.state !== "archived";
      }
      return selectedStatuses.includes(item.state || "active");
    });
  }, [pillar, selectedTags, selectedPriorities, selectedStatuses]);

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName],
    );
  };

  const togglePriority = (prio: number) => {
    setSelectedPriorities((prev) =>
      prev.includes(prio) ? prev.filter((p) => p !== prio) : [...prev, prio],
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const handleArchive = async () => {
    if (!pillar || !projectId) return;
    if (
      !window.confirm(
        `Czy na pewno chcesz zarchiwizować filar "${pillar.name}"?`,
      )
    ) {
      return;
    }
    try {
      await archivePillar(projectId, pillar.id);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error(err);
      alert("Błąd archiwizacji.");
    }
  };

  // Logika edycji itemu
  const handleEditItemClick = (e: React.MouseEvent, item: Item) => {
    e.preventDefault();
    e.stopPropagation();
    setItemToEdit(item);
    setIsEditItemModalOpen(true);
  };

  const handleItemUpdateSuccess = (updatedItem: Item) => {
    setPillar((prev) => {
      if (!prev) return null;
      const updatedItems = (prev.items || []).map((i) =>
        i.id === updatedItem.id ? updatedItem : i,
      );
      return { ...prev, items: updatedItems };
    });
    setIsEditItemModalOpen(false);
  };

  const handleArchiveItem = async (itemId: number) => {
    if (!projectId || !pillarId) return;
    try {
      await archiveItem(projectId, pillarId, itemId);
      setPillar((prev) => {
        if (!prev) return null;
        return { ...prev, items: prev.items.filter((i) => i.id !== itemId) };
      });
      setIsEditItemModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Błąd archiwizacji wątku.");
    }
  };

  const handlePillarUpdateSuccess = (updatedPillar: Pillar) => {
    setPillar(updatedPillar);
    setIsEditModalOpen(false);
  };

  const handleItemCreationSuccess = (newItem: Item) => {
    setPillar((prev) => {
      if (!prev) return null;
      const updatedItems = [...(prev.items || []), newItem];
      return { ...prev, items: updatedItems };
    });
    setIsCreateItemModalOpen(false);
  };

  const handleUnarchive = async () => {
    if (!pillar || !pillar.id || !projectId) return;
    try {
      await unarchivePillar(projectId, pillar.id);
      window.location.reload();
    } catch {
      alert("Błąd odarchiwizacji modułu.");
    }
  };

  if (isLoading) return <div className="loading">Ładowanie danych...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!pillar) return <div className="not-found">Nie znaleziono filaru.</div>;

  const hasActiveFilters =
    selectedTags.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedStatuses.length > 0;

  return (
    <div className="project-details-container">
      <header className="project-header">
        <div className="header-left">
          <Breadcrumbs />
          <h1 className="project-title">{pillar.name}</h1>
        </div>

        <div className="header-right">
          {pillar.driveFolderLink && (
            <a
              href={pillar.driveFolderLink}
              target="_blank"
              rel="noopener noreferrer"
              className="search-btn"
              title="Otwórz folder filara na dysku Google"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <FaFolderOpen />
            </a>
          )}
          <button
            className="search-btn"
            onClick={() => setIsSearchModalOpen(true)}
            title="Szukaj w module"
          >
            <FaSearch />
          </button>

          <div
            className="filter-wrapper"
            ref={filterRef}
            style={{ position: "relative" }}
          >
            <button
              className={`filter-btn ${isFilterOpen || hasActiveFilters ? "active" : ""}`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="Filtruj zadania"
            >
              <FaFilter />
              {hasActiveFilters && <span className="filter-dot-indicator" />}
            </button>

            {isFilterOpen && (
              <div className="filter-dropdown-menu right-aligned">
                <div className="filter-section">
                  <div className="filter-section-title">STATUS</div>
                  {/* Dodajemy te dwa checkboxy na sztywno, żeby zawsze były dostępne */}
                  <label className="filter-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes("active")}
                      onChange={() => toggleStatus("active")}
                    />
                    <span>Aktywne</span>
                  </label>

                  <label className="filter-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes("archived")}
                      onChange={() => toggleStatus("archived")}
                    />
                    <span style={{ color: "#d9534f" }}>Zarchiwizowane</span>
                  </label>

                  {/* Opcjonalnie: reszta statusów, jeśli masz jakieś dynamiczne (np. finished) */}
                  {uniqueStatuses
                    .filter((s) => s !== "active" && s !== "archived")
                    .map((status) => (
                      <label key={status} className="filter-checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={() => toggleStatus(status)}
                        />
                        <span style={{ textTransform: "capitalize" }}>
                          {status}
                        </span>
                      </label>
                    ))}
                </div>

                <div className="dropdown-divider" />

                <div className="filter-section">
                  <div className="filter-section-title">TAGI</div>
                  {uniqueTags.length === 0 ? (
                    <div className="filter-empty-text">Brak tagów</div>
                  ) : (
                    uniqueTags.map((tag) => (
                      <label key={tag} className="filter-checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                        />
                        <span>#{tag}</span>
                      </label>
                    ))
                  )}
                </div>

                <div className="dropdown-divider" />

                <div className="filter-section">
                  <div className="filter-section-title">PRIORYTETY</div>
                  {uniquePriorities.length === 0 ? (
                    <div className="filter-empty-text">Brak priorytetów</div>
                  ) : (
                    uniquePriorities.map((prio) => (
                      <label key={prio} className="filter-checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedPriorities.includes(prio)}
                          onChange={() => togglePriority(prio)}
                        />
                        <span>Priorytet {prio}</span>
                      </label>
                    ))
                  )}
                </div>

                <div className="dropdown-divider" />

                {hasActiveFilters && (
                  <button
                    className="filter-clear-all"
                    onClick={() => {
                      setSelectedTags([]);
                      setSelectedPriorities([]);
                      setSelectedStatuses([]);
                    }}
                  >
                    Wyczyść filtry
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            className="search-btn"
            onClick={() => setIsPinnedListOpen(true)}
            style={{ position: "relative" }}
            title="Przypięte wiadomości"
          >
            <FaThumbtack />
            {pinnedMessages.length > 0 && (
              <span className="badge-count">{pinnedMessages.length}</span>
            )}
          </button>

          {isAdmin && (
            <button
              className="settings-btn"
              onClick={() => setIsEditModalOpen(true)}
              title="Edytuj filar"
            >
              <FaCog />
            </button>
          )}
        </div>
      </header>

      <div className="project-info-grid">
        <InfoItem label="Firma odpowiedzialna" value={pillar.company?.name} />
        <InfoItem label="Data startu" value={pillar.startDate} />
        <InfoItem label="Deadline" value={pillar.deadline} />
      </div>

      <div className="items-section-header">
        <button
          className="add-pillar-btn"
          onClick={() => setIsCreateItemModalOpen(true)}
        >
          Dodaj Wątek <FaPlus />
        </button>

        {hasActiveFilters && (
          <span
            style={{ marginLeft: "auto", fontSize: "0.85rem", color: "#666" }}
          >
            Wyniki: {filteredItems.length}
          </span>
        )}
      </div>

      <div className="items-list">
        {filteredItems && filteredItems.length > 0 ? (
          <ul>
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                to={`/projects/${projectId}/pillars/${pillarId}/items/${item.id}`} // FIX: Link naprawiony
                className="task-tile-link"
                state={{
                  projectName: project?.name,
                  pillarName: pillar.name,
                }}
              >
                <div className="task-tile" style={{ position: "relative" }}>
                  <div className="task-tile-title">
                    {item.name}
                    {item.priority > 0 && (
                      <span
                        style={{
                          fontSize: "0.7em",
                          color: "#888",
                          marginLeft: "8px",
                        }}
                      >
                        (P{item.priority})
                      </span>
                    )}
                  </div>
                  {/* Zębatka edycji wątku */}
                  <button
                    onClick={(e) => handleEditItemClick(e, item)}
                    style={{
                      position: "absolute",
                      right: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#999",
                    }}
                  >
                    <FaCog size={22} />
                  </button>
                </div>
              </Link>
            ))}
          </ul>
        ) : (
          <p className="empty-state">
            {hasActiveFilters
              ? "Brak zadań spełniających kryteria filtrów."
              : "Brak zadań w tym filarze."}
          </p>
        )}
      </div>

      {isCreateItemModalOpen && projectId && (
        <CreateItemModal
          projectId={projectId}
          pillarId={String(pillar.id)}
          onClose={() => setIsCreateItemModalOpen(false)}
          onSuccess={handleItemCreationSuccess}
        />
      )}

      {/* Modal edycji itemu */}
      {isEditItemModalOpen && itemToEdit && projectId && (
        <EditItemModal
          project_id={projectId}
          pillar_id={String(pillar.id)}
          item={itemToEdit}
          onClose={() => setIsEditItemModalOpen(false)}
          onSuccess={handleItemUpdateSuccess}
          onArchive={() => handleArchiveItem(itemToEdit.id)}
        />
      )}

      {isEditModalOpen && projectId && (
        <EditPillarModal
          project_id={projectId}
          pillar={pillar}
          onClose={() => setIsEditModalOpen(false)}
          onArchive={handleArchive}
          onSuccess={handlePillarUpdateSuccess}
          onUnarchive={handleUnarchive}
        />
      )}

      {isSearchModalOpen && (
        <ScopedSearchModal
          isOpen={true}
          onClose={() => setIsSearchModalOpen(false)}
          contextType={"pillar"}
          contextId={pillarId}
        />
      )}

      {isPinnedListOpen && (
        <PinnedMessagesModal
          pinnedMessages={pinnedMessages}
          onClose={() => setIsPinnedListOpen(false)}
          onGoToMessage={handleGoToMessage}
        />
      )}
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  return (
    <div className="info-box">
      <small className="info-label">{label}</small>
      <div className="info-value">{value || "—"}</div>
    </div>
  );
}
