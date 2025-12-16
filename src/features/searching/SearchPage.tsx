import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchGlobal } from "./api"; // Upewnij się co do ścieżki
import type { GlobalSearchResult } from "./types"; // Twoje typy z poprzedniego kroku
import "./SearchPage.css"; // Style poniżej

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("name") || ""; // Pobieramy ?name=... z URL

  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Jeśli query jest puste, nie szukamy
    if (!query) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchGlobal({ name: query });
        setResults(data);
      } catch (err) {
        console.error(err);
        setError("Wystąpił błąd podczas wyszukiwania.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]); // Uruchom ponownie, gdy zmieni się parametr w URL

  if (!query)
    return (
      <div className="search-page-container">Wpisz frazę, aby wyszukać.</div>
    );
  if (loading)
    return <div className="search-page-container">Ładowanie wyników...</div>;
  if (error) return <div className="search-page-container error">{error}</div>;

  // Sprawdzamy czy w ogóle coś znaleziono
  const hasResults =
    results &&
    (results.projects.length > 0 ||
      results.pillars.length > 0 ||
      results.items.length > 0);

  return (
    <div className="search-page-container">
      <h1>Wyniki wyszukiwania dla: "{query}"</h1>

      {!hasResults && <p>Nie znaleziono żadnych wyników.</p>}

      {results && (
        <div className="search-results-grid">
          {/* --- SEKJA PROJEKTY --- */}
          {results.projects.length > 0 && (
            <div className="result-column">
              <h3>Projekty ({results.projects.length})</h3>
              <div className="card-list">
                {results.projects.map((project) => (
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

          {/* --- SEKCJA FILARY --- */}
          {results.pillars.length > 0 && (
            <div className="result-column">
              <h3>Filary ({results.pillars.length})</h3>
              <div className="card-list">
                {results.pillars.map((pillar) => (
                  <Link
                    key={pillar.id}
                    to={`/projects/${pillar.project.id}`} // Link do projektu (lub scroll do filaru)
                    className="result-card pillar-card"
                  >
                    <div className="card-title">{pillar.name}</div>
                    <div className="card-meta">
                      Należy do Projektu #{pillar.project.id}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* --- SEKCJA ITEMS (ZADANIA) --- */}
          {results.items.length > 0 && (
            <div className="result-column">
              <h3>Zadania ({results.items.length})</h3>
              <div className="card-list">
                {results.items.map((item) => {
                  // Bezpieczne pobieranie ID rodziców
                  const projectId = item.pillar?.project?.id;
                  const pillarId = item.pillar?.id;

                  // Jeśli brakuje danych rodzica, nie generujemy linku (zabezpieczenie)
                  if (!projectId || !pillarId) {
                    return (
                      <div
                        key={item.id}
                        className="result-card item-card disabled"
                      >
                        <div className="card-title">{item.name}</div>
                        <div className="card-meta error">
                          Błąd danych (brak rodzica)
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      to={`/projects/${projectId}/pillars/${pillarId}/items/${item.id}`}
                      className="result-card item-card"
                    >
                      <div className="card-header">
                        <span className="card-title">{item.name}</span>
                        <span className={`status-tag ${item.state}`}>
                          {item.state}
                        </span>
                      </div>
                      <div className="card-meta">
                        Projekt #{projectId} / Filar #{pillarId}
                      </div>
                      <div className="card-desc">{item.description}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
