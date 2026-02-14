import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchUserDetails, grantUserPermissions } from './api';
import { type UserDetailData } from './types';
import { FaPlus, FaTimes } from 'react-icons/fa';
import './UserDetails.css';

// Dostępne uprawnienia (BEZ ADMIN)
const ALL_PERMISSIONS = ['CAN_VIEW', 'CAN_EDIT', 'CAN_DELETE', 'CAN_CREATE'];

export const UserDetails = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<UserDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Stan przechowujący ID projektu, dla którego otwarte jest menu dodawania
    const [activeDropdownProjectId, setActiveDropdownProjectId] = useState<number | null>(null);

    // Ref do obsługi kliknięcia poza dropdownem
    const dropdownRef = useRef<HTMLDivElement>(null);

    const loadDetails = async () => {
        if (!userId) return;
        try {
            const data = await fetchUserDetails(userId);
            setUser(data);
        } catch (err) {
            console.error(err);
            setError('Nie udało się pobrać danych.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDetails();
    }, [userId]);

    const handleAddPermission = async (projectId: number, currentPermissions: string[], newPermission: string) => {
        if (!user) return;
        try {
            const updatedPermissions = [...currentPermissions, newPermission];
            await grantUserPermissions(user.id, projectId, updatedPermissions);
            setActiveDropdownProjectId(null);
            await loadDetails();
        } catch (err) {
            alert('Wystąpił błąd podczas dodawania uprawnienia.');
            console.error(err);
        }
    };

    const handleRemovePermission = async (projectId: number, currentPermissions: string[], permissionToRemove: string) => {
        if (!user) return;
        try {
            const updatedPermissions = currentPermissions.filter(p => p !== permissionToRemove);
            await grantUserPermissions(user.id, projectId, updatedPermissions);
            await loadDetails();
        } catch (err) {
            alert('Błąd podczas usuwania uprawnienia.');
            console.error(err);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdownProjectId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) return <div className="user-details-container">Ładowanie...</div>;
    if (error) return <div className="user-details-container error-msg">{error}</div>;
    if (!user) return <div className="user-details-container">Brak danych.</div>;

    const isGlobalAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';
    const initials = (user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '');

    return (
        <div className="user-details-container">
            <div className="user-details-header">
                <Link to="/admin" className="back-link">← Wróć do listy użytkowników</Link>
            </div>

            <div className="user-profile-card">
                <div className="profile-avatar-large">{initials.toUpperCase() || 'U'}</div>
                <div className="profile-info">
                    <h2 className="profile-name">{user.firstName} {user.lastName}</h2>
                    <div className="profile-email">{user.email}</div>
                    <div className="profile-meta-grid">
                        <div className="meta-item"><label>Rola</label><span>{user.role}</span></div>
                        <div className="meta-item"><label>Firma</label><span>{user.companies && user.companies.length > 0
                            ? user.companies.join(", ")
                            : '-'}</span></div>
                        <div className="meta-item"><label>ID</label><span>#{user.id}</span></div>
                    </div>
                </div>
            </div>

            <div className="projects-section">
                <h3>Dostęp do projektów ({user.assignedProjects?.length || 0})</h3>

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
                                {user.assignedProjects.map((project) => (
                                    <tr key={project.projectId}>
                                        <td style={{ width: '60px', color: '#6b778c' }}>#{project.projectId}</td>
                                        <td className="project-name-cell">{project.projectName}</td>
                                        <td>
                                            <div className="permissions-container">
                                                {/* Wyświetlanie kafelków */}
                                                {project.permissions.map((perm) => (
                                                    <span key={perm} className="permission-badge" data-perm={perm}>
                                                        {!isGlobalAdmin && (
                                                            <button
                                                                className="remove-permission-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemovePermission(project.projectId, project.permissions, perm);
                                                                }}
                                                                title="Usuń uprawnienie"
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        )}
                                                        {perm.replace('_', ' ')}
                                                    </span>
                                                ))}

                                                {/* Przycisk PLUSIK i DROPDOWN opakowane w wrapper dla pozycjonowania */}
                                                {!isGlobalAdmin && !ALL_PERMISSIONS.every(p => project.permissions.includes(p)) && (
                                                    <div
                                                        className="add-permission-wrapper"
                                                        ref={activeDropdownProjectId === project.projectId ? dropdownRef : null}
                                                        style={{ position: 'relative', display: 'inline-flex' }}
                                                    >
                                                        <button
                                                            className="add-permission-btn"
                                                            onClick={() => setActiveDropdownProjectId(
                                                                activeDropdownProjectId === project.projectId ? null : project.projectId
                                                            )}
                                                            title="Dodaj uprawnienie"
                                                        >
                                                            <FaPlus />
                                                        </button>

                                                        {activeDropdownProjectId === project.projectId && (
                                                            <div className="permissions-dropdown">
                                                                {ALL_PERMISSIONS
                                                                    .filter(p => !project.permissions.includes(p))
                                                                    .map(option => (
                                                                        <div
                                                                            key={option}
                                                                            className="permission-option"
                                                                            onClick={() => handleAddPermission(project.projectId, project.permissions, option)}
                                                                        >
                                                                            {option.replace('_', ' ')}
                                                                        </div>
                                                                    ))
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-projects">Ten użytkownik nie posiada dostępu do żadnych projektów.</div>
                )}
            </div>
        </div>
    );
};