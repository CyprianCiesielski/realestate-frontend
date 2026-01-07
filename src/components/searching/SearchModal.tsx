import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaTimes,
  FaCube,
  FaTasks,
  FaCommentAlt,
  FaProjectDiagram,
} from "react-icons/fa";
import { searchInProject, searchInPillar, searchInItem } from "./api";
import type { SearchResult } from "./api";
import "./SearchModal.css";

interface ScopedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Typ kontekstu: gdzie aktualnie jesteśmy?
  contextType: "global" | "project" | "pillar" | "item";
  // ID kontekstu (np. projectId). Może być nullem dla globalnego wyszukiwania.
  contextId?: string;
}

export function ScopedSearchModal({
  isOpen,
  onClose,
  contextType,
  contextId,
}: ScopedSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Reset stanu po otwarciu/zamknięciu
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      // Focus na input po otwarciu
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Obsługa wyszukiwania z opóźnieniem (debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!query || query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        let data: SearchResult[] = [];

        // Wybór odpowiedniej metody API w zależności od kontekstu
        if (contextType === "project" && contextId) {
          data = await searchInProject(contextId, query);
        } else if (contextType === "pillar" && contextId) {
          data = await searchInPillar(contextId, query);
        } else if (contextType === "item" && contextId) {
          data = await searchInItem(contextId, query);
        } else {
          // Tutaj możesz dodać obsługę globalnego wyszukiwania, jeśli backend to wspiera
          // np. data = await searchGlobal(query);
          console.warn("Global search not implemented yet in this modal");
        }

        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms czekania po ostatnim znaku

    return () => clearTimeout(delayDebounceFn);
  }, [query, contextType, contextId]);

  if (!isOpen) return null;

  // Obsługa kliknięcia w wynik
  const handleNavigate = (result: SearchResult) => {
    onClose();

    // Logika przekierowania w zależności od typu znalezionego obiektu
    if (result.type === "project") {
      navigate(`/projects/${result.id}`);
    } else if (result.type === "pillar") {
      navigate(`/projects/${result.projectId}/pillars/${result.id}`);
    } else if (result.type === "item") {
      navigate(
        `/projects/${result.projectId}/pillars/${result.pillarId}/items/${result.id}`,
      );
    } else if (result.type === "message") {
      console.log("Navigate to message in item", result.id);
      // Możesz przekierować do itemu i dodać parametr ?msg=ID żeby przewinąć
    }
  };

  // Zamykanie na ESC
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content search-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Nagłówek z Inputem */}
        <div className="search-header">
          <FaSearch className="search-icon-input" />
          <input
            ref={inputRef}
            type="text"
            placeholder={`Szukaj w ${contextType}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input-field"
          />
          <button onClick={onClose} className="close-search-btn">
            <FaTimes />
          </button>
        </div>

        {/* Lista Wyników */}
        <div className="search-results-list">
          {isLoading && <div className="loading-row">Szukanie...</div>}

          {!isLoading && results.length === 0 && query.length >= 2 && (
            <div className="no-results">Brak wyników dla "{query}".</div>
          )}

          {!isLoading && query.length < 2 && (
            <div className="search-hint">Wpisz co najmniej 2 znaki...</div>
          )}

          {results.map((res) => (
            <div
              key={`${res.type}-${res.id}`}
              className="search-result-item"
              onClick={() => handleNavigate(res)}
            >
              <div className="result-icon">
                {res.type === "project" && <FaProjectDiagram />}
                {res.type === "pillar" && <FaCube />}
                {res.type === "item" && <FaTasks />}
                {res.type === "message" && <FaCommentAlt />}
              </div>

              <div className="result-info">
                <span className="result-name">
                  {/* Jeśli to długa wiadomość, przytnij tekst */}
                  {res.type === "message" && res.name.length > 60
                    ? res.name.substring(0, 60) + "..."
                    : res.name}
                </span>

                {/* Wyświetlanie kontekstu (np. "w: Nazwa Projektu") */}
                {res.parentName && (
                  <span className="result-parent">w: {res.parentName}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
