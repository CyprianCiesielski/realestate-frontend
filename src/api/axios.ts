import axios from "axios";

// 1. Ustawiamy bazowy URL na Twoje API w Springu
// Upewnij się, że port (8080) i ścieżka (/api) są poprawne
const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});


// dodaje token do kazdego zadania jesli istnieje
apiClient.interceptors.request.use(
  (config) => {
      const token = localStorage.getItem('token');
      if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
  },
  (error) => {
      return Promise.reject(error);
  }
);

// 2. Eksportujemy tę instancję, aby używać jej w całym projekcie
export default apiClient;
