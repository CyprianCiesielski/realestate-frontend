import { useEffect, useState } from 'react';
import { fetchUsers, assignCompanyToUser } from './api';
import { type AdminViewUser } from './types';
import { UserCard } from '../user/UserCard';
import { EditUserModal } from './EditUserModal';

export const AdminDashboardDetails = () => {
    // 1. Zmieniamy stan: teraz trzymamy płaską listę userów, nie kolumny
    const [users, setUsers] = useState<AdminViewUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<AdminViewUser | null>(null);

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
            // UWAGA: Nie robimy tutaj setSelectedUser(null) ani alert!
            // Modal sam się zamknie po sukcesie (w funkcji handleSubmit w modalu)
        } catch (error) {
            // Rzucamy błąd dalej, żeby Modal mógł go złapać i wyświetlić .error-msg
            throw error; 
        }
    };

    if (loading) return <div style={{padding: 20}}>Ładowanie użytkowników...</div>;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #dfe1e6', paddingBottom: '10px' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#172b4d' }}>Wszyscy Użytkownicy</h1>
                <span style={{ color: '#6b778c', fontSize: '0.9rem' }}>Liczba kont: {users.length}</span>
            </div>

            {/* KONTENER SIATKI (GRID) */}
            <div style={{ 
                display: 'grid', 
                // Grid automatyczny: kafelki mają min. 280px szerokości i wypełniają przestrzeń
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '20px', 
                overflowY: 'auto', 
                paddingBottom: '20px' 
            }}>
                {users.map(user => (
                    <UserCard 
                        key={user.id} 
                        user={user} 
                        onEdit={(u) => setSelectedUser(u)} 
                    />
                ))}
            </div>

            {selectedUser && (
                <EditUserModal 
                    user={selectedUser} 
                    onClose={() => setSelectedUser(null)} 
                    onSave={handleSaveUser} // Przekazujemy nową funkcję
                />
            )}
        </div>
    );
};