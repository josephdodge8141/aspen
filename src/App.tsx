import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Users, 
  GitBranch, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Separator } from './components/ui/separator';
import ExpertsPage from './components/ExpertsPage';
import WorkflowsPage from './components/WorkflowsPage';
import ChatPage from './components/ChatPage';
import DashboardPage from './components/DashboardPage';
import TeamsPage from './components/TeamsPage';
import ServicesPage from './components/ServicesPage';
import WorkflowEditor from './components/WorkflowEditor';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
import { authService } from './services';

type Page = 'experts' | 'workflows' | 'chat' | 'dashboard' | 'teams' | 'services' | 'workflow-editor';

const navItems = [
  { id: 'experts' as const, label: 'Experts', icon: MessageSquare },
  { id: 'workflows' as const, label: 'Workflows', icon: GitBranch },
  { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
  { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
  { id: 'teams' as const, label: 'Teams', icon: Users },
  { id: 'services' as const, label: 'Services', icon: Settings },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('experts');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user has a valid token in localStorage
    const token = authService.getToken();
    
    if (token) {
      // Initialize the client with the existing token
      authService.initializeAuth();
      setIsAuthenticated(true);
    } else {
      // No token found - user must login
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const handleEditWorkflow = (workflowId: string) => {
    setEditingWorkflow(workflowId);
    setCurrentPage('workflow-editor');
  };

  const handleCreateWorkflow = () => {
    setEditingWorkflow('new');
    setCurrentPage('workflow-editor');
  };

  const handleBackToWorkflows = () => {
    setEditingWorkflow(null);
    setCurrentPage('workflows');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'experts':
        return <ExpertsPage />;
      case 'workflows':
        return <WorkflowsPage onEdit={handleEditWorkflow} onCreate={handleCreateWorkflow} />;
      case 'workflow-editor':
        return <WorkflowEditor workflowId={editingWorkflow} onBack={handleBackToWorkflows} />;
      case 'chat':
        return <ChatPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'teams':
        return <TeamsPage />;
      case 'services':
        return <ServicesPage />;
      default:
        return <ExpertsPage />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="text-sidebar-foreground">Aspen</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id || (currentPage === 'workflow-editor' && item.id === 'workflows');
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                  onClick={() => {
                    if (item.id === 'workflows' && currentPage === 'workflow-editor') {
                      handleBackToWorkflows();
                    } else {
                      setCurrentPage(item.id);
                      if (item.id !== 'workflows') {
                        setEditingWorkflow(null);
                      }
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
                </Button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 border-b bg-card px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-card-foreground capitalize">
              {currentPage === 'workflow-editor' ? 'Workflow Editor' : currentPage}
            </h2>
          </div>
          <UserProfile />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}