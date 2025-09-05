import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Users, 
  Bot,
  Workflow,
  Plus
} from 'lucide-react';
import { expertsService, workflowsService } from '../services';

interface TeamInfo {
  id: number;
  expertCount: number;
  workflowCount: number;
  experts: { id: number; name: string; model_name: string }[];
  workflows: { id: number; name: string; node_count: number }[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [experts, workflows] = await Promise.all([
        expertsService.listExperts(),
        workflowsService.listWorkflows()
      ]);

      const teamMap = new Map<number, TeamInfo>();

      experts.forEach(expert => {
        if (!teamMap.has(expert.team_id)) {
          teamMap.set(expert.team_id, {
            id: expert.team_id,
            expertCount: 0,
            workflowCount: 0,
            experts: [],
            workflows: []
          });
        }
        const team = teamMap.get(expert.team_id)!;
        team.expertCount++;
        team.experts.push({
          id: expert.id,
          name: expert.name,
          model_name: expert.model_name
        });
      });

      workflows.forEach(workflow => {
        if (!teamMap.has(workflow.team_id)) {
          teamMap.set(workflow.team_id, {
            id: workflow.team_id,
            expertCount: 0,
            workflowCount: 0,
            experts: [],
            workflows: []
          });
        }
        const team = teamMap.get(workflow.team_id)!;
        team.workflowCount++;
        team.workflows.push({
          id: workflow.id,
          name: workflow.name,
          node_count: workflow.node_count
        });
      });

      setTeams(Array.from(teamMap.values()).sort((a, b) => a.id - b.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading teams...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Teams</h1>
          <p className="text-muted-foreground">Manage team resources and collaboration</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={loadTeams} className="mt-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team {team.id}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{team.expertCount} Experts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{team.workflowCount} Workflows</span>
                </div>
              </div>

              {/* Experts */}
              {team.experts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Experts</h4>
                  <div className="space-y-1">
                    {team.experts.slice(0, 3).map((expert) => (
                      <div key={expert.id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{expert.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {expert.model_name}
                        </Badge>
                      </div>
                    ))}
                    {team.experts.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{team.experts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Workflows */}
              {team.workflows.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Workflows</h4>
                  <div className="space-y-1">
                    {team.workflows.slice(0, 3).map((workflow) => (
                      <div key={workflow.id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{workflow.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {workflow.node_count} nodes
                        </Badge>
                      </div>
                    ))}
                    {team.workflows.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{team.workflows.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {team.experts.length === 0 && team.workflows.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No resources assigned to this team
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {teams.length === 0 && !loading && (
        <Card className="border-2 border-dashed border-muted-foreground/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl mb-2">No Teams Found</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Teams will appear here automatically when you create experts or workflows with team assignments.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Team Management</h3>
              <p className="text-sm text-blue-700 mt-1">
                Teams are automatically created based on the team_id assigned to experts and workflows. 
                Use the experts and workflows pages to assign resources to different teams.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}