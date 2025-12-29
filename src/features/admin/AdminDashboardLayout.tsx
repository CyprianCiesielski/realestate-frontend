import { Outlet } from "react-router-dom";
import { Header } from "../../components/Header";

export const AdminDashboardLayout = () => {
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flex: 1, overflow: 'hidden', padding: '20px', backgroundColor: 'white' }}>
                <Outlet />
            </main>
        </div>
    );
};