import { useEffect, useState } from 'react';
import api from '../api/axios';

// Prosty typ dla Usera w widoku admina
interface AdminViewUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    company: string | null;
    role: string;
}

export const AdminPage = () => {
    const [users, setUsers] = useState<AdminViewUser[]>([]);
    const [loading, setLoading] = useState(true);

    // Pobieranie wszystkich userów (potrzebujesz takiego endpointu w AdminController)
    // Np. GET /api/admin/users
    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Błąd pobierania użytkowników", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAssignCompany = async (userId: number, companyName: string) => {
        if (!companyName) return;
        try {
            await api.patch(`/admin/users/${userId}/company`, { companyName });
            alert('Firma przypisana!');
            fetchUsers(); // Odśwież listę
        } catch (error) {
            alert('Błąd przypisywania firmy');
        }
    };

    if (loading) return <div>Ładowanie panelu administratora...</div>;

    return (
        <div className="admin-page">
            <h1>Panel Administratora</h1>
            
            <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Imię i Nazwisko</th>
                        <th>Aktualna Firma</th>
                        <th>Akcja (Przypisz Firmę)</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.email}</td>
                            <td>{u.firstName} {u.lastName}</td>
                            <td>{u.company || <span style={{color: 'red'}}>Brak</span>}</td>
                            <td>
                                <form 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const form = e.target as HTMLFormElement;
                                        const input = form.elements.namedItem('company') as HTMLInputElement;
                                        handleAssignCompany(u.id, input.value);
                                    }}
                                    style={{ display: 'flex', gap: '5px' }}
                                >
                                    <input name="company" type="text" placeholder="Nazwa firmy" />
                                    <button type="submit">Zapisz</button>
                                </form>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};