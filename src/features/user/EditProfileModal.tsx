import { useState, useEffect } from "react";
import { FaTimes, FaSave } from "react-icons/fa";
import { updateMyProfile } from "./api";
import type { UserDetailData } from "./types";
import "./EditProfileModal.css"; // (Możesz użyć styli z innego modala lub stworzyć nowe)

interface EditProfileModalProps {
  currentUser: UserDetailData;
  onClose: () => void;
  onSuccess: () => void; // Callback do odświeżenia danych w Headerze
}

export function EditProfileModal({
  currentUser,
  onClose,
  onSuccess,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wypełnij formularz obecnymi danymi przy otwarciu
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await updateMyProfile(formData);
      onSuccess(); // Odśwież dane w rodzicu
      onClose(); // Zamknij modal
    } catch (err) {
      console.error(err);
      setError("Nie udało się zaktualizować profilu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edytuj Profil</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Imię</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Nazwisko</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Anuluj
            </button>
            <button type="submit" className="confirm-btn" disabled={isLoading}>
              {isLoading ? (
                "Zapisywanie..."
              ) : (
                <>
                  <FaSave /> Zapisz
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
