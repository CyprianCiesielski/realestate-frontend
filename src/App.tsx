import { Outlet } from "react-router-dom";
import { Header } from "./header/Header.tsx";

function App() {
  return (
    <div className="app-layout">
      <Header /> {/* 👈 Wstawiony Header */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
