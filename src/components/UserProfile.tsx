import React from 'react';
import { Button } from './ui/button';
import { User, LogOut } from 'lucide-react';
import { authService } from '../services';

export default function UserProfile() {
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      {/* User Info */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      
      {/* Logout Button */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleLogout}
        className="flex items-center space-x-1"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </div>
  );
} 