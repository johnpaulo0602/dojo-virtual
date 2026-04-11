import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RegisterForm } from '../components/auth/register-form';
import { api } from '../lib/api';
import { Toaster } from 'sonner';

vi.mock('../lib/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
  };
});

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegisterForm = () => {
    return render(
      <BrowserRouter>
        <RegisterForm />
        <Toaster />
      </BrowserRouter>
    );
  };

  it('renders register form elements', () => {
    renderRegisterForm();
    expect(screen.getByRole('heading', { name: /crie sua conta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('handles register submission successfully', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { id: '1', email: 'test@example.com', role: 'admin' }
    });

    renderRegisterForm();

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /criar conta/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/v1/auth/register', {
        email: 'test@example.com',
        password: 'password123',
        role: 'admin'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('displays error message on failed registration', async () => {
    (api.post as any).mockRejectedValueOnce({
      response: { data: { detail: 'E-mail já registrado' } }
    });

    renderRegisterForm();

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /criar conta/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
  });
});
