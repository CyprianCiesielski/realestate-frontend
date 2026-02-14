import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchGlobalWithFilter } from "./api";
import type { CompanyDto, GlobalSearchResultDto } from "./types";
import { getAllTags } from "../tag/api";
import { getAllCompanies } from "../company/api";
import type { Tag } from "../tag/types";

import "./SearchPage.css";
// 👇 Dodano ikony do obsługi listy i zaznaczenia
import { FaFilter, FaChevronDown, FaChevronUp, FaCheck } from "react-icons/fa";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const queryName = searchParams.get("name") || "";

  const [results, setResults] = useState<GlobalSearchResultDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- DANE ---
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<CompanyDto[]>(
    [],
  );

  // --- STANY FILTRÓW ---
  const [filterProject, setFilterProject] = useState(true);
  const [filterPillar, setFilterPillar] = useState(true);
  const [filterItem, setFilterItem] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priorityInput, setPriorityInput] = useState<string>("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  // 👇 NOWE: Stan do wysuwania listy tagów (domyślnie zamknięta)
  const [isTagsOpen, setIsTagsOpen] = useState(true);

  // 1. Pobieranie danych
  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        const [tagsData, companiesData] = await Promise.all([
          getAllTags(),
          getAllCompanies(),
        ]);
        setAvailableTags(tagsData);
        setAvailableCompanies(companiesData);
      } catch (e) {
        console.error("Błąd pobierania słowników", e);
      }
    };
    fetchDictionaries();
  }, []);

  // 2. Wyszukiwanie
  const fetchData = async () => {
    if (!queryName) return;
    setLoading(true);
    setError(null);
    try {
      const priority = priorityInput ? parseInt(priorityInput, 10) : undefined;
      const company = selectedCompanyId
        ? parseInt(selectedCompanyId, 10)
        : undefined;

      const searchCriteria = { name: queryName };
      const filterCriteria = {
        filterByProject: filterProject,
        filterByPillar: filterPillar,
        filterByItem: filterItem,
        filteredTagsNames: selectedTags,
        filteredPriority: priority,
        companyId: company,
      };

      const data = await searchGlobalWithFilter(searchCriteria, filterCriteria);
      setResults(data);
    } catch (err) {
      console.error(err);
      setError("Błąd wyszukiwania.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryName]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // Toggle Taga
  const handleTagToggle = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName],
    );
  };

  const hasResults =
    results &&
    (results.projects.length > 0 ||
      results.pillars.length > 0 ||
      results.items.length > 0);

  if (!queryName)
    return <div className="search-page-container">Wpisz frazę...</div>;

  return (
    <div className="search-page-layout">
      {/* --- SIDEBAR --- */}
      <aside className="filters-sidebar">
        <div className="filters-header">
          <FaFilter /> Filtrowanie
        </div>
        <form onSubmit={handleFilterSubmit} className="filters-form">
          {/* Checkboxy Typów */}
          <div className="filter-group">
            <label className="filter-label">Szukaj w:</label>
            <div className="checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filterProject}
                  onChange={(e) => setFilterProject(e.target.checked)}
                />{" "}
                Projekty
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filterPillar}
                  onChange={(e) => setFilterPillar(e.target.checked)}
                />{" "}
                Moduły
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filterItem}
                  onChange={(e) => setFilterItem(e.target.checked)}
                />{" "}
                Wątki
              </label>
            </div>
          </div>

          <div className="separator" />

          {/* Firma */}
          <div className="filter-group">
            <label className="filter-label">Firma:</label>
            <select
              className="filter-select"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
            >
              <option value="">Wszystkie firmy</option>
              {availableCompanies.map((c) => (
                <option key={c.id} value={c.id.toString()}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="separator" />

          {/* 👇 MODYFIKACJA SEKCJI TAGÓW */}
          <div className="filter-group">
            {/* Nagłówek klikalny */}
            <div
              className="filter-dropdown-header"
              onClick={() => setIsTagsOpen(!isTagsOpen)}
            >
              <span
                className="filter-label"
                style={{ margin: 0, cursor: "pointer" }}
              >
                Tagi{" "}
                {selectedTags.length > 0 && (
                  <span className="badge-counter">{selectedTags.length}</span>
                )}
              </span>
              {isTagsOpen ? (
                <FaChevronUp className="chevron-icon" />
              ) : (
                <FaChevronDown className="chevron-icon" />
              )}
            </div>

            {/* Kontener wysuwany z animacją */}
            <div className={`tags-collapsible ${isTagsOpen ? "open" : ""}`}>
              <div className="tags-chip-container">
                {availableTags.length === 0 ? (
                  <span className="no-tags-msg">Brak dostępnych tagów</span>
                ) : (
                  availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.name);
                    // Pobieramy kolor z bazy lub dajemy domyślny
                    const tagColor = tag.color || "#6b778c";

                    return (
                      <div
                        key={tag.id}
                        className={`tag-chip ${isSelected ? "selected" : ""}`}
                        onClick={() => handleTagToggle(tag.name)}
                        // Przekazujemy kolor do CSS jako zmienną
                        style={{ "--tag-color": tagColor } as any}
                      >
                        {/* Kolorowa kropka (gdy nieaktywny) */}
                        <span className="tag-dot"></span>

                        <span className="tag-name">{tag.name}</span>

                        {/* Ikona 'check' (gdy aktywny) */}
                        {isSelected && <FaCheck className="tag-check-icon" />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          {/* 👆 KONIEC MODYFIKACJI SEKCJI TAGÓW */}

          <div className="separator" />

          {/* Priorytet */}
          <div className="filter-group">
            <label className="filter-label">Priorytet:</label>
            <select
              className="filter-select"
              value={priorityInput}
              onChange={(e) => setPriorityInput(e.target.value)}
            >
              <option value="">Wszystkie</option>
              <option value="1">1 (Niski)</option>
              <option value="2">2 (Średni)</option>
              <option value="3">3 (Wysoki)</option>
            </select>
          </div>

          <button type="submit" className="apply-filters-btn">
            Zastosuj filtry
          </button>
        </form>
      </aside>

      {/* --- WYNIKI --- */}
      <main className="results-area">
        <h2 className="search-heading">Wyniki dla: "{queryName}"</h2>
        {loading && <div className="loading">Ładowanie wyników...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && !hasResults && (
          <p className="no-results">Brak wyników.</p>
        )}

        {!loading && !error && results && hasResults && (
          <div className="search-results-grid">
            {/* Projekty */}
            {results.projects.length > 0 && (
              <div className="result-column">
                <h3>Projekty ({results.projects.length})</h3>
                <div className="card-list">
                  {results.projects.map((project: any) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="result-card project-card"
                    >
                      <div className="card-title">{project.name}</div>
                      <div className="card-meta">Projekt</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Moduły */}
            {results.pillars.length > 0 && (
              <div className="result-column">
                <h3>Moduły ({results.pillars.length})</h3>
                <div className="card-list">
                  {results.pillars.map((pillar: any) => {
                    const pid = pillar.project?.id || pillar.projectId;
                    const pname = pillar.project?.name;
                    if (!pid) return null;
                    return (
                      <Link
                        key={pillar.id}
                        to={`/projects/${pid}/pillars/${pillar.id}`}
                        className="result-card pillar-card"
                      >
                        <div className="card-title">{pillar.name}</div>
                        <div className="card-meta">Projekt: {pname || pid}</div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Wątki */}
            {results.items.length > 0 && (
              <div className="result-column">
                <h3>Wątki ({results.items.length})</h3>
                <div className="card-list">
                  {results.items.map((item: any) => {
                    const pid = item.pillar?.project?.id || item.projectId;
                    const pilId = item.pillar?.id || item.pillarId;
                    const pname = item.pillar?.project?.name || `ID: ${pid}`;
                    const pilName = item.pillar?.name || `ID: ${pilId}`;
                    if (!pid || !pilId) return null;
                    return (
                      <Link
                        key={item.id}
                        to={`/projects/${pid}/pillars/${pilId}/items/${item.id}`}
                        className="result-card item-card"
                      >
                        <div className="card-header">
                          <span className="card-title">{item.name}</span>
                        </div>
                        <div className="card-meta">
                          P: {pname} | M: {pilName}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
