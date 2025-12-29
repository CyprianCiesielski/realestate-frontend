import { type UserColumnData, type AdminViewUser } from './types';
import { UserCard } from './UserCard';
import './UserColumn.css';

interface UserColumnProps {
    column: UserColumnData;
    onEditUser: (user: AdminViewUser) => void;
}

export const UserColumn = ({ column, onEditUser }: UserColumnProps) => {
    return (
        <div className="user-column">
            <div className="user-column-header">
                <span>{column.title}</span>
                <span className="user-count">{column.users.length}</span>
            </div>
            <div className="user-column-content">
                {column.users.map(user => (
                    <UserCard key={user.id} user={user} onEdit={onEditUser} />
                ))}
            </div>
        </div>
    );
};