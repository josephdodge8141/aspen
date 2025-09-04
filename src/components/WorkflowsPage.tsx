import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Edit, 
  Archive, 
  Plus 
} from 'lucide-react';
import { workflowsService, type Workflow as BackendWorkflow } from '../services';

interface Workflow extends BackendWorkflow {}

interface WorkflowsPageProps {
  onEdit: (workflowId: string) => void;
  onCreate: () => void;
}

export default function WorkflowsPage({ onEdit, onCreate }: WorkflowsPageProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workflowsService.listWorkflows();
      setWorkflows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (workflowId: number) => {
    const workflowIdStr = workflowId.toString();
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(workflowIdStr)) {
      newExpanded.delete(workflowIdStr);
    } else {
      newExpanded.add(workflowIdStr);
    }
    setExpandedRows(newExpanded);
  };

  // Removed getStatusColor since workflows no longer have status field

  const handleExecute = (workflowId: number) => {
    // This would navigate to chat page with workflow selected
    console.log('Execute workflow:', workflowId);
  };

  const handleDeleteWorkflow = async (workflowId: number) => {
    try {
      await workflowsService.deleteWorkflow(workflowId);
      await loadWorkflows();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workflow');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Workflows</h1>
          <p className="text-muted-foreground">Manage your AI workflows and automation pipelines</p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={loadWorkflows} className="mt-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Workflows Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Experts</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => (
                <Collapsible key={workflow.id} asChild>
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow 
                        className="cursor-pointer"
                        onClick={() => toggleRow(workflow.id)}
                      >
                        <TableCell>
                          {expandedRows.has(workflow.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell>{workflow.name}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {workflow.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{workflow.experts.length}</Badge>
                        </TableCell>
                        <TableCell>{workflow.team}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleExecute(workflow.id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => onEdit(workflow.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={7}>
                          <div className="p-4 bg-muted/50 rounded-md space-y-4">
                            <div>
                              <h4>Full Description</h4>
                              <p className="text-sm mt-1">{workflow.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4>Associated Experts</h4>
                                <ScrollArea className="h-24 mt-2">
                                  <div className="space-y-1">
                                    {workflow.experts.map((expert) => (
                                      <Badge key={expert} variant="secondary" className="mr-1 mb-1">
                                        {expert}
                                      </Badge>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                              
                              <div>
                                <h4>Services</h4>
                                <ScrollArea className="h-24 mt-2">
                                  <div className="space-y-1">
                                    {workflow.services.map((service) => (
                                      <Badge key={service} variant="outline" className="mr-1 mb-1">
                                        {service}
                                      </Badge>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                              
                              <div>
                                <h4>Configuration</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Trigger:</span> {getTriggerDisplay(workflow)}
                                  </div>
                                  {workflow.apiUrl && (
                                    <div>
                                      <span className="text-muted-foreground">API URL:</span> {workflow.apiUrl}
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-muted-foreground">Retry Count:</span> {workflow.retryCount}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}