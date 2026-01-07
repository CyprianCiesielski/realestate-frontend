import { Link, useLocation, useOutletContext } from "react-router-dom";
import "./BreadCrumbs.css";
import type { Project } from "../project/types"; // Upewnij się co do ścieżki

export function Breadcrumbs() {
  const location = useLocation();

  // 👇 1. Pobieramy dane z kontekstu (Layoutu), zamiast z location.state
  // Używamy "unknown", bo Breadcrumbs mogą być użyte tam, gdzie nie ma kontekstu projektu
  const contextData = useOutletContext<Project | null>();

  // Rozbijamy URL na kawałki
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Funkcja pomocnicza do szukania nazw w obiekcie project
  const resolveName = (type: string, id: string) => {
    if (!contextData) return id; // Jeśli nie mamy danych, zwracamy ID jako fallback

    if (type === "projects" && String(contextData.id) === id) {
      return contextData.name;
    }

    if (type === "pillars") {
      const foundPillar = contextData.pillars?.find((p) => String(p.id) === id);
      return foundPillar ? foundPillar.name : `Filar ${id}`;
    }

    if (type === "items") {
      // Musimy przeszukać filary, żeby znaleźć item (lub spłaszczyć strukturę)
      // Zakładam, że masz items wewnątrz pillars
      for (const pillar of contextData.pillars || []) {
        const foundItem = pillar.items?.find((i) => String(i.id) === id);
        if (foundItem) return foundItem.name;
      }
      return `Zadanie ${id}`;
    }

    return id;
  };

  return (
    <nav aria-label="breadcrumb" className="breadcrumbs-container">
      <ol className="breadcrumbs-list">
        {/* Link do listy projektów */}
        {/* <li className="breadcrumb-item"><Link to="/projects">Projekty</Link></li> */}

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          // Jeśli to ostatni element, ukrywamy go (zgodnie z Twoim życzeniem z wcześniej)
          if (isLast) return null;

          const isId = !isNaN(Number(value));
          if (!isId) return null; // Ukrywamy słowa 'projects', 'pillars' itp.

          // Określamy typ (projects/pillars/items) na podstawie poprzedniego segmentu
          const type = pathnames[index - 1];

          // Jeśli to itemy, też je ukrywamy (zgodnie z poprzednim życzeniem)
          if (type === "items") return null;

          // 👇 Tu dzieje się magia: pobieramy nazwę z obiektu, a nie z URL/state
          const displayName = resolveName(type, value);

          return (
            <li key={to} className="breadcrumb-item">
              <Link to={to}>{displayName}</Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
