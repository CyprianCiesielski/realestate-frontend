import { useEffect, useState } from "react";
import { fetchUsers, triggerManualBackup, fetchBackupsList, restoreFromBackupFile } from "./api";
import { type AdminViewUser } from "./types";
import { UserCard } from "../user/UserCard";
import { FaHashtag, FaUserPlus, FaDatabase } from "react-icons/fa";
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
import { CreateUserModal } from "./CreateUserModal";

export const AdminDashboardDetails = () => {
  const [users, setUsers] = useState<AdminViewUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCompanySidebarOpen, setIsCompanySidebarOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

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

  //backupy
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupsList, setBackupsList] = useState<{ id: string, name: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Funkcja obsługująca załadowanie listy backupów
  const handleOpenBackupModal = async () => {
    setIsBackupModalOpen(true);
    try {
      const list = await fetchBackupsList();
      setBackupsList(list);
    } catch (e) { console.error("Błąd ładowania backupów", e); }
  };

  const handleManualBackup = async () => {
    setIsProcessing(true);
    try {
      await triggerManualBackup();
      alert("Backup utworzony i wysłany na Google Drive!");
      const list = await fetchBackupsList(); // odśwież listę po zapisie
      setBackupsList(list);
    } catch (e) {
      alert("Błąd podczas tworzenia backupu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (fileId: string) => {
    if (!window.confirm("UWAGA! To nadpisze obecną bazę danych wybranym backupem. Jesteś absolutnie pewny?")) return;
    setIsProcessing(true);
    try {
      await restoreFromBackupFile(fileId);
      alert("Pomyślnie przywrócono bazę danych z backupu.");
    } catch (e) {
      alert("Błąd podczas przywracania bazy.");
    } finally {
      setIsProcessing(false);
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
            onClick={() => setIsCreateUserModalOpen(true)}
            title="Dodaj nowego użytkownika"
            style={{ transform: "none" }}
          >
            <FaUserPlus />
          </button>

          <button
            className="hash-btn"
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

          <button
            className="hash-btn"
            onClick={handleOpenBackupModal}
            title="Zarządzaj kopiami zapasowymi"
            style={{ transform: "none" }}
          >
            <FaDatabase />
          </button>
        </div>
      </div>

      {/* KONTENER SIATKI (GRID) */}
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
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {/* Modale */}
      {isCreateUserModalOpen && (
        <CreateUserModal
          onClose={() => setIsCreateUserModalOpen(false)}
          onSuccess={() => {
            loadData(); // Odświeżamy listę użytkowników po pomyślnym dodaniu
          }}
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

      {/* MODAL DO ZARZĄDZANIA BACKUPAMI */}
      {isBackupModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2>Kopie zapasowe bazy danych</h2>

            <button
              onClick={handleManualBackup}
              disabled={isProcessing}
              style={{ width: '100%', padding: '10px', background: '#0052cc', color: 'white', border: 'none', borderRadius: '4px', cursor: isProcessing ? 'not-allowed' : 'pointer', marginBottom: '20px' }}
            >
              {isProcessing ? "Przetwarzanie..." : "Wykonaj teraz nową kopię"}
            </button>

            <h4>Wgraj z Dysku Google:</h4>
            {backupsList.length === 0 ? <p>Brak dostępnych backupów na Dysku.</p> : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {backupsList.map(b => (
                  <li key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #ccc' }}>
                    <span style={{ fontSize: '14px', wordBreak: 'break-all', paddingRight: '10px' }}>{b.name}</span>
                    <button
                      onClick={() => handleRestore(b.id)}
                      disabled={isProcessing}
                      style={{ padding: '5px 10px', background: '#de350b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Przywróć
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button onClick={() => setIsBackupModalOpen(false)} style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#ebecf0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>ZAMKNIJ</button>
          </div>
        </div>
      )}
    </div>
  );
};
