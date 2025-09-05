import { aspenClient } from './base';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id?: number;
  message?: string;
}

class AuthService {
  private tokenKey = 'aspen_jwt_token';
  private userKey = 'aspen_user';

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${aspenClient['baseUrl']}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response = await fetch(`${aspenClient['baseUrl']}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
      throw new Error(error.detail || 'Signup failed');
    }

    return response.json();
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    aspenClient.setJwtToken(token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setUser(user: { id: number; name: string; email: string }) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): { id: number; name: string; email: string } | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  removeToken() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    this.removeToken();
    // Clear the JWT token from the client
    aspenClient.clearJwtToken();
    // Reload the page to reset the app state
    window.location.reload();
  }

  initializeAuth() {
    const token = this.getToken();
    if (token) {
      aspenClient.setJwtToken(token);
    }
  }

  // For development - set a dummy token
  setDummyToken() {
    const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    this.setToken(dummyToken);
    this.setUser({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    });
  }


}

export const authService = new AuthService(); 