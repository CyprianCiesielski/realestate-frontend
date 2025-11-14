import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.tsx"; // Nasz główny layout
import "./index.css"; // Globalne style

// Importujemy nasze nowe strony
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { ProjectListPage } from "./pages/ProjectListPage.tsx";

// 1. Tworzymy definicję routera
const router = createBrowserRouter([
  {
    path: "/", // Główna ścieżka aplikacji
    element: <App />, // <App /> jest teraz "layoutem" dla wszystkich pod-stron

    // "Dzieci" to strony, które będą renderowane w <Outlet />
    children: [
      {
        path: "/", // Gdy użytkownik jest na "/"
        element: <DashboardPage />,
      },
      {
        path: "/projects", // Gdy użytkownik jest na "/projects"
        element: <ProjectListPage />,
      },
      // W przyszłości dodasz tu np.:
      // { path: '/projects/:id', element: <ProjectDetailsPage /> }
    ],
  },
]);

// 2. Renderujemy aplikację używając <RouterProvider />
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
