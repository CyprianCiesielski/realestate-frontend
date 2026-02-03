import { Outlet } from "react-router-dom";
import { ProjectSidebarItem } from "./ProjectSidebarItem";
import { useEffect, useState, useRef, useMemo } from "react";
import type { Project } from "./types";
import { getProjects } from "./api";
import { getAllCompanies } from "../company/api";
import type { Company } from "../company/types";
import { FaChevronLeft, FaChevronRight, FaFilter } from "react-icons/fa";
import "./ProjectLayout.css";
import { useRefresh } from "../../context/RefreshContext";

export function ProjectsLayout() {
  // 1. DANE: Trzymamy tu WSZYSTKIE projekty (nieprzefiltrowane)
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  // 2. DANE: Lista dostępnych firm do filtra
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);

  // 3. STAN FILTRA: Tablica nazw wybranych firm
  const [selectedCompanyNames, setSelectedCompanyNames] = useState<string[]>(
    [],
  );

  // Stany UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const { refreshTrigger } = useRefresh();

  // 4. POBIERANIE DANYCH (Tylko raz lub przy odświeżeniu)
  useEffect(() => {
    // Pobierz projekty
    getProjects()
      .then((data) => {
        console.log("Pobrano projekty:", data); // Debug
        setAllProjects(data);
      })
      .catch(console.error);

    // Pobierz firmy (tylko raz, chyba że chcesz też odświeżać przy triggerze)
    getAllCompanies()
      .then((data) =>
        setAllCompanies(data.filter((c) => c.state !== "archived")),
      )
      .catch(console.error);
  }, [refreshTrigger]);

  // 5. ZAMYKANIE DROPDOWNU (Kliknięcie poza)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 6. LOGIKA FILTROWANIA (Obliczana w locie przy każdym renderze)
  // Używamy useMemo dla wydajności, ale zwykły const też by zadziałał natychmiast.
  const filteredProjects = useMemo(() => {
    console.log("Filtrowanie...", selectedCompanyNames);

    if (selectedCompanyNames.length === 0) {
      return allProjects;
    }

    return allProjects.filter((project) => {
      // Jeśli projekt nie ma przypisanej firmy, a filtr jest włączony -> ukrywamy go
      // (lub zmien logic na true, jeśli chcesz widzieć projekty bez firmy)
      if (!project.company) return false;

      return selectedCompanyNames.includes(project.company.name);
    });
  }, [allProjects, selectedCompanyNames]);

  // Obsługa kliknięcia w checkbox
  const handleFilterChange = (companyName: string) => {
    setSelectedCompanyNames(
      (prev) =>
        prev.includes(companyName)
          ? prev.filter((name) => name !== companyName) // Usuń
          : [...prev, companyName], // Dodaj
    );
  };

  return (
    <div
      className={`projects-layout ${!isSidebarOpen ? "sidebar-collapsed" : ""}`}
    >
      {/* SIDEBAR */}
      <aside className="projects-sidebar">
        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Zwiń pasek" : "Rozwiń pasek"}
        >
          {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        <div className="sidebar-content-wrapper">
          {/* NAGŁÓWEK + FILTR */}
          <div className="sidebar-header-row" ref={filterRef}>
            <h3>Projekty</h3>

            <button
              className={`filter-icon-btn ${isFilterOpen || selectedCompanyNames.length > 0 ? "active" : ""}`}
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
              }}
              title="Filtruj wg firmy"
            >
              <FaFilter />
              {selectedCompanyNames.length > 0 && (
                <span className="filter-dot" />
              )}
            </button>

            {/* DROPDOWN MENU */}
            {isFilterOpen && (
              <div className="filter-dropdown-menu">
                <div className="filter-title">Filtruj wg firmy:</div>
                {allCompanies.length === 0 ? (
                  <div className="filter-empty">Brak firm</div>
                ) : (
                  allCompanies.map((company) => (
                    <label key={company.id} className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedCompanyNames.includes(company.name)}
                        onChange={() => handleFilterChange(company.name)}
                      />
                      <span>{company.name}</span>
                    </label>
                  ))
                )}

                {selectedCompanyNames.length > 0 && (
                  <button
                    className="filter-clear-btn"
                    onClick={() => setSelectedCompanyNames([])}
                  >
                    Wyczyść filtry
                  </button>
                )}
              </div>
            )}
          </div>

          {/* LISTA PROJEKTÓW */}
          <nav className="sidebar-nav">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ProjectSidebarItem key={project.id} project={project} />
              ))
            ) : (
              <div className="empty-sidebar-msg">
                {allProjects.length === 0
                  ? "Brak projektów"
                  : "Brak wyników dla filtrów"}
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="projects-content">
        <Outlet />
      </main>
    </div>
  );
}
