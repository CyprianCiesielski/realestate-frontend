import { Outlet } from "react-router-dom";
import { ProjectSidebarItem } from "./ProjectSidebarItem";
import { useEffect, useState, useRef, useMemo } from "react";
import type { Project } from "./types";
import { getProjects } from "./api";
import { getAllCompanies } from "../company/api";
import type { Company } from "../company/types";
import {
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSortAmountDown,
  FaCheck,
} from "react-icons/fa";
import "./ProjectLayout.css";
import { useRefresh } from "../../context/RefreshContext";

type SortOption = "dateDesc" | "dateAsc" | "alphaAsc" | "alphaDesc";

export function ProjectsLayout() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);

  // Stan filtrów
  const [selectedCompanyNames, setSelectedCompanyNames] = useState<string[]>(
    [],
  );
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]); // <--- NOWY STAN DLA STATUSÓW

  // Stan sortowania
  const [sortOption, setSortOption] = useState<SortOption>("dateDesc");

  // Stany UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const { refreshTrigger } = useRefresh();

  // 1. Pobieranie danych
  useEffect(() => {
    getProjects()
      .then((data) => setAllProjects(data))
      .catch(console.error);

    getAllCompanies()
      .then((data) =>
        setAllCompanies(data.filter((c) => c.state !== "archived")),
      )
      .catch(console.error);
  }, [refreshTrigger]);

  // 2. Zamykanie dropdownów po kliknięciu poza
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. LOGIKA: FILTROWANIE + SORTOWANIE
  const processedProjects = useMemo(() => {
    let result = allProjects;

    // A. Filtrowanie po firmie
    if (selectedCompanyNames.length > 0) {
      result = result.filter((project) => {
        const companyName = project.company?.name;
        return companyName && selectedCompanyNames.includes(companyName);
      });
    }

    // B. Filtrowanie po statusie (LOGIKA ANALOGICZNA DO WĄTKÓW)
    result = result.filter((project) => {
      // Jeśli nic nie wybrano w filtrze statusu, pokazujemy wszystko co NIE JEST zarchiwizowane
      if (selectedStatuses.length === 0) {
        return project.state !== "archived";
      }
      // Jeśli wybrano statusy, sprawdzamy czy projekt je posiada
      return selectedStatuses.includes(project.state || "active");
    });

    // C. Sortowanie
    return [...result].sort((a, b) => {
      switch (sortOption) {
        case "dateDesc":
          return b.id - a.id;
        case "dateAsc":
          return a.id - b.id;
        case "alphaAsc":
          return a.name.localeCompare(b.name);
        case "alphaDesc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [allProjects, selectedCompanyNames, selectedStatuses, sortOption]); // <--- DODANO selectedStatuses

  // Funkcje do przełączania filtrów
  const handleCompanyToggle = (companyName: string) => {
    setSelectedCompanyNames((prev) =>
      prev.includes(companyName)
        ? prev.filter((name) => name !== companyName)
        : [...prev, companyName],
    );
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  return (
    <div
      className={`projects-layout ${!isSidebarOpen ? "sidebar-collapsed" : ""}`}
    >
      <aside className="projects-sidebar">
        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Zwiń pasek" : "Rozwiń pasek"}
        >
          {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        <div className="sidebar-content-wrapper">
          <div className="sidebar-header-row">
            <h3>Projekty ({processedProjects.length})</h3>

            <div className="sidebar-actions">
              {/* --- 1. SORTOWANIE --- */}
              <div className="action-wrapper" ref={sortRef}>
                <button
                  className={`icon-btn ${isSortOpen ? "active" : ""}`}
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  title="Sortowanie"
                >
                  <FaSortAmountDown />
                </button>

                {isSortOpen && (
                  <div className="dropdown-menu sort-menu">
                    <div className="dropdown-title">Sortuj według:</div>

                    <button
                      className={`dropdown-item ${sortOption === "dateDesc" ? "selected" : ""}`}
                      onClick={() => {
                        setSortOption("dateDesc");
                        setIsSortOpen(false);
                      }}
                    >
                      <span>Data: Najnowsze</span>
                      {sortOption === "dateDesc" && <FaCheck size={10} />}
                    </button>

                    <button
                      className={`dropdown-item ${sortOption === "dateAsc" ? "selected" : ""}`}
                      onClick={() => {
                        setSortOption("dateAsc");
                        setIsSortOpen(false);
                      }}
                    >
                      <span>Data: Najstarsze</span>
                      {sortOption === "dateAsc" && <FaCheck size={10} />}
                    </button>

                    <div className="dropdown-divider" />

                    <button
                      className={`dropdown-item ${sortOption === "alphaAsc" ? "selected" : ""}`}
                      onClick={() => {
                        setSortOption("alphaAsc");
                        setIsSortOpen(false);
                      }}
                    >
                      <span>Nazwa: A-Z</span>
                      {sortOption === "alphaAsc" && <FaCheck size={10} />}
                    </button>

                    <button
                      className={`dropdown-item ${sortOption === "alphaDesc" ? "selected" : ""}`}
                      onClick={() => {
                        setSortOption("alphaDesc");
                        setIsSortOpen(false);
                      }}
                    >
                      <span>Nazwa: Z-A</span>
                      {sortOption === "alphaDesc" && <FaCheck size={10} />}
                    </button>
                  </div>
                )}
              </div>

              {/* --- 2. FILTROWANIE --- */}
              <div className="action-wrapper" ref={filterRef}>
                <button
                  className={`icon-btn ${isFilterOpen || selectedCompanyNames.length > 0 || selectedStatuses.length > 0 ? "active" : ""}`}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  title="Filtruj"
                >
                  <FaFilter size={14} />
                  {(selectedCompanyNames.length > 0 ||
                    selectedStatuses.length > 0) && (
                    <span className="dot-indicator" />
                  )}
                </button>

                {isFilterOpen && (
                  <div className="dropdown-menu filter-menu">
                    {/* NOWA SEKCJA: STATUS */}
                    <div className="dropdown-title">Status:</div>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes("active")}
                        onChange={() => handleStatusToggle("active")}
                      />
                      <span>Aktywne</span>
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes("archived")}
                        onChange={() => handleStatusToggle("archived")}
                      />
                      <span style={{ color: "#d9534f" }}>Zarchiwizowane</span>
                    </label>

                    <div className="dropdown-divider" />

                    {/* SEKCJA: FIRMA */}
                    <div className="dropdown-title">Filtruj wg firmy:</div>
                    {allCompanies.length === 0 ? (
                      <div className="dropdown-empty">Brak firm</div>
                    ) : (
                      allCompanies.map((company) => (
                        <label key={company.id} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={selectedCompanyNames.includes(
                              company.name,
                            )}
                            onChange={() => handleCompanyToggle(company.name)}
                          />
                          <span>{company.name}</span>
                        </label>
                      ))
                    )}

                    {(selectedCompanyNames.length > 0 ||
                      selectedStatuses.length > 0) && (
                      <button
                        className="clear-btn"
                        onClick={() => {
                          setSelectedCompanyNames([]);
                          setSelectedStatuses([]);
                        }}
                      >
                        Wyczyść filtry
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {processedProjects.length > 0 ? (
              processedProjects.map((project) => (
                <ProjectSidebarItem key={project.id} project={project} />
              ))
            ) : (
              <div className="empty-sidebar-msg">Brak projektów</div>
            )}
          </nav>
        </div>
      </aside>

      <main className="projects-content">
        <Outlet />
      </main>
    </div>
  );
}
