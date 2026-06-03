import { type AdminViewUser } from "../admin/types";
import "./UserCard.css";
import { useNavigate } from "react-router-dom";

interface UserCardProps {
  user: AdminViewUser;
}

export const UserCard = ({ user }: UserCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/admin/users/${user.id}`);
  };

  return (
    <div className="user-card" onClick={handleCardClick}>
      {/* Główne informacje: Imię i mniejszy email */}
      <div className="user-card-main-info">
        <div className="user-card-name">
          {user.firstName} {user.lastName}
        </div>
        <div className="user-card-email">{user.email}</div>
      </div>

      {/* Rola */}
      <div className="user-card-role">
        <span
          className={`role-badge-small ${user.role.includes("ADMIN") ? "admin" : ""}`}
        >
          {user.role}
        </span>
      </div>

      {/* Stopka z przypisanymi firmami i ID */}
      <div className="user-card-footer">
        {user.companies && user.companies.length > 0 ? (
          <span className="company-badge">
            {user.companies.map((c) => c.name).join(", ")}
          </span>
        ) : (
          <span className="no-company">Brak przypisanych firm</span>
        )}
        <span className="user-card-id">#{user.id}</span>
      </div>
    </div>
  );
};
