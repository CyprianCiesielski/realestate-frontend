import { useEffect, useState, useMemo, useRef } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useOutletContext,
} from "react-router-dom";
import type { Pillar } from "./types";
import { getPillarById, archivePillar } from "./api";
import { EditPillarModal } from "./EditPillarModal";
import "../project/ProjectDetails.css";
// Dodajemy ikonę FaFilter
import { FaPlus, FaCog, FaSearch, FaFilter } from "react-icons/fa";
import type { Item } from "../item/types.ts";
import { CreateItemModal } from "../item/CreateItemModal.tsx";
import { Breadcrumbs } from "../common/Breadcrumbs.tsx";
import type { Project } from "../project/types.ts";
import { ScopedSearchModal } from "../searching/SearchModal.tsx";
import { useAuth } from "../../context/AuthContext.tsx";

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

  // Stany dla modali
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // --- STANY DLA FILTRÓW ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Filtrujemy po nazwach tagów
  const [selectedPriorities, setSelectedPriorities] = useState<number[]>([]); // Priorytet to number
  const filterRef = useRef<HTMLDivElement>(null);

  const { isAdmin } = useAuth();

  // 1. Pobieranie danych
  useEffect(() => {
    if (projectId && pillarId) {
      setIsLoading(true);
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
  }, [projectId, pillarId]);

  // 2. Zamykanie dropdownu filtra po kliknięciu poza
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

  // --- LOGIKA FILTROWANIA ---

  // A. Obliczamy dostępne opcje filtrów na podstawie zadań w filarze
  const { uniqueTags, uniquePriorities } = useMemo(() => {
    if (!pillar || !pillar.items)
      return { uniqueTags: [], uniquePriorities: [] };

    const tagsSet = new Set<string>();
    const prioSet = new Set<number>();

    pillar.items.forEach((item) => {
      // Tagi
      if (item.tags) {
        item.tags.forEach((t) => tagsSet.add(t.name));
      }
      // Priorytety (number)
      if (item.priority !== undefined && item.priority !== null) {
        prioSet.add(item.priority);
      }
    });

    return {
      uniqueTags: Array.from(tagsSet).sort(),
      uniquePriorities: Array.from(prioSet).sort((a, b) => a - b),
    };
  }, [pillar]);

  // B. Filtrujemy listę zadań
  const filteredItems = useMemo(() => {
    if (!pillar || !pillar.items) return [];

    return pillar.items.filter((item) => {
      // Filtr Tagów (jeśli pusty -> true, w przeciwnym razie musi zawierać jeden z wybranych)
      const matchesTag =
        selectedTags.length === 0 ||
        item.tags.some((t) => selectedTags.includes(t.name));

      // Filtr Priorytetów
      const matchesPriority =
        selectedPriorities.length === 0 ||
        selectedPriorities.includes(item.priority);

      return matchesTag && matchesPriority;
    });
  }, [pillar, selectedTags, selectedPriorities]);

  // Handler toggleowania tagów
  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName],
    );
  };

  // Handler toggleowania priorytetów
  const togglePriority = (prio: number) => {
    setSelectedPriorities((prev) =>
      prev.includes(prio) ? prev.filter((p) => p !== prio) : [...prev, prio],
    );
  };

  // --- OBSŁUGA POZOSTAŁYCH AKCJI ---

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

  if (isLoading) return <div className="loading">Ładowanie danych...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!pillar) return <div className="not-found">Nie znaleziono filaru.</div>;

  const hasActiveFilters =
    selectedTags.length > 0 || selectedPriorities.length > 0;

  return (
    <div className="project-details-container">
      {/* NAGŁÓWEK */}
      <header className="project-header">
        <div className="header-left">
          <Breadcrumbs />
          <h1 className="project-title">{pillar.name}</h1>
        </div>

        <div className="header-right">
          <button
            className="search-btn"
            onClick={() => setIsSearchModalOpen(true)}
            title="Szukaj w module"
          >
            <FaSearch />
          </button>

          {/* --- PRZYCISK FILTROWANIA --- */}
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
                {/* 1. SEKCJA TAGÓW */}
                <div className="filter-section">
                  <div className="filter-section-title">Tagi</div>
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

                {/* 2. SEKCJA PRIORYTETÓW */}
                <div className="filter-section">
                  <div className="filter-section-title">Priorytety</div>
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

                {/* PRZYCISK CZYSZCZENIA */}
                {hasActiveFilters && (
                  <button
                    className="filter-clear-all"
                    onClick={() => {
                      setSelectedTags([]);
                      setSelectedPriorities([]);
                    }}
                  >
                    Wyczyść filtry
                  </button>
                )}
              </div>
            )}
          </div>

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

      {/* INFO GRID */}
      <div className="project-info-grid">
        <InfoItem label="Firma odpowiedzialna" value={pillar.company?.name} />
        <InfoItem label="Data startu" value={pillar.startDate} />
        <InfoItem label="Deadline" value={pillar.deadline} />
      </div>

      {/* SEKCJA ZADAŃ (ITEMS) */}
      <div className="items-section-header">
        <button
          className="add-pillar-btn"
          onClick={() => setIsCreateItemModalOpen(true)}
        >
          Dodaj Wątek <FaPlus />
        </button>

        {/* Info o filtrowaniu */}
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
                to={`/projects/${projectId}/pillars/${pillar.id}/items/${item.id}`}
                className="task-tile-link"
                state={{
                  projectName: project.name,
                  pillarName: pillar.name,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className="task-tile">
                  <div className="task-tile-title">
                    {item.name}
                    {/* Opcjonalnie: Pokaż priorytet na liście */}
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

      {/* MODALE */}
      {isCreateItemModalOpen && projectId && (
        <CreateItemModal
          projectId={projectId}
          pillarId={String(pillar.id)}
          onClose={() => setIsCreateItemModalOpen(false)}
          onSuccess={handleItemCreationSuccess}
        />
      )}

      {isEditModalOpen && projectId && (
        <EditPillarModal
          project_id={projectId}
          pillar={pillar}
          onClose={() => setIsEditModalOpen(false)}
          onArchive={handleArchive}
          onSuccess={handlePillarUpdateSuccess}
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
