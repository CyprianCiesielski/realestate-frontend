import { type UserColumnData, type AdminViewUser } from "../admin/types";
import { UserCard } from "./UserCard";
import "./UserColumn.css";

interface UserColumnProps {
  column: UserColumnData;
  onEditUser: (user: AdminViewUser) => void;
}

export const UserColumn = ({ column }: UserColumnProps) => {
  return (
    <div className="user-column">
      <div className="user-column-header">
        <span>{column.title}</span>
        <span className="user-count">{column.users.length}</span>
      </div>
      <div className="user-column-content">
        {column.users.map((user: AdminViewUser) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};
