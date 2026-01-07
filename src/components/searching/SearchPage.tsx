import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchGlobal } from "./api";
import type { GlobalSearchResultDto } from "./types";
import "./SearchPage.css";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("name") || "";

  const [results, setResults] = useState<GlobalSearchResultDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [query]);

  if (!query)
    return (
      <div className="search-page-container">Wpisz frazę, aby wyszukać.</div>
    );
  if (loading)
    return <div className="search-page-container">Ładowanie wyników...</div>;
  if (error) return <div className="search-page-container error">{error}</div>;

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
          {/* --- PROJEKTY --- */}
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

          {/* --- FILARY --- */}
          {results.pillars.length > 0 && (
            <div className="result-column">
              <h3>Filary ({results.pillars.length})</h3>
              <div className="card-list">
                {results.pillars.map((pillar) => {
                  if (!pillar.project) return null;

                  return (
                    <Link
                      key={pillar.id}
                      // Nawigacja do projektu z parametrem pillar
                      to={`/projects/${pillar.project.id}/pillars/${pillar.id}`}
                      className="result-card pillar-card"
                    >
                      <div className="card-title">{pillar.name}</div>
                      <div className="card-meta">
                        Należy do Projektu #{pillar.project.id}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- ZADANIA (ITEMS) --- */}
          {results.items.length > 0 && (
            <div className="result-column">
              <h3>Zadania ({results.items.length})</h3>
              <div className="card-list">
                {results.items.map((item) => {
                  const projectId = item.pillar?.project?.id;
                  const pillarId = item.pillar?.id;

                  // Zabezpieczenie przed brakiem danych
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
                      </div>
                      <div className="card-meta">
                        Projekt #{projectId} / Filar #{pillarId}
                      </div>
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
