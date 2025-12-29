import { type UserColumnData, type AdminViewUser } from '../admin/types';
import { UserColumn } from './UserColumn';
import './UserBoard.css';

interface UserBoardProps {
    columns: UserColumnData[];
    onEditUser: (user: AdminViewUser) => void;
}

export const UserBoard = ({ columns, onEditUser }: UserBoardProps) => {
    return (
        <div className="user-board">
            {columns.map(column => (
                <UserColumn 
                    key={column.id} 
                    column={column} 
                    onEditUser={onEditUser}
                />
            ))}
        </div>
    );
};