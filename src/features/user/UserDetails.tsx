import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchUserDetails } from './api';
import { type UserDetailData } from './types';
import './UserDetails.css';

export const UserDetails = () => {
    // Pobieramy ID usera z adresu URL (np. /admin/users/5)
    const { userId } = useParams<{ userId: string }>();

    const [user, setUser] = useState<UserDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) return;

        const loadDetails = async () => {
            try {
                setLoading(true);
                const data = await fetchUserDetails(userId);
                setUser(data);
            } catch (err) {
                console.error(err);
                setError('Nie udało się pobrać szczegółów użytkownika.');
            } finally {
                setLoading(false);
            }
        };

        loadDetails();
    }, [userId]);

    if (loading) return <div className="user-details-container">Ładowanie profilu...</div>;
    if (error) return <div className="user-details-container error-msg">{error}</div>;
    if (!user) return <div className="user-details-container">Użytkownik nie został znaleziony.</div>;

    const initials = (user.firstname?.charAt(0) || '') + (user.lastname?.charAt(0) || '');

    return (
        <div className="user-details-container">
            <div className="user-details-header">
                <Link to="/admin" className="back-link">← Wróć do listy użytkowników</Link>
            </div>

            {/* Karta Profilowa */}
            <div className="user-profile-card">
                <div className="profile-avatar-large">
                    {initials.toUpperCase() || 'U'}
                </div>

                <div className="profile-info">
                    <h2 className="profile-name">{user.firstname} {user.lastname}</h2>
                    <div className="profile-email">{user.email}</div>

                    <div className="profile-meta-grid">
                        <div className="meta-item">
                            <label>Rola systemowa</label>
                            <span>{user.role}</span>
                        </div>
                        <div className="meta-item">
                            <label>Firma</label>
                            <span style={{ color: user.company ? '#0052cc' : '#6b778c' }}>
                                {user.company || 'Brak przypisania'}
                            </span>
                        </div>
                        <div className="meta-item">
                            <label>ID Użytkownika</label>
                            <span>#{user.id}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sekcja Projektów */}
            <div className="projects-section">
                <h3>Dostęp do projektów ({user.assignedProjects?.length || 0})</h3>

                {user.assignedProjects && user.assignedProjects.length > 0 ? (
                    <table className="projects-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nazwa Projektu</th>
                                <th>Uprawnienia w projekcie</th>
                            </tr>
                        </thead>
                        <tbody>
                            {user.assignedProjects.map((project) => (
                                <tr key={project.projectId}>
                                    <td style={{ width: '80px', color: '#6b778c' }}>#{project.projectId}</td>
                                    <td className="project-name-cell">{project.projectName}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

                                            {project.permissions && project.permissions.length > 0 ? (
                                                project.permissions.map((perm) => (
                                                    <span
                                                        key={perm}
                                                        className="permission-badge"
                                                        data-perm={perm} 
                                                    >
                                                        {perm.replace('_', ' ')}
                                                    </span>
                                                ))
                                            ) : (
                                                <span style={{ color: '#ccc', fontSize: '0.8rem' }}>Brak uprawnień</span>
                                            )}

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-projects">
                        Ten użytkownik nie posiada dostępu do żadnych projektów.
                    </div>
                )}
            </div>
        </div>
    );
};