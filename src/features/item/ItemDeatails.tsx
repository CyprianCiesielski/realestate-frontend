import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Item } from "./types";
import "./ItemDetails.css";
import { getItemById } from "./api.ts";

export function ItemDetails() {
  const { projectId, pillarId, itemId } = useParams<{
    projectId: string;
    pillarId: string;
    itemId: string;
  }>();

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemId && projectId && pillarId) {
      setIsLoading(true);
      setError(null);

      getItemById(projectId, pillarId, itemId)
        .then((data) => {
          setItem(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Nie udało się pobrać szczegółów projektu.");
          setIsLoading(false);
        });
    }
  }, [itemId]);

  if (isLoading) return <div className="loading">Ładowanie danych...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!item) return <div className="not-found">Nie znaleziono projektu.</div>;

  return (
    <div className="project-details-container">
      {/* NAGŁÓWEK */}
      <header className="project-header">
        <div className="header-left">
          <h1 className="project-title">{item.name}</h1>
          <span
            className={`project-status ${item.state === "active" ? "active" : ""}`}
          >
            ● {item.state}
          </span>
        </div>

        <div className="header-right"></div>
      </header>

      {/* INFO */}
      <div className="project-info-grid">
        <InfoItem label="Status" value={item.status} />
        <InfoItem label="Start date" value={item.startDate} />
        <InfoItem label="Deadline" value={item.deadline} />
        <InfoItem label="Priority" value={`${item.priority}`} />
      </div>

      {/* SEKCJA OPISU */}
      <div className="description-section">
        <h3 className="section-title">Description</h3>
        <div className="description-content">
          {item.description ? (
            item.description
          ) : (
            <span className="no-data">Brak opisu dla tego zadania.</span>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="info-box">
      <small className="info-label">{label}</small>
      <div className="info-value">{value || "—"}</div>
    </div>
  );
}
