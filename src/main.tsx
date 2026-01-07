import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RefreshProvider } from "./context/RefreshContext";

import App from "./App.tsx";
import "./index.css";

// Importujemy strony
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage.tsx";
import { ProjectsLayout } from "./components/project/ProjectLayout.tsx";
import { SingleProjectLayout } from "./components/project/SingleProjectLayout.tsx"; // 👈 NOWY IMPORT (sprawdź ścieżkę!)
import { ItemDetailsPage } from "./pages/ItemDetailsPage.tsx";
import { SearchingPage } from "./pages/SearchingPage.tsx";
import { PillarDetailsPage } from "./pages/PillarDetailsPage.tsx";

const router = createBrowserRouter([
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
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RefreshProvider>
      <RouterProvider router={router} />
    </RefreshProvider>
  </React.StrictMode>,
);
