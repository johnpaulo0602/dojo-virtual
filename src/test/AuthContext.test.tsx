import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import axios from 'axios';

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  }
}));

vi.mock('../lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    defaults: { baseURL: 'http://localhost:8000' }
  },
  setAccessToken: vi.fn(),
}));

const TestComponent = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>No User</div>;
  return <div>{user.name}</div>;
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('starts loading and resolves to no user if no refresh token', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No User')).toBeInTheDocument();
    });
  });

  it('attempts to refresh token and fetch user if refresh token exists', async () => {
    localStorage.setItem('refresh_token', 'fake-token');
    
    // Mock the refresh endpoint for axios (used in initAuth)
    (axios.post as any).mockResolvedValueOnce({
      data: { access_token: 'new-access', refresh_token: 'new-refresh' }
    });

    // Mock the me endpoint
    (api.get as any).mockResolvedValueOnce({
      data: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(axios.post).toHaveBeenCalledWith('http://localhost:8000/api/v1/auth/refresh', { refresh_token: 'fake-token' });
    expect(api.get).toHaveBeenCalledWith('/api/v1/auth/me');
  });
});
