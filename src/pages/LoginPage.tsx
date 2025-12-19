import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
//import './LoginPage.css'; // (Możesz stworzyć prosty CSS do tego)

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            // Endpoint backendu (zgodny z Twoim AuthController)
            const response = await apiClient.post('/auth/login', { email, password });
            
            // Backend zwraca { token: "..." }
            login(response.data.token);
            
            navigate('/'); // Przekieruj na Dashboard
        } catch (err) {
            setError('Błędny email lub hasło');
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Logowanie</h2>
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Hasło:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>

                <button type="submit">Zaloguj się</button>
            </form>
        </div>
    );
};