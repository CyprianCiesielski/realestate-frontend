import React, { useState } from 'react';
import { type AdminViewUser } from './types';
import './EditUserModal.css';

interface EditUserModalProps {
    user: AdminViewUser;
    onClose: () => void;
    // Zmieniamy typ na Promise, żeby móc obsłużyć błąd
    onSave: (userId: number, company: string) => Promise<void>;
}

export const EditUserModal = ({ user, onClose, onSave }: EditUserModalProps) => {
    // 1. NAPRAWA NULLA: Jeśli user.company jest null, użyj pustego stringa ''
    const [companyName, setCompanyName] = useState(user.company || '');
    
    // 2. STAN BŁĘDU
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);

        try {
            // Czekamy aż rodzic wykona zapytanie do API
            await onSave(user.id, companyName);
            // Jeśli się uda, zamykamy modal
            onClose(); 
        } catch (err) {
            // Jeśli API zwróci błąd, łapiemy go tutaj
            setError('Nie udało się zapisać zmian. Spróbuj ponownie.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* stopPropagation zapobiega zamykaniu przy kliknięciu w środek modala */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Edytuj użytkownika</h3>
                <p style={{marginBottom: '1rem', color: '#6b778c'}}>
                    {user.firstname} {user.lastname} ({user.email})
                </p>

                {/* 3. WYŚWIETLANIE BŁĘDU */}
                {error && <div className="error-msg">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600 }}>
                            Przypisz Firmę
                        </label>
                        <input
                            type="text"
                            // Ważne: value musi być kontrolowane przez state
                            value={companyName} 
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Wpisz nazwę firmy..."
                            style={{ width: '100%', padding: '8px', border: '2px solid #dfe1e6', borderRadius: '3px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={isSaving}>
                            Anuluj
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};