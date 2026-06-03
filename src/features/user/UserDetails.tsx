import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchUserDetails, grantUserPermissions } from "./api";
import { type UserDetailData } from "./types";
import { FaPlus, FaTimes, FaSearch, FaSave } from "react-icons/fa";
import { getAllCompanies } from "../../components/company/api";
import "./UserDetails.css";

import { assignCompanyToUser, updateUserDetailsByAdmin } from "../admin/api";

interface Company {
  id: number;
  name: string;
}

const ALL_PERMISSIONS = ["CAN_VIEW", "CAN_EDIT", "CAN_CREATE"];

export const UserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>([]);
  const [isSavingCompanies, setIsSavingCompanies] = useState(false);

  const [activeDropdownProjectId, setActiveDropdownProjectId] = useState<
    number | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [projectSearchQuery, setProjectSearchQuery] = useState("");

  // --- STANY DO EDYCJI ---
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    googleDriveEmail: "",
    canCreateProjects: false,
    canDeleteProjects: false,
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  const loadDetails = async () => {
    if (!userId) return;
    try {
      const [userData, companiesData] = await Promise.all([
        fetchUserDetails(userId),
        getAllCompanies(),
      ]);

      setUser(userData);
      setAllCompanies(companiesData);

      // Inicjalizacja formularza włącznie z nowymi uprawnieniami
      setEditFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        googleDriveEmail: userData.googleDriveEmail || "",
        canCreateProjects: userData.canCreateProjects || false,
        canDeleteProjects: userData.canDeleteProjects || false,
      });

      if (userData.companies && Array.isArray(userData.companies)) {
        const initialIds = userData.companies
          .map(
            (companyName) =>
              companiesData.find((c) => c.name === companyName)?.id,
          )
          .filter((id): id is number => id !== undefined);

        setSelectedCompanyIds(initialIds);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.customMessage || "Nie udało się pobrać danych.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [userId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSavingProfile(true);
    setProfileSuccessMsg("");
    setError("");

    try {
      await updateUserDetailsByAdmin(Number(userId), editFormData);
      setProfileSuccessMsg("Profil zaktualizowany!");
      await loadDetails();
      setTimeout(() => setProfileSuccessMsg(""), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.customMessage || "Nie udało się zaktualizować profilu.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveCompanies = async () => {
    if (!userId) return;
    setIsSavingCompanies(true);
    try {
      await assignCompanyToUser(Number(userId), selectedCompanyIds);
      alert("Zapisano przypisane firmy!");
      await loadDetails();
    } catch (err: any) {
      alert(err.customMessage || "Nie udało się zapisać zmian.");
      console.error(err);
    } finally {
      setIsSavingCompanies(false);
    }
  };

  const handleCheckboxChange = (companyId: number) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId],
    );
  };

  const handleAddPermission = async (
    projectId: number,
    currentPermissions: string[],
    newPermission: string,
  ) => {
    if (!user) return;
    try {
      const updatedPermissions = [...currentPermissions, newPermission];
      await grantUserPermissions(user.id, projectId, updatedPermissions);
      setActiveDropdownProjectId(null);
      await loadDetails();
    } catch (err: any) {
      alert(
        err.customMessage || "Wystąpił błąd podczas dodawania uprawnienia.",
      );
    }
  };

  const handleRemovePermission = async (
    projectId: number,
    currentPermissions: string[],
    permissionToRemove: string,
  ) => {
    if (!user) return;
    try {
      const updatedPermissions = currentPermissions.filter(
        (p) => p !== permissionToRemove,
      );
      await grantUserPermissions(user.id, projectId, updatedPermissions);
      await loadDetails();
    } catch (err: any) {
      alert(err.customMessage || "Błąd podczas usuwania uprawnienia.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdownProjectId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading)
    return <div className="user-details-container">Ładowanie...</div>;
  if (error)
    return <div className="user-details-container error-msg">{error}</div>;
  if (!user) return <div className="user-details-container">Brak danych.</div>;

  const isGlobalAdmin = user.role === "ADMIN" || user.role === "ROLE_ADMIN";
  const initials =
    (user.firstName?.charAt(0) || "") + (user.lastName?.charAt(0) || "");

  const filteredProjects =
    user?.assignedProjects?.filter((project) => {
      const query = projectSearchQuery.toLowerCase();
      return (
        project.projectName.toLowerCase().includes(query) ||
        project.projectId.toString().includes(query)
      );
    }) || [];

  return (
    <div className="user-details-container">
      <div className="user-details-header">
        <Link to="/admin" className="back-link">
          ← Wróć do listy użytkowników
        </Link>
      </div>

      <div className="user-details-content">
        <div className="user-details-left">
          <div
            className="user-profile-card"
            style={{ flexDirection: "column", gap: "1rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              <div className="profile-avatar-large">
                {initials.toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="profile-name">Edycja Danych</h2>
                <div
                  className="profile-meta-grid"
                  style={{
                    borderTop: "none",
                    paddingTop: 0,
                    marginTop: "8px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #dfe1e6",
                  }}
                >
                  <div className="meta-item">
                    <label>Rola</label>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: isGlobalAdmin ? "#bf2600" : "#172b4d",
                      }}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="meta-item">
                    <label>ID</label>
                    <span>#{user.id}</span>
                  </div>
                  <div className="meta-item">
                    <label>Zarządzane Projekty</label>
                    <span>{user.assignedProjects?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} style={{ marginTop: "1rem" }}>
              <div
                style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#6b778c",
                      marginBottom: "4px",
                    }}
                  >
                    Imię
                  </label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        firstName: e.target.value,
                      })
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #dfe1e6",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#6b778c",
                      marginBottom: "4px",
                    }}
                  >
                    Nazwisko
                  </label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        lastName: e.target.value,
                      })
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #dfe1e6",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#6b778c",
                    marginBottom: "4px",
                  }}
                >
                  Email (Login)
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #dfe1e6",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#6b778c",
                    marginBottom: "4px",
                  }}
                >
                  Email do Dysku Google
                </label>
                <input
                  type="email"
                  value={editFormData.googleDriveEmail}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      googleDriveEmail: e.target.value,
                    })
                  }
                  placeholder="Opcjonalne"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #dfe1e6",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* SEKACJA CHECKBOXÓW UPRAWNIEŃ GLOBALNYCH W FORMULARZU */}
              <div
                style={{
                  marginBottom: "1.5rem",
                  display: "flex",
                  gap: "1.5rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#172b4d",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editFormData.canCreateProjects}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        canCreateProjects: e.target.checked,
                      })
                    }
                    style={{ width: "16px", height: "16px" }}
                  />
                  Może tworzyć nowe projekty
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#172b4d",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editFormData.canDeleteProjects}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        canDeleteProjects: e.target.checked,
                      })
                    }
                    style={{ width: "16px", height: "16px" }}
                  />
                  Może usuwać projekty
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {profileSuccessMsg ? (
                  <span
                    style={{
                      color: "#006644",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  >
                    {profileSuccessMsg}
                  </span>
                ) : (
                  <span></span>
                )}
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#0052cc",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: 600,
                    cursor: isSavingProfile ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {isSavingProfile ? (
                    "Zapisywanie..."
                  ) : (
                    <>
                      <FaSave /> Zapisz dane
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="projects-section">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ margin: 0 }}>
                Dostęp do projektów ({user.assignedProjects?.length || 0})
              </h3>
              {user.assignedProjects && user.assignedProjects.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "250px",
                    padding: "6px 12px",
                    backgroundColor: "#f4f5f7",
                    border: "2px solid #dfe1e6",
                    borderRadius: "4px",
                    transition: "border-color 0.2s, background-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#4c9aff";
                    e.currentTarget.style.backgroundColor = "#fff";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#dfe1e6";
                    e.currentTarget.style.backgroundColor = "#f4f5f7";
                  }}
                >
                  <FaSearch
                    style={{
                      color: "#6b778c",
                      marginRight: "8px",
                      fontSize: "0.9rem",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Szukaj projektu lub ID..."
                    value={projectSearchQuery}
                    onChange={(e) => setProjectSearchQuery(e.target.value)}
                    style={{
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      width: "100%",
                      fontSize: "0.9rem",
                      color: "#172b4d",
                    }}
                  />
                </div>
              )}
            </div>

            {user.assignedProjects && user.assignedProjects.length > 0 ? (
              <div className="projects-table-container">
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Projekt</th>
                      <th>Uprawnienia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.length > 0 ? (
                      filteredProjects.map((project) => (
                        <tr key={project.projectId}>
                          <td style={{ width: "60px", color: "#6b778c" }}>
                            #{project.projectId}
                          </td>
                          <td className="project-name-cell">
                            {project.projectName}
                          </td>
                          <td>
                            <div className="permissions-container">
                              {project.permissions.map((perm) => (
                                <span
                                  key={perm}
                                  className="permission-badge"
                                  data-perm={perm}
                                >
                                  {!isGlobalAdmin && (
                                    <button
                                      className="remove-permission-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemovePermission(
                                          project.projectId,
                                          project.permissions,
                                          perm,
                                        );
                                      }}
                                    >
                                      <FaTimes />
                                    </button>
                                  )}
                                  {perm.replace("_", " ")}
                                </span>
                              ))}

                              {!isGlobalAdmin &&
                                !ALL_PERMISSIONS.every((p) =>
                                  project.permissions.includes(p),
                                ) && (
                                  <div
                                    className="add-permission-wrapper"
                                    ref={
                                      activeDropdownProjectId ===
                                      project.projectId
                                        ? dropdownRef
                                        : null
                                    }
                                  >
                                    <button
                                      className="add-permission-btn"
                                      onClick={() =>
                                        setActiveDropdownProjectId(
                                          activeDropdownProjectId ===
                                            project.projectId
                                            ? null
                                            : project.projectId,
                                        )
                                      }
                                    >
                                      <FaPlus />
                                    </button>
                                    {activeDropdownProjectId ===
                                      project.projectId && (
                                      <div className="permissions-dropdown">
                                        {ALL_PERMISSIONS.filter(
                                          (p) =>
                                            !project.permissions.includes(p),
                                        ).map((option) => (
                                          <div
                                            key={option}
                                            className="permission-option"
                                            onClick={() =>
                                              handleAddPermission(
                                                project.projectId,
                                                project.permissions,
                                                option,
                                              )
                                            }
                                          >
                                            {option.replace("_", " ")}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          style={{
                            textAlign: "center",
                            padding: "2rem",
                            color: "#6b778c",
                            fontStyle: "italic",
                          }}
                        >
                          Nie znaleziono projektów pasujących do wyszukiwania "
                          {projectSearchQuery}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-projects">
                Ten użytkownik nie posiada dostępu do żadnych projektów.
              </div>
            )}
          </div>
        </div>

        <div className="user-details-right">
          <div className="companies-section-card">
            <h3>Przypisane Firmy</h3>
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
                <div style={{ color: "#999", fontSize: "0.9rem" }}>
                  Brak dostępnych firm w systemie.
                </div>
              )}
            </div>
            <button
              className="save-companies-btn"
              onClick={handleSaveCompanies}
              disabled={isSavingCompanies || loading}
            >
              {isSavingCompanies ? "Zapisywanie..." : "Zapisz firmy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
