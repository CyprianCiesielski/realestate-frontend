import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchGlobal } from "./api";
import type { GlobalSearchResultDto } from "./types";
import "./SearchPage.css";
// Usunięto import getProjectById, bo nie można go używać wewnątrz return (JSX)

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
              <h3>Moduły ({results.pillars.length})</h3>
              <div className="card-list">
                {results.pillars.map((pillar) => {
                  // Próbujemy pobrać ID projektu z zagnieżdżonego obiektu LUB z płaskiego pola projectId (jeśli masz takie w DTO)
                  // @ts-ignore - ignorujemy błąd TS jeśli typy nie są idealnie zsynchronizowane
                  const projectId = pillar.project?.id || pillar.projectId;
                  // @ts-ignore
                  const projectName = pillar.project?.name;

                  if (!projectId) return null;

                  return (
                    <Link
                      key={pillar.id}
                      to={`/projects/${projectId}/pillars/${pillar.id}`}
                      className="result-card pillar-card"
                    >
                      <div className="card-title">{pillar.name}</div>
                      <div className="card-meta">
                        Należy do Projektu: {projectName || projectId}
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
              <h3>Wątki ({results.items.length})</h3>
              <div className="card-list">
                {results.items.map((item) => {
                  // 1. Pobieranie ID (zakładamy, że item ma strukturę zagnieżdżoną LUB płaskie ID)
                  // @ts-ignore
                  const projectId = item.pillar?.project?.id || item.projectId;
                  // @ts-ignore
                  const pillarId = item.pillar?.id || item.pillarId;

                  // 2. Pobieranie Nazw (korzystamy z getterów dodanych w Item.java: getProjectName, getPillarName)
                  // @ts-ignore
                  const projectName =
                    item.pillar?.project?.name || `ID: ${projectId}`;
                  // @ts-ignore
                  const pillarName = item.pillar?.name || `ID: ${pillarId}`;

                  // Zabezpieczenie
                  if (!projectId || !pillarId) {
                    return (
                      <div
                        key={item.id}
                        className="result-card item-card disabled"
                      >
                        <div className="card-title">{item.name}</div>
                        <div className="card-meta error">
                          Błąd danych (brak kontekstu projektu)
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
                        {/* Wyświetlamy pobrane wyżej nazwy */}
                        Projekt: {projectName} <br />
                        Moduł: {pillarName}
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
