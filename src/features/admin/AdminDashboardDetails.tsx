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

  //komunikaty
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [restoreCandidate, setRestoreCandidate] = useState<string | null>(null);

  const [confirmKeyword, setConfirmKeyword] = useState("");

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 5000); // znika po 5 sekundach
  };

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
      showNotification("Utworzono nową kopię i zapisano na Google Drive!", "success");
      const list = await fetchBackupsList();
      setBackupsList(list);
    } catch (e) {
      showNotification("Wystąpił błąd podczas tworzenia kopii.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Zamiast od razu przywracać, przejscie do widoku potwierdzenia
  const initiateRestore = (fileId: string) => {
    setRestoreCandidate(fileId);
    setConfirmKeyword(""); // resetujemy pole wpisywania
  };

  // Właściwe przywracanie, wywoływane dopiero po wpisaniu hasła
  const executeRestore = async () => {
    if (!restoreCandidate) return;

    setIsProcessing(true);
    try {
      await restoreFromBackupFile(restoreCandidate);
      showNotification("Baza danych została pomyślnie przywrócona!", "success");
      setRestoreCandidate(null); // wracamy do listy po sukcesie
    } catch (e) {
      showNotification("Błąd podczas przywracania bazy danych.", "error");
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
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '450px', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>

            {/* SEKCJA POWIADOMIEŃ */}
            {notification && (
              <div style={{
                padding: '12px', marginBottom: '20px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold',
                backgroundColor: notification.type === 'success' ? '#e3fcef' : '#ffebe6',
                color: notification.type === 'success' ? '#006644' : '#bf2600',
                border: `1px solid ${notification.type === 'success' ? '#36b37e' : '#ff5630'}`
              }}>
                {notification.text}
              </div>
            )}

            {/* WIDOK 1: STANDARDOWA LISTA I TWORZENIE BACKUPU */}
            {!restoreCandidate ? (
              <>
                <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>Kopie zapasowe bazy danych</h2>

                <button
                  onClick={handleManualBackup}
                  disabled={isProcessing}
                  style={{ width: '100%', padding: '12px', background: '#0052cc', color: 'white', border: 'none', borderRadius: '4px', cursor: isProcessing ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginBottom: '24px' }}
                >
                  {isProcessing ? "Przetwarzanie..." : "Wykonaj teraz nową kopię"}
                </button>

                <h4 style={{ margin: '0 0 10px 0', color: '#5e6c84' }}>Wgraj z Dysku Google:</h4>

                {backupsList.length === 0 ? <p style={{ color: '#5e6c84' }}>Brak dostępnych backupów na Dysku.</p> : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {backupsList.map(b => (
                      <li key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #dfe1e6' }}>
                        <span style={{ fontSize: '14px', wordBreak: 'break-all', paddingRight: '15px' }}>{b.name}</span>
                        <button
                          onClick={() => initiateRestore(b.id)}
                          disabled={isProcessing}
                          style={{ padding: '6px 12px', background: '#de350b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', flexShrink: 0 }}
                        >
                          Przywróć
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  onClick={() => { setIsBackupModalOpen(false); setNotification(null); }}
                  style={{ marginTop: '24px', width: '100%', padding: '10px', background: '#ebecf0', color: '#172b4d', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Zamknij
                </button>
              </>
            ) : (
              /* WIDOK 2: POTWIERDZENIE PRZYWRÓCENIA (AKCEPTACJA RYZYKA) */
              <>
                <h2 style={{ marginTop: 0, color: '#de350b', borderBottom: '2px solid #de350b', paddingBottom: '10px' }}>⚠️ UWAGA: Operacja krytyczna!</h2>
                <p style={{ lineHeight: '1.5', color: '#172b4d' }}>
                  Próbujesz przywrócić bazę danych z pliku kopii zapasowej. Ta operacja <strong>nieodwracalnie usunie i nadpisze</strong> wszystkie obecne dane w systemie.
                </p>
                <p style={{ lineHeight: '1.5', color: '#172b4d' }}>
                  Aby potwierdzić, wpisz słowo <strong>POTWIERDZAM</strong> w poniższe pole:
                </p>

                <input
                  type="text"
                  value={confirmKeyword}
                  onChange={(e) => setConfirmKeyword(e.target.value)}
                  placeholder="Wpisz POTWIERDZAM"
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '2px solid #dfe1e6', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setRestoreCandidate(null)}
                    disabled={isProcessing}
                    style={{ flex: 1, padding: '10px', background: '#ebecf0', color: '#172b4d', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={executeRestore}
                    disabled={isProcessing || confirmKeyword !== "POTWIERDZAM"}
                    style={{ flex: 1, padding: '10px', background: confirmKeyword === "POTWIERDZAM" ? '#de350b' : '#ffbdad', color: 'white', border: 'none', borderRadius: '4px', cursor: confirmKeyword === "POTWIERDZAM" ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}
                  >
                    {isProcessing ? "Odtwarzanie..." : "Zrozumiałem, przywróć!"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
