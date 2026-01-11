import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RefreshProvider } from "./context/RefreshContext";
import { AuthProvider } from "./context/AuthContext";

import App from "./App.tsx";
import "./index.css";

// Import stron
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage.tsx";
import { ProjectsLayout } from "./components/project/ProjectLayout.tsx";
import { SingleProjectLayout } from "./components/project/SingleProjectLayout.tsx"; // 👈 NOWY IMPORT (sprawdź ścieżkę!)
import { ItemDetailsPage } from "./pages/ItemDetailsPage.tsx";
import { SearchingPage } from "./pages/SearchingPage.tsx";
import { PillarDetailsPage } from "./pages/PillarDetailsPage.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { ProtectedRoute } from "./header/ProtectedRoute.tsx";
import { AdminDashboardLayout } from "./features/admin/AdminDashboardLayout.tsx";
import { AdminDashboardDetails } from "./features/admin/AdminDashboardDetails.tsx";
import { UserDetails } from "./features/user/UserDetails.tsx";
import { RegisterPage } from "./pages/RegisterPage.tsx";

const router = createBrowserRouter([
  // 1. TRASA PUBLICZNA (Dostępna bez logowania)
  // Jest poza <App>, więc nie będzie miała Headera (co jest pożądane na Loginie)
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register", // To jest URL w przeglądarce
    element: <RegisterPage />,
  },

  // 2. TRASY CHRONIONE (Wymagają zalogowania)
  {
    // Wszystko co jest wewnątrz tego elementu, przechodzi przez sprawdzenie "czy jest user?"
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <App />,
        children: [
          {
            path: "/",
            element: <DashboardPage />,
          },
          {
            path: "/search",
            element: <SearchingPage />,
          },
          {
            // POZIOM 1: Layout z Sidebarem (Lista wszystkich projektów)
            path: "/projects",
            element: <ProjectsLayout />,
            children: [
              {
                index: true,
                element: (
                  <div style={{ padding: 20, color: "#888" }}>
                    ← Wybierz projekt z listy po lewej
                  </div>
                ),
              },
              // POZIOM 2: Layout Konkretnego Projektu (Pobiera dane projektu RAZ)
              {
                path: ":projectId",
                element: <SingleProjectLayout />, // 👈 Tutaj wpinamy nasz nowy layout
                children: [
                  {
                    // Widok główny projektu (/projects/1)
                    index: true,
                    element: <ProjectDetailsPage />,
                  },
                  {
                    // Widok filaru (/projects/1/pillars/5)
                    path: "pillars/:pillarId",
                    element: <PillarDetailsPage />,
                  },
                  {
                    // Widok zadania (/projects/1/pillars/5/items/10)
                    path: "pillars/:pillarId/items/:itemId",
                    element: <ItemDetailsPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute requireAdmin />,
        children: [
          {
            path: "/admin",
            element: <AdminDashboardLayout />, // Header + Kontener
            children: [
              {
                index: true,
                element: <AdminDashboardDetails />, // Tablica z kolumnami
              },
              {
                path: "users/:userId",
                element: <UserDetails />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* AuthProvider musi otaczać wszystko, żeby Router wiedział czy jesteś zalogowany */}
    <AuthProvider>
      <RefreshProvider>
        <RouterProvider router={router} />
      </RefreshProvider>
    </AuthProvider>
  </React.StrictMode>,
);
