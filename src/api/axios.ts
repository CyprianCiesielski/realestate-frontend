import axios from "axios";

// 1. Ustawiamy bazowy URL na Twoje API w Springu
// Upewnij się, że port (8080) i ścieżka (/api) są poprawne
const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Eksportujemy tę instancję, aby używać jej w całym projekcie
export default apiClient;
