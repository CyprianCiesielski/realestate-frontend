// src/features/auth/Register.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import "./Login.css"; // Wykorzystujemy ten sam plik CSS dla spójności

export const Register = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: ""
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Endpoint backendowy zdefiniowany w AuthenticationController
      await api.post("/auth/register", formData);
      setSuccess(true);
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
         setError("Użytkownik o takim adresie email już istnieje.");
      } else {
         setError("Wystąpił błąd podczas rejestracji. Spróbuj ponownie.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: "center" }}>
          <div className="login-header">
            <h2 style={{ color: "#006644" }}>Sukces!</h2>
            <p>Twoje konto zostało utworzone pomyślnie.</p>
          </div>
          <p style={{ marginBottom: "20px" }}>
            Możesz teraz przejść do strony logowania.
          </p>
          <button 
            className="login-btn" 
            onClick={() => navigate("/login")}
          >
            Przejdź do logowania
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h2>Zarejestruj się</h2>
          <p>Dołącz do RealEstateTracker</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Imię</label>
            <input
              className="login-input"
              type="text"
              name="firstname"
              placeholder="np. Jan"
              value={formData.firstname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Nazwisko</label>
            <input
              className="login-input"
              type="text"
              name="lastname"
              placeholder="np. Kowalski"
              value={formData.lastname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Adres Email</label>
            <input
              className="login-input"
              type="email"
              name="email"
              placeholder="np. jan@firma.pl"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Hasło</label>
            <input
              className="login-input"
              type="password"
              name="password"
              placeholder="Utwórz bezpieczne hasło"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? "Rejestracja..." : "Zarejestruj się"}
          </button>

          <div className="auth-switch-container">
            Masz już konto?{" "}
            <Link to="/login" className="auth-link">
              Zaloguj się
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};