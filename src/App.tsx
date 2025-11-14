import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="app-layout">
      {/* W przyszłości tutaj wstawisz swoje komponenty
        np. <Sidebar /> i <Header />
      */}
      <nav style={{ background: "#333", padding: "1rem", color: "white" }}>
        Tutaj będzie Twoja nawigacja (Sidebar/Header)
      </nav>

      {/* <Outlet /> to magiczny komponent React Routera.
        Działa jak placeholder, w którym renderowana jest
        aktualnie wybrana strona (np. DashboardPage).
      */}
      <main style={{ padding: "2rem" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
