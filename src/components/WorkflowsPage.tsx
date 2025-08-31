import React, { useState } from 'react';
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

interface Workflow {
  id: string;
  name: string;
  description: string;
  experts: string[];
  team: string;
  services: string[];
  trigger: 'api' | 'cron' | 'both';
  cronSchedule?: string;
  apiUrl?: string;
  retryCount: number;
  status: 'active' | 'inactive' | 'draft';
}

const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Code Review Pipeline',
    description: 'Automated code review process that analyzes pull requests, checks for best practices, and provides feedback.',
    experts: ['Code Review Assistant', 'Security Analyzer'],
    team: 'Engineering',
    services: ['github-integration', 'slack-notifications'],
    trigger: 'api',
    apiUrl: '/api/workflows/code-review',
    retryCount: 3,
    status: 'active'
  },
  {
    id: '2',
    name: 'Content Creation Workflow',
    description: 'End-to-end content creation pipeline from research to publication.',
    experts: ['Content Strategist', 'SEO Optimizer'],
    team: 'Marketing',
    services: ['wordpress-integration', 'analytics-tracker'],
    trigger: 'both',
    cronSchedule: '0 9 * * 1',
    apiUrl: '/api/workflows/content-creation',
    retryCount: 2,
    status: 'active'
  },
  {
    id: '3',
    name: 'Customer Support Triage',
    description: 'Automatically categorize and route customer support tickets based on content analysis.',
    experts: ['Support Classifier'],
    team: 'Support',
    services: ['zendesk-integration'],
    trigger: 'api',
    apiUrl: '/api/workflows/support-triage',
    retryCount: 1,
    status: 'draft'
  }
];

interface WorkflowsPageProps {
  onEdit: (workflowId: string) => void;
  onCreate: () => void;
}

export default function WorkflowsPage({ onEdit, onCreate }: WorkflowsPageProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (workflowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(workflowId)) {
      newExpanded.delete(workflowId);
    } else {
      newExpanded.add(workflowId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTriggerDisplay = (workflow: Workflow) => {
    if (workflow.trigger === 'both') {
      return `API + CRON (${workflow.cronSchedule})`;
    } else if (workflow.trigger === 'cron') {
      return `CRON (${workflow.cronSchedule})`;
    } else {
      return 'API';
    }
  };

  const handleExecute = (workflowId: string) => {
    // This would navigate to chat page with workflow selected
    console.log('Execute workflow:', workflowId);
  };

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