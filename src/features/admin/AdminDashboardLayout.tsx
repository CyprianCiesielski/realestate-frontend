import { Outlet } from 'react-router-dom';
import { Header } from '../../components/Header';
// import Sidebar...

export const AdminDashboardLayout = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>

            {/* 2. GŁÓWNY KONTENER TREŚCI */}
            <div style={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
            }}>
                
                <Header /> {/* Header przewija się razem ze stroną */}

                {/* Treść (Outlet) rośnie naturalnie w dół */}
                <main style={{ 
                    padding: '2rem',
                    flex: 1 
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};