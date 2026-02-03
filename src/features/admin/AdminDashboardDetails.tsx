import { useEffect, useState } from "react";
import { fetchUsers, assignCompanyToUser } from "./api";
import { type AdminViewUser } from "./types";
import { UserCard } from "../user/UserCard";
import { EditUserModal } from "./EditUserModal";
import { FaHashtag } from "react-icons/fa";
import { MdDomainAdd } from "react-icons/md";
import type { Tag } from "../../components/tag/types.ts";
import {
  getAllTags,
  createTag,
  updateTag,
  archiveTag,
} from "../../components/tag/api";
import { TagModal } from "../../components/tag/TagModal.tsx";
import { CompanySidebar } from "../../components/company/CompanySidebar.tsx";

export const AdminDashboardDetails = () => {
  // 1. Zmieniamy stan: teraz trzymamy płaską listę userów, nie kolumny
  const [users, setUsers] = useState<AdminViewUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminViewUser | null>(null);

  const [isCompanySidebarOpen, setIsCompanySidebarOpen] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error("Błąd pobierania danych", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveUser = async (userId: number, companyName: string) => {
    try {
      await assignCompanyToUser(userId, companyName);
      await loadData(); // Odśwież listę po sukcesie
    } catch (error) {
      // Rzucamy błąd dalej, żeby Modal mógł go złapać i wyświetlić .error-msg
      throw error;
    }
  };

  // --- LOGIKA TAGÓW ---
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

  // 1. Pobieranie tagów przy starcie
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const data = await getAllTags();
      setTags(data);
    } catch (err) {
      console.error("Błąd pobierania tagów:", err);
    }
  };

  // 2. Dodawanie taga
  const handleAddTag = async (data: { name: string; color: string }) => {
    try {
      const newTag = await createTag({
        name: data.name,
        color: data.color,
      });
      setTags((prev) => [...prev, newTag]);
    } catch (err) {
      console.error("Błąd tworzenia taga:", err);
      alert("Nie udało się utworzyć taga.");
    }
  };

  // 3. Usuwanie (archiwizacja) taga
  const handleRemoveTag = async (tagId: number) => {
    try {
      await archiveTag(tagId);
      // Usuwamy go lokalnie z listy
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch (err) {
      console.error("Błąd usuwania taga:", err);
      alert("Nie udało się usunąć taga.");
    }
  };

  // 4. Edycja taga
  const handleEditTag = async (
    tagId: number,
    data: { name: string; color: string },
  ) => {
    try {
      const updatedTag = await updateTag(tagId, {
        name: data.name,
        color: data.color, // Przekazujemy wybrany kolor do API
      });

      setTags((prev) => prev.map((t) => (t.id === tagId ? updatedTag : t)));
    } catch (err) {
      console.error("Błąd edycji taga:", err);
      alert("Nie udało się edytować taga.");
    }
  };

  if (loading)
    return <div style={{ padding: 20 }}>Ładowanie użytkowników...</div>;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* NAGŁÓWEK */}
      <div
        style={{
          marginBottom: "20px",
          borderBottom: "1px solid #dfe1e6",
          paddingBottom: "10px",
          display: "flex",
          justifyContent: "space-between", // Rozsuwa: Lewa <-> Prawa
          alignItems: "center",
        }}
      >
        {/* LEWA STRONA: Tytuł */}
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#172b4d" }}>
            Wszyscy Użytkownicy
          </h1>
          <span style={{ color: "#6b778c", fontSize: "0.9rem" }}>
            Liczba kont: {users.length}
          </span>
        </div>

        {/* PRAWA STRONA: Kontener na przyciski */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="hash-btn"
            // Pamiętaj, żeby tu dodać obsługę modala Firm (np. setIsCompanyModalOpen(true))
            onClick={() => setIsCompanySidebarOpen(true)}
            title="Zarządzaj firmami"
            style={{ transform: "none" }}
          >
            <MdDomainAdd />
          </button>

          <button
            className="hash-btn"
            onClick={() => setIsTagsModalOpen(true)}
            title="Zarządzaj tagami"
            style={{ transform: "none" }}
          >
            <FaHashtag />
          </button>
        </div>
      </div>

      {/* KONTENER SIATKI (GRID) - reszta bez zmian */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
          overflowY: "auto",
          paddingBottom: "20px",
        }}
      >
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={(u) => setSelectedUser(u)}
          />
        ))}
      </div>

      {/* Modale */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveUser}
        />
      )}

      {isTagsModalOpen && (
        <TagModal
          isOpen={isTagsModalOpen}
          onClose={() => setIsTagsModalOpen(false)}
          tags={tags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onEditTag={handleEditTag}
        />
      )}

      <CompanySidebar
        isOpen={isCompanySidebarOpen}
        onClose={() => setIsCompanySidebarOpen(false)}
      />
    </div>
  );
};
