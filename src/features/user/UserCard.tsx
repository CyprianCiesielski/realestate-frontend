import { FaCog } from 'react-icons/fa'; // Import ikonki
import { type AdminViewUser } from '../admin/types';
import './UserCard.css';
import { useNavigate } from 'react-router-dom';

interface UserCardProps {
    user: AdminViewUser;
    onEdit: (user: AdminViewUser) => void;
}

export const UserCard = ({ user, onEdit }: UserCardProps) => {
    const navigate = useNavigate(); // <--- HOOK

    const handleCardClick = () => {
        navigate(`/admin/users/${user.id}`);
    };

    return (
        <div 
                className="user-card"
                onClick={handleCardClick} // <--- OBSŁUGA KLIKNIĘCIA
                style={{ cursor: 'pointer' }}>
                    
            <div className="user-card-header-row">
                <span className="user-name">
                    {user.firstname} {user.lastname}
                </span>
                
                {/* Ikonka edycji (zębatka) */}
                <button 
                    className="edit-user-btn"
                    onClick={(e) => {
                        e.stopPropagation(); // Żeby kliknięcie nie bąbelkowało
                        onEdit(user);
                    }}
                    title="Edytuj użytkownika"
                >
                    <FaCog />
                </button>
            </div>

            <div className="user-card-email">
                {user.email}
            </div>
            
            <div className="user-card-role">
                 {/* Wyświetlamy rolę w małym badge'u */}
                 <span className={`role-badge-small ${user.role.includes('ADMIN') ? 'admin' : ''}`}>
                    {user.role}
                 </span>
            </div>

            <div className="user-card-footer">
                {user.companies ? (
                    <span className="company-badge">{user.companies.map(c => c.name).join(", ")}</span>
                ) : (
                    <span className="no-company">Brak firmy</span>
                )}
                <div style={{ fontSize: '0.7rem', color: '#ccc' }}>#{user.id}</div>
            </div>
        </div>
    );
};