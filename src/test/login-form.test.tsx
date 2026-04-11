import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from '../components/auth/login-form';
import { AuthProvider } from '../contexts/AuthContext';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    defaults: { baseURL: 'http://localhost:8000' }
  },
  setAccessToken: vi.fn(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginForm = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('renders login form elements', () => {
    renderLoginForm();
    expect(screen.getByRole('heading', { name: /acesse sua conta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('handles login submission successfully', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { access_token: 'fake-access', refresh_token: 'fake-refresh' }
    });
    // For AuthContext fetchUser
    (api.get as any).mockResolvedValueOnce({
      data: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' }
    });

    renderLoginForm();

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/v1/auth/login', expect.any(URLSearchParams), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
    });
  });

  it('displays error message on failed login', async () => {
    (api.post as any).mockRejectedValueOnce({
      response: { data: { detail: 'Credenciais inválidas' } }
    });

    renderLoginForm();

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
  });
});
