import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Users, 
  Shield, 
  Settings, 
  UserPlus,
  Lock,
  AlertCircle
} from 'lucide-react';

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Teams</h1>
        <p className="text-muted-foreground">Manage team access, permissions, and collaboration</p>
      </div>

      {/* Coming Soon Banner */}
      <Card className="border-2 border-dashed border-muted-foreground/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl mb-2">Teams Management Coming Soon</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            We're developing a comprehensive team management system that will allow you to organize users, 
            control access to experts and workflows, and manage permissions across your organization.
          </p>
          <Badge variant="secondary" className="mb-4">
            In Development
          </Badge>
        </CardContent>
      </Card>

      {/* Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">--</div>
            <p className="text-xs text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Teams</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">--</div>
            <p className="text-xs text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Permission Groups</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">--</div>
            <p className="text-xs text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Planned Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Team Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Invite and manage team members
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Create and organize teams
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Role-based access control
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Team-specific resources
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Granular permission controls
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Expert and workflow access levels
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Approval workflows for changes
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Audit logs and activity tracking
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Team Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Team Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Your Team</span>
              <Badge variant="outline">Default</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Role</span>
              <Badge>Admin</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Permissions</span>
              <Badge variant="secondary">Full Access</Badge>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground">
              Currently, all users have full access to create and manage experts, workflows, and services. 
              Team-based permissions and collaboration features will be available in the next release.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}