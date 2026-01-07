import { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { searchGlobal } from "./api";
import type { GlobalSearchResultDto } from "./types";
import "./SearchBar.css";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResultDto | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 1. Zamykanie dropdownu po kliknięciu poza komponent
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Pobieranie podpowiedzi (Debounce 300ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        try {
          const data = await searchGlobal({ name: query });
          setResults(data);
          setIsOpen(true);
        } catch (error) {
          console.error(error);
        }
      } else {
        setResults(null);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // 3. Obsługa klawisza ENTER
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim().length > 0) {
      setIsOpen(false);
      navigate(`/search?name=${encodeURIComponent(query)}`);
    }
  };

  // 4. Obsługa nawigacji
  const handleNavigateToItem = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery("");
  };

  const hasResults =
    results &&
    (results.projects.length > 0 ||
      results.pillars.length > 0 ||
      results.items.length > 0);

  return (
    <div className="header-center" ref={searchRef}>
      <div className="search-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search for projects, pillars and items..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (hasResults) setIsOpen(true);
          }}
        />
      </div>

      {isOpen && hasResults && (
        <div className="search-results-dropdown">
          {/* --- PROJEKTY --- */}
          {results.projects.length > 0 && (
            <div className="search-section">
              <h4>Projects</h4>
              <ul>
                {results.projects.slice(0, 3).map((p) => (
                  <li
                    key={`p-${p.id}`}
                    onClick={() => handleNavigateToItem(`/projects/${p.id}`)}
                  >
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* --- FILARY --- */}
          {results.pillars.length > 0 && (
            <div className="search-section">
              <h4>Pillars</h4>
              <ul>
                {results.pillars.slice(0, 3).map((pil) => {
                  if (!pil.project) return null;

                  return (
                    <li
                      key={`pil-${pil.id}`}
                      // 👇 PRZYWRÓCONO: Nawigacja do projektu z parametrem pillar
                      onClick={() =>
                        handleNavigateToItem(
                          `/projects/${pil.project!.id}?pillar=${pil.id}`,
                        )
                      }
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{pil.name}</span>
                        <small style={{ color: "#888", fontSize: "0.75rem" }}>
                          in {pil.project.name}
                        </small>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* --- ZADANIA (ITEMS) --- */}
          {results.items.length > 0 && (
            <div className="search-section">
              <h4>Items</h4>
              <ul>
                {results.items.slice(0, 5).map((item) => {
                  // 👇 PRZYWRÓCONO: Pobieranie ID rodziców i budowanie pełnej ścieżki
                  const projectId = item.pillar?.project?.id;
                  const pillarId = item.pillar?.id;

                  if (!projectId || !pillarId) return null;

                  return (
                    <li
                      key={`i-${item.id}`}
                      // 👇 PRZYWRÓCONO: Pełna ścieżka zagnieżdżona
                      onClick={() =>
                        handleNavigateToItem(
                          `/projects/${projectId}/pillars/${pillarId}/items/${item.id}`,
                        )
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>{item.name}</span>
                        {item.pillar && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "#999",
                              marginLeft: "10px",
                            }}
                          >
                            {item.pillar.name}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div
            className="search-footer"
            onClick={() => {
              navigate(`/search?name=${encodeURIComponent(query)}`);
              setIsOpen(false);
            }}
          >
            Press Enter to see all results...
          </div>
        </div>
      )}
    </div>
  );
}
