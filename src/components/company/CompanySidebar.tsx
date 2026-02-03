import { useEffect, useState } from "react";
import { FaTimes, FaEdit, FaTrash, FaCheck, FaBuilding } from "react-icons/fa";
import {
  getAllCompanies,
  createCompany,
  updateCompany,
  archiveCompany,
} from "../company/api"; // Upewnij się, że ścieżka do api jest poprawna
import type { Company } from "../company/types";
import "./CompanySidebar.css";

interface CompanySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanySidebar = ({ isOpen, onClose }: CompanySidebarProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  // Stan do edycji
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  // Pobierz firmy tylko gdy sidebar się otwiera
  useEffect(() => {
    if (isOpen) {
      loadCompanies();
    }
  }, [isOpen]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      // Zakładam, że backend zwraca też zarchiwizowane, więc filtrujemy je na froncie
      // chyba że backend robi to sam (wtedy .filter nie zaszkodzi)
      const data = await getAllCompanies();
      const activeCompanies = data.filter((c) => c.state !== "archived");
      setCompanies(activeCompanies);
    } catch (error) {
      console.error("Błąd pobierania firm:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    try {
      const newCompany = await createCompany({ name: newCompanyName });
      setCompanies([...companies, newCompany]);
      setNewCompanyName("");
    } catch (error) {
      console.error("Błąd dodawania firmy:", error);
      alert("Nie udało się dodać firmy.");
    }
  };

  const startEditing = (company: Company) => {
    setEditingId(company.id);
    setEditingName(company.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    try {
      const updatedCompany = await updateCompany(id, { name: editingName });
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? updatedCompany : c)),
      );
      cancelEditing();
    } catch (error) {
      console.error("Błąd edycji firmy:", error);
      alert("Nie udało się zaktualizować nazwy.");
    }
  };

  const handleArchive = async (id: number) => {
    if (!window.confirm("Czy na pewno chcesz usunąć (zarchiwizować) tę firmę?"))
      return;

    try {
      await archiveCompany(id);
      // Usuwamy z listy lokalnej
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Błąd archiwizacji:", error);
      alert("Nie udało się usunąć firmy.");
    }
  };

  return (
    <>
      {/* Overlay - kliknięcie zamyka sidebar */}
      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <div className={`sidebar-panel ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaBuilding color="#0052cc" />
            <h2>Zarządzanie Firmami</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Formularz dodawania */}
        <form className="add-company-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Nazwa nowej firmy..."
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
          />
          <button type="submit" className="add-btn">
            Dodaj
          </button>
        </form>

        {/* Lista */}
        <ul className="company-list">
          {loading ? (
            <p style={{ textAlign: "center", color: "#6b778c" }}>
              Ładowanie...
            </p>
          ) : companies.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6b778c" }}>
              Brak aktywnych firm.
            </p>
          ) : (
            companies.map((company) => (
              <li key={company.id} className="company-item">
                {editingId === company.id ? (
                  // TRYB EDYCJI
                  <>
                    <input
                      className="edit-input"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdate(company.id); // Enter zapisuje
                        } else if (e.key === "Escape") {
                          cancelEditing(); // Escape anuluje
                        }
                      }}
                      autoFocus
                    />
                    <div className="company-actions">
                      <button
                        className="action-btn save"
                        onClick={() => handleUpdate(company.id)}
                        title="Zapisz"
                      >
                        <FaCheck />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={cancelEditing}
                        title="Anuluj"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </>
                ) : (
                  // TRYB WYŚWIETLANIA
                  <>
                    <span style={{ fontWeight: 500 }}>{company.name}</span>
                    <div className="company-actions">
                      <button
                        className="action-btn edit"
                        onClick={() => startEditing(company)}
                        title="Edytuj"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleArchive(company.id)}
                        title="Usuń"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
};
