import React, { useState, useEffect } from "react";
import { type AdminViewUser } from "./types";
import { getAllCompanies } from "../../components/company/api";
import "./EditUserModal.css";

// Używamy typu Company z importu (zakładając, że getAllCompanies zwraca ten typ)
// Jeśli getAllCompanies zwraca inny typ, upewnij się, że są zgodne.
interface Company {
  id: number;
  name: string;
}

interface EditUserModalProps {
  user: AdminViewUser;
  onClose: () => void;
  onSave: (userId: number, companyIds: number[]) => Promise<void>;
}

export const EditUserModal = ({
  user,
  onClose,
  onSave,
}: EditUserModalProps) => {
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Pobieranie danych i ustawianie początkowych checkboxów
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pobieramy wszystkie dostępne firmy
        const companiesData = await getAllCompanies();
        setAllCompanies(companiesData);

        // LOGIKA PRE-SELEKCJI (POPRAWIONA):
        const initialIds: number[] = [];

        // Teraz korzystamy z tablicy obiektów 'companies', którą zdefiniowałeś w types.ts
        if (user.companies && Array.isArray(user.companies)) {
          // Mapujemy tablicę obiektów [{id: 1, name: "A"}, ...] na tablicę ID [1, ...]
          const ids = user.companies.map((c) => c.id);
          initialIds.push(...ids);
        }

        setSelectedCompanyIds(initialIds);
      } catch (err) {
        console.error(err);
        setError("Nie udało się pobrać listy firm.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  // 2. Obsługa kliknięcia w checkbox
  const handleCheckboxChange = (companyId: number) => {
    setSelectedCompanyIds((prev) => {
      if (prev.includes(companyId)) {
        // Odznaczamy
        return prev.filter((id) => id !== companyId);
      } else {
        // Zaznaczamy
        return [...prev, companyId];
      }
    });
  };

  // 3. Zapisywanie
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await onSave(user.id, selectedCompanyIds);
      onClose();
    } catch (err) {
      setError("Nie udało się zapisać zmian. Spróbuj ponownie.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Edytuj użytkownika</h3>
        <p style={{ marginBottom: "1rem", color: "#6b778c" }}>
          {user.firstName} {user.lastName} ({user.email})
        </p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Przypisz Firmy
            </label>

            {isLoadingData ? (
              <div style={{ color: "#666", fontSize: "0.9rem" }}>
                Ładowanie firm...
              </div>
            ) : (
              <div className="companies-checkbox-list">
                {allCompanies.length > 0 ? (
                  allCompanies.map((company) => (
                    <label key={company.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedCompanyIds.includes(company.id)}
                        onChange={() => handleCheckboxChange(company.id)}
                      />
                      <span className="checkbox-label">{company.name}</span>
                    </label>
                  ))
                ) : (
                  <div style={{ color: "#999" }}>Brak dostępnych firm.</div>
                )}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving || isLoadingData}
            >
              {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
