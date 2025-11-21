import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.tsx"; // Nasz główny layout
import "./index.css"; // Globalne style

// Importujemy nasze nowe strony
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage.tsx";
import { ProjectsLayout } from "./features/project/ProjectLayout.tsx";

// 1. Tworzymy definicję routera
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Główny layout aplikacji (Header)
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        // 1. Wchodzimy do sekcji "/projects"
        path: "/projects",
        element: <ProjectsLayout />, // Ładujemy nasz nowy Layout z listą po lewej

        // 2. Co ma być w prawej kolumnie (Outlet)?
        children: [
          {
            index: true, // To się wyświetli, gdy adres to samo "/projects"
            element: (
              <div style={{ padding: 20, color: "#888" }}>
                ← Wybierz projekt z listy po lewej
              </div>
            ),
          },
          {
            path: ":projectId", // To się wyświetli, gdy adres to "/projects/5"
            element: <ProjectDetailsPage />,
          },
        ],
      },
    ],
  },
]);

// 2. Renderujemy aplikację używając <RouterProvider />
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
