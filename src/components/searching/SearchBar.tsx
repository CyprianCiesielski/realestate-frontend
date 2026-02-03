import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaCube, FaTasks, FaProjectDiagram } from "react-icons/fa";
import { searchGlobal } from "./api";
import "./SearchBar.css";

// Pomocniczy typ do płaskiej listy wyników
interface FlatSearchResult {
  id: number;
  name: string;
  type: "project" | "pillar" | "item";
  parentName?: string;
  url: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [flatResults, setFlatResults] = useState<FlatSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 1. Zamykanie po kliknięciu poza
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

  // 2. Pobieranie i "SPŁASZCZANIE" wyników (Debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        try {
          const data = await searchGlobal({ name: query });

          // --- TU JEST KLUCZOWA ZMIANA ---
          // Zamieniamy obiekt { projects:[], pillars:[], items:[] } na jedną listę []
          // żeby wyglądało to jak w SearchModal

          const projects: FlatSearchResult[] = data.projects.map((p) => ({
            id: p.id,
            name: p.name,
            type: "project",
            url: `/projects/${p.id}`,
            // W globalnym searchu projekt nie ma rodzica
          }));

          const pillars: FlatSearchResult[] = data.pillars.map((p) => ({
            id: p.id,
            name: p.name,
            type: "pillar",
            parentName: p.project ? `Projekt: ${p.project.name}` : undefined,
            url: p.project ? `/projects/${p.project.id}/pillars/${p.id}` : "#",
          }));

          const items: FlatSearchResult[] = data.items.map((i) => {
            // Bezpieczne pobieranie ID
            // @ts-ignore
            const pid = i.pillar?.project?.id;
            // @ts-ignore
            const pilId = i.pillar?.id;

            return {
              id: i.id,
              name: i.name,
              type: "item",
              // @ts-ignore
              parentName: i.pillar
                ? `Projekt: ${i.pillar.project?.name} Moduł: ${i.pillar.name}`
                : undefined,
              url:
                pid && pilId
                  ? `/projects/${pid}/pillars/${pilId}/items/${i.id}`
                  : "#",
            };
          });

          // Łączymy i bierzemy np. max 10 wyników łącznie, żeby dropdown nie był za długi
          setFlatResults([...projects, ...pillars, ...items].slice(0, 10));
          setIsOpen(true);
        } catch (error) {
          console.error(error);
        }
      } else {
        setFlatResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // 3. Obsługa klawisza ENTER -> Pełna strona SearchPage
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim().length > 0) {
      setIsOpen(false);
      navigate(`/search?name=${encodeURIComponent(query)}`);
    }
  };

  // 4. Kliknięcie w konkretny wynik -> Przejście do obiektu
  const handleResultClick = (url: string) => {
    navigate(url);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="header-center" ref={searchRef}>
      <div className="search-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Szukaj... (min. 2 znaki)"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (flatResults.length > 0) setIsOpen(true);
          }}
        />
      </div>

      {isOpen && flatResults.length > 0 && (
        <div className="search-results-dropdown">
          {/* Renderujemy płaską listę, tak jak chciałeś */}
          {flatResults.map((res) => (
            <div
              key={`${res.type}-${res.id}`}
              className="search-dropdown-item"
              onClick={() => handleResultClick(res.url)}
            >
              <div className="dropdown-icon">
                {res.type === "project" && <FaProjectDiagram />}
                {res.type === "pillar" && <FaCube />}
                {res.type === "item" && <FaTasks />}
              </div>

              <div className="dropdown-info">
                <span className="dropdown-name">{res.name}</span>
                {res.parentName && (
                  <span className="dropdown-parent">{res.parentName}</span>
                )}
              </div>
            </div>
          ))}

          {/* Stopka */}
          <div
            className="search-footer"
            onClick={() => {
              navigate(`/search?name=${encodeURIComponent(query)}`);
              setIsOpen(false);
            }}
          >
            Wciśnij <strong>Enter</strong>, aby zobaczyć więcej...
          </div>
        </div>
      )}
    </div>
  );
}
