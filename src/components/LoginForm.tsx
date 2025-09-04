import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { authService } from '../services';

interface LoginFormProps {
  onLogin: () => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // JWT token form state
  const [token, setToken] = useState('');
  
  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!loginData.email.trim() || !loginData.password.trim()) {
        setError('Please enter both email and password');
        return;
      }

      const response = await authService.login({
        email: loginData.email,
        password: loginData.password,
      });
      
      authService.setToken(response.access_token);
      // Since login doesn't return user info, we'll create a basic user object
      // In a real app, you might want to fetch user details after login
      authService.setUser({
        id: response.user_id || 0,
        name: loginData.email.split('@')[0], // Use email prefix as name
        email: loginData.email
      });
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!signupData.first_name.trim() || !signupData.last_name.trim() || !signupData.email.trim() || !signupData.password.trim()) {
        setError('Please fill in all fields');
        return;
      }

      if (signupData.password !== signupData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (signupData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      const response = await authService.signup({
        first_name: signupData.first_name,
        last_name: signupData.last_name,
        email: signupData.email,
        password: signupData.password,
      });
      
      authService.setToken(response.access_token);
      // Create user object from signup data since response doesn't include full user info
      authService.setUser({
        id: response.user_id || 0,
        name: `${signupData.first_name} ${signupData.last_name}`,
        email: signupData.email
      });
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Please enter a JWT token');
      return;
    }

    try {
      authService.setToken(token.trim());
      setError('');
      onLogin();
    } catch (err) {
      setError('Invalid token format');
    }
  };

  const handleUseDummy = () => {
    authService.setDummyToken();
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Aspen</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to your account or create a new one
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="token">JWT Token</TabsTrigger>
            </TabsList>
            
            {/* Error display */}
            {error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="your@email.com"
                    disabled={loading}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password"
                    disabled={loading}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signup-first-name">First Name</Label>
                    <Input
                      id="signup-first-name"
                      type="text"
                      value={signupData.first_name}
                      onChange={(e) => setSignupData({ ...signupData, first_name: e.target.value })}
                      placeholder="John"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-last-name">Last Name</Label>
                    <Input
                      id="signup-last-name"
                      type="text"
                      value={signupData.last_name}
                      onChange={(e) => setSignupData({ ...signupData, last_name: e.target.value })}
                      placeholder="Doe"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="your@email.com"
                    disabled={loading}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="At least 8 characters"
                    disabled={loading}
                    required
                    minLength={8}
                  />
                </div>
                
                <div>
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    disabled={loading}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>

            {/* JWT Token Tab */}
            <TabsContent value="token" className="space-y-4 mt-4">
              <form onSubmit={handleTokenSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="token">JWT Token</Label>
                  <Input
                    id="token"
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="font-mono text-sm"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    Use Token
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleUseDummy}
                    disabled={loading}
                  >
                    Use Dummy Token (Development)
                  </Button>
                </div>
              </form>
              
              <div className="text-xs text-muted-foreground">
                <p><strong>For development:</strong></p>
                <p>• Use "Use Dummy Token" button, or</p>
                <p>• Set VITE_JWT_TOKEN in .env.local</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 