import axios from "axios";

// 1. Ustawiamy bazowy URL na Twoje API w Springu
// Upewnij się, że port (8080) i ścieżka (/api) są poprawne
const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// dodaje token do kazdego zadania jesli istnieje
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let customMessage = "Wystąpił nieoczekiwany błąd komunikacji z serwerem.";

    // Jeśli serwer odpowiedział statusem błędu (4xx, 5xx)
    if (error.response) {
      // Jeśli mamy nasz customowy komunikat z GlobalExceptionHandler ze Springa
      if (error.response.data && error.response.data.message) {
        customMessage = error.response.data.message;
      }
      // Fallbacki, gdyby Spring nie rzucił czytelnego błędu
      else if (error.response.status === 403) {
        customMessage = "Brak uprawnień do wykonania tej operacji.";
      } else if (error.response.status === 401) {
        customMessage = "Sesja wygasła. Zaloguj się ponownie.";
      } else if (error.response.status === 404) {
        customMessage = "Nie znaleziono żądanego zasobu.";
      }
    }
    // Jeśli w ogóle nie ma odpowiedzi od serwera (np. serwer leży)
    else if (error.request) {
      customMessage =
        "Brak odpowiedzi od serwera. Sprawdź połączenie z internetem.";
    }

    // Doklejamy naszą ładną wiadomość do obiektu błędu, żeby komponenty miały łatwy dostęp
    error.customMessage = customMessage;

    return Promise.reject(error);
  },
);

export default apiClient;
