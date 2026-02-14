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
import type { SearchResult } from "./types";
import "./SearchModal.css";

interface ScopedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextType: "global" | "project" | "pillar" | "item";
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

  // 1. POPRAWKA: Obliczamy nazwę kontekstu tutaj, żeby była dostępna w JSX
  const getContextLabel = () => {
    switch (contextType) {
      case "project":
        return "projekcie";
      case "pillar":
        return "module"; // lub "filarze"
      case "item":
        return "wątku"; // lub "zadaniu"
      default:
        return "systemie";
    }
  };
  const contextLabel = getContextLabel();

  // Reset stanu po otwarciu
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Obsługa wyszukiwania
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!query || query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        let data: SearchResult[] = [];

        // 2. POPRAWKA: Usunąłem stąd logikę 'nazwa', została tylko logika API
        if (contextType === "project" && contextId) {
          data = await searchInProject(contextId, query);
        } else if (contextType === "pillar" && contextId) {
          data = await searchInPillar(contextId, query);
        } else if (contextType === "item" && contextId) {
          data = await searchInItem(contextId, query);
        } else {
          console.warn("Global search not implemented yet");
        }

        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, contextType, contextId]);

  if (!isOpen) return null;

  const handleNavigate = (result: SearchResult) => {
    onClose();

    if (result.type === "project") {
      navigate(`/projects/${result.id}`);
    } else if (result.type === "pillar") {
      navigate(`/projects/${result.projectId}/pillars/${result.id}`);
    } else if (result.type === "item") {
      navigate(
        `/projects/${result.projectId}/pillars/${result.pillarId}/items/${result.id}`,
      );
    } else if (result.type === "message") {
      // Przykład przekierowania do wiadomości (zakłada strukturę URL)
      navigate(
        `/projects/${result.projectId}/pillars/${result.pillarId}/items/${result.itemId}?msg=${result.id}`,
      );
    }
  };

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
        <div className="search-header">
          <FaSearch className="search-icon-input" />
          <input
            ref={inputRef}
            type="text"
            // 3. POPRAWKA: Używamy zmiennej obliczonej na górze komponentu
            placeholder={`Szukaj w ${contextLabel}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input-field"
          />
          <button onClick={onClose} className="close-search-btn">
            <FaTimes />
          </button>
        </div>

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
                  {res.type === "message" && res.name.length > 60
                    ? res.name.substring(0, 60) + "..."
                    : res.name}
                </span>

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
