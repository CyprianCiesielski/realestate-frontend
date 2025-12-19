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
import { ProjectsLayout } from "./features/project/ProjectLayout.tsx";
import { ItemDetailsPage } from "./pages/ItemDetailsPage.tsx";
import { SearchingPage } from "./pages/SearchingPage.tsx";
import { AdminPage } from "./pages/AdminPage.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";

const router = createBrowserRouter([
  // 1. TRASA PUBLICZNA (Dostępna bez logowania)
  // Jest poza <App>, więc nie będzie miała Headera (co jest pożądane na Loginie)
  {
    path: "/login",
    element: <LoginPage />,
  },

  // 2. TRASY CHRONIONE (Wymagają zalogowania)
  {
    // Wszystko co jest wewnątrz tego elementu, przechodzi przez sprawdzenie "czy jest user?"
    element: <ProtectedRoute />, 
    children: [
      {
        path: "/",
        element: <App />, // App ma Header i Outlet
        children: [
          {
            index: true, // To samo co path: "/"
            element: <DashboardPage />,
          },
          {
            path: "/search",
            element: <SearchingPage />,
          },
          {
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
              {
                path: ":projectId",
                element: <ProjectDetailsPage />,
              },
              {
                path: ":projectId/pillars/:pillarId/items/:itemId",
                element: <ItemDetailsPage />,
              },
            ],
          },
          // Tutaj możesz dodać trasę dla Admina
          { path: "/admin", 
            element: <AdminPage /> }
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