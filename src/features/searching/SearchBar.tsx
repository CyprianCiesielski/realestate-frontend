import { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { searchGlobal } from "./api"; // Twoje API
import type { GlobalSearchResult } from "./types"; // Twoje Typy
import "./SearchBar.css";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
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

  // 3. Obsługa klawisza ENTER (Przejście do strony SearchPage)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim().length > 0) {
      setIsOpen(false); // Zamykamy podpowiedzi
      navigate(`/search?name=${encodeURIComponent(query)}`); // Przekierowanie
    }
  };

  // 4. Obsługa kliknięcia w konkretny wynik z listy
  const handleNavigateToItem = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery(""); // Czyścimy pasek (opcjonalnie)
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
          onKeyDown={handleKeyDown} // 👈 To obsługuje Enter
          onFocus={() => {
            if (hasResults) setIsOpen(true);
          }}
        />
      </div>

      {/* --- DROPDOWN Z WYNIKAMI (Szybki podgląd) --- */}
      {isOpen && hasResults && (
        <div className="search-results-dropdown">
          {/* PROJEKTY */}
          {results.projects.length > 0 && (
            <div className="search-section">
              <h4>Projects</h4>
              <ul>
                {results.projects.slice(0, 3).map(
                  (
                    p, // Pokaż max 3 podpowiedzi
                  ) => (
                    <li
                      key={`p-${p.id}`}
                      onClick={() => handleNavigateToItem(`/projects/${p.id}`)}
                    >
                      {p.name}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {/* FILARY */}
          {results.pillars.length > 0 && (
            <div className="search-section">
              <h4>Pillars</h4>
              <ul>
                {results.pillars.slice(0, 3).map((pil) => (
                  <li
                    key={`pil-${pil.id}`}
                    onClick={() =>
                      handleNavigateToItem(`/projects/${pil.project.id}`)
                    }
                  >
                    {pil.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ZADANIA */}
          {results.items.length > 0 && (
            <div className="search-section">
              <h4>Items</h4>
              <ul>
                {results.items.slice(0, 5).map((item) => {
                  const projectId = item.pillar?.project?.id;
                  const pillarId = item.pillar?.id;
                  if (!projectId || !pillarId) return null;

                  return (
                    <li
                      key={`i-${item.id}`}
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
                        }}
                      >
                        <span>{item.name}</span>
                        <span className={`status-badge ${item.state}`}>
                          {item.state}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Link "Zobacz wszystkie wyniki" na dole dropdownu */}
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
