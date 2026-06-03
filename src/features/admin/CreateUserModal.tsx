import React, { useState, useEffect } from "react";
import { FaTimes, FaSearch } from "react-icons/fa";
import { getAllCompanies } from "../../components/company/api";
import {
  fetchUsers,
  registerNewUserAsAdmin,
  fetchAllProjectsForAdmin,
  assignCompanyToUser,
} from "./api";
import { grantUserPermissions } from "../user/api";
import "./CreateUserModal.css";

interface ProjectWithCompany {
  id: number;
  name: string;
  company?: {
    id: number;
    name: string;
  };
}

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ALL_PERMISSIONS = ["CAN_VIEW", "CAN_EDIT", "CAN_CREATE"];

export const CreateUserModal = ({
  onClose,
  onSuccess,
}: CreateUserModalProps) => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleDriveEmail, setGoogleDriveEmail] = useState("");

  // --- NOWE: GLOBALNE UPRAWNIENIA DO PROJEKTÓW ---
  const [canCreateProjects, setCanCreateProjects] = useState(false);
  const [canDeleteProjects, setCanDeleteProjects] = useState(false);

  const [allCompanies, setAllCompanies] = useState<
    { id: number; name: string }[]
  >([]);
  const [allProjects, setAllProjects] = useState<ProjectWithCompany[]>([]);

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>([]);
  const [projectPermissions, setProjectPermissions] = useState<
    Record<number, string[]>
  >({});

  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [companies, projects] = await Promise.all([
          getAllCompanies(),
          fetchAllProjectsForAdmin().catch(() => []) as Promise<
            ProjectWithCompany[]
          >,
        ]);
        setAllCompanies(companies);
        setAllProjects(projects);
      } catch (err) {
        console.error("Błąd pobierania słowników:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleToggleCompany = (id: number) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id],
    );
  };

  const handleTogglePermission = (projectId: number, perm: string) => {
    setProjectPermissions((prev) => {
      const currentPerms = prev[projectId] || ["CAN_VIEW"];
      if (currentPerms.includes(perm)) {
        return { ...prev, [projectId]: currentPerms.filter((p) => p !== perm) };
      } else {
        return { ...prev, [projectId]: [...currentPerms, perm] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      // Rejestracja z nowymi polami
      await registerNewUserAsAdmin({
        firstname,
        lastname,
        email,
        password,
        googleDriveEmail,
        canCreateProjects,
        canDeleteProjects,
      });

      const usersList = await fetchUsers();
      const newUser = usersList.find((u) => u.email === email);
      if (!newUser)
        throw new Error(
          "Utworzono użytkownika, ale nie można odnaleźć jego ID w systemie.",
        );

      if (selectedCompanyIds.length > 0) {
        await assignCompanyToUser(newUser.id, selectedCompanyIds);
      }

      const dynamicallyAssignedProjects = allProjects.filter(
        (p) => p.company && selectedCompanyIds.includes(p.company.id),
      );

      for (const proj of dynamicallyAssignedProjects) {
        const perms = projectPermissions[proj.id] || ["CAN_VIEW"];
        if (perms.length > 0) {
          await grantUserPermissions(newUser.id, proj.id, perms);
        }
      }

      alert("Użytkownik utworzony pomyślnie i w pełni skonfigurowany!");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err.customMessage ||
          err.message ||
          "Wystąpił błąd podczas tworzenia użytkownika.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const assignedProjects = allProjects.filter(
    (p) => p.company && selectedCompanyIds.includes(p.company.id),
  );
  const filteredProjects = assignedProjects.filter((p) => {
    const q = projectSearchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.id.toString().includes(q);
  });

  return (
    <div className="super-modal-overlay" onClick={onClose}>
      <form
        className="super-modal-content"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="super-modal-header">
          <h2>Kreator Użytkownika</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
              color: "#6b778c",
            }}
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#ffebe6",
              color: "#de350b",
              padding: "12px 24px",
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <div className="super-modal-body">
          <div className="modal-column">
            <div className="form-section">
              <h3>Dane Logowania i Profil</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Imię *</label>
                  <input
                    required
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                  />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Nazwisko *</label>
                  <input
                    required
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Email (Login) *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Hasło początkowe *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </div>

              <div className="input-group">
                <label>Email do Dysku Google (opcjonalnie)</label>
                <input
                  type="email"
                  value={googleDriveEmail}
                  onChange={(e) => setGoogleDriveEmail(e.target.value)}
                />
              </div>

              {/* SEKACJA CHECKBOXÓW UPRAWNIEŃ GLOBALNYCH */}
              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    color: "#172b4d",
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={canCreateProjects}
                    onChange={(e) => setCanCreateProjects(e.target.checked)}
                    style={{ width: "16px", height: "16px" }}
                  />
                  Nadrzędne: Może tworzyć projekty
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    color: "#172b4d",
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={canDeleteProjects}
                    onChange={(e) => setCanDeleteProjects(e.target.checked)}
                    style={{ width: "16px", height: "16px" }}
                  />
                  Nadrzędne: Może usuwać projekty
                </label>
              </div>
            </div>

            <div className="form-section flex-fill">
              <h3>Przypisz Firmy</h3>
              {isLoading ? (
                <p>Ładowanie...</p>
              ) : (
                <div className="companies-scroll-list">
                  {allCompanies.map((company) => (
                    <label key={company.id} className="checkbox-item-modal">
                      <input
                        type="checkbox"
                        checked={selectedCompanyIds.includes(company.id)}
                        onChange={() => handleToggleCompany(company.id)}
                      />
                      {company.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-column">
            <div className="form-section flex-fill">
              <h3>Projekty z wybranych firm</h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6b778c",
                  marginBottom: "12px",
                  flexShrink: 0,
                }}
              >
                Zaznaczając firmę po lewej stronie, jej projekty automatycznie
                pojawiają się poniżej z prawem <b>CAN VIEW</b>. Dodaj ewentualne
                uprawnienia specjalne.
              </p>

              <div className="search-bar-container">
                <FaSearch style={{ color: "#6b778c" }} />
                <input
                  type="text"
                  placeholder="Szukaj projektu lub ID..."
                  value={projectSearchQuery}
                  onChange={(e) => setProjectSearchQuery(e.target.value)}
                  disabled={assignedProjects.length === 0}
                />
              </div>

              <div className="projects-scroll-list">
                {assignedProjects.length === 0 ? (
                  <div className="empty-state-text">
                    Wybierz co najmniej jedną firmę z lewej strony, aby
                    wyświetlić jej projekty.
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="empty-state-text">
                    Nie znaleziono projektów pasujących do frazy "
                    {projectSearchQuery}".
                  </div>
                ) : (
                  filteredProjects.map((proj) => {
                    const perms = projectPermissions[proj.id] || ["CAN_VIEW"];
                    return (
                      <div key={proj.id} className="project-permission-row">
                        <div className="project-permission-header">
                          <span
                            style={{ color: "#6b778c", marginRight: "6px" }}
                          >
                            #{proj.id}
                          </span>
                          {proj.name}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          {ALL_PERMISSIONS.map((perm) => (
                            <label key={perm} className="perm-checkbox-label">
                              <input
                                type="checkbox"
                                checked={perms.includes(perm)}
                                onChange={() =>
                                  handleTogglePermission(proj.id, perm)
                                }
                              />
                              {perm.replace("_", " ")}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="super-modal-footer">
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontWeight: 600,
              color: "#172b4d",
            }}
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSaving || isLoading}
            style={{
              padding: "8px 24px",
              border: "none",
              background: "#0052cc",
              color: "white",
              borderRadius: "4px",
              fontWeight: 600,
              cursor: isSaving ? "not-allowed" : "pointer",
            }}
          >
            {isSaving ? "Tworzenie..." : "Utwórz Użytkownika"}
          </button>
        </div>
      </form>
    </div>
  );
};
