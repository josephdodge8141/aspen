import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
  MessageSquare, 
  Edit, 
  Archive, 
  Plus 
} from 'lucide-react';

interface Expert {
  id: string;
  name: string;
  prompt: string;
  truncatedPrompt: string;
  workflows: string[];
  team: string;
  services: string[];
  model: string;
  inputParams: string;
}

const mockExperts: Expert[] = [
  {
    id: '1',
    name: 'Code Review Assistant',
    prompt: 'You are a senior software engineer specializing in code reviews. Analyze the provided code for best practices, potential bugs, security issues, and performance improvements. Provide constructive feedback with specific suggestions.',
    truncatedPrompt: 'You are a senior software engineer specializing in code reviews...',
    workflows: ['code-analysis', 'security-scan'],
    team: 'Engineering',
    services: ['github-integration', 'slack-notifications'],
    model: 'gpt-4',
    inputParams: '{"code": "string", "language": "string", "context": "object"}'
  },
  {
    id: '2',
    name: 'Content Strategist',
    prompt: 'You are an expert content strategist with deep knowledge of SEO, audience engagement, and brand voice. Help create compelling content that aligns with business objectives and resonates with target audiences.',
    truncatedPrompt: 'You are an expert content strategist with deep knowledge...',
    workflows: ['content-generation', 'seo-optimization'],
    team: 'Marketing',
    services: ['wordpress-integration'],
    model: 'gpt-4',
    inputParams: '{"topic": "string", "audience": "string", "tone": "string"}'
  }
];

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>(mockExperts);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const toggleRow = (expertId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(expertId)) {
      newExpanded.delete(expertId);
    } else {
      newExpanded.add(expertId);
    }
    setExpandedRows(newExpanded);
  };

  const handleEdit = (expert: Expert) => {
    setEditingExpert(expert);
  };

  const handleSave = (updatedExpert: Expert) => {
    setExperts(experts.map(e => e.id === updatedExpert.id ? updatedExpert : e));
    setEditingExpert(null);
  };

  const handleCreate = () => {
    const newExpert: Expert = {
      id: Date.now().toString(),
      name: 'New Expert',
      prompt: '',
      truncatedPrompt: '',
      workflows: [],
      team: 'Default',
      services: [],
      model: 'gpt-4',
      inputParams: '{}'
    };
    setEditingExpert(newExpert);
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = (newExpert: Expert) => {
    setExperts([...experts, newExpert]);
    setEditingExpert(null);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Experts</h1>
          <p className="text-muted-foreground">Manage your AI experts and their configurations</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Expert
        </Button>
      </div>

      {/* Experts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Experts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Workflows</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experts.map((expert) => (
                <Collapsible key={expert.id} asChild>
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="cursor-pointer">
                        <TableCell>
                          {expandedRows.has(expert.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell>{expert.name}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {expert.truncatedPrompt}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{expert.workflows.length}</Badge>
                        </TableCell>
                        <TableCell>{expert.team}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{expert.services.length}</Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEdit(expert)}
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
                              <Label>Full Prompt</Label>
                              <p className="text-sm mt-1">{expert.prompt}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Workflows</Label>
                                <ScrollArea className="h-24 mt-2">
                                  <div className="space-y-1">
                                    {expert.workflows.map((workflow) => (
                                      <Badge key={workflow} variant="secondary" className="mr-1 mb-1">
                                        {workflow}
                                      </Badge>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                              
                              <div>
                                <Label>Services</Label>
                                <ScrollArea className="h-24 mt-2">
                                  <div className="space-y-1">
                                    {expert.services.map((service) => (
                                      <Badge key={service} variant="outline" className="mr-1 mb-1">
                                        {service}
                                      </Badge>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Input Parameters</Label>
                              <pre className="text-xs bg-background p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(JSON.parse(expert.inputParams), null, 2)}
                              </pre>
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

      {/* Edit Modal */}
      <Dialog open={!!editingExpert} onOpenChange={(open) => !open && setEditingExpert(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateModalOpen ? 'Create Expert' : 'Edit Expert'}
            </DialogTitle>
          </DialogHeader>
          
          {editingExpert && (
            <ExpertForm 
              expert={editingExpert} 
              onSave={isCreateModalOpen ? handleCreateSave : handleSave}
              onCancel={() => {
                setEditingExpert(null);
                setIsCreateModalOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ExpertFormProps {
  expert: Expert;
  onSave: (expert: Expert) => void;
  onCancel: () => void;
}

function ExpertForm({ expert, onSave, onCancel }: ExpertFormProps) {
  const [formData, setFormData] = useState(expert);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const truncatedPrompt = formData.prompt.length > 50 
      ? formData.prompt.substring(0, 50) + '...'
      : formData.prompt;
    
    onSave({
      ...formData,
      truncatedPrompt
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea
          id="prompt"
          value={formData.prompt}
          onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
          rows={6}
          placeholder="Enter your expert prompt here. Use {{base.time}} for base parameters and {{input.property}} for input parameters."
          required
        />
      </div>
      
      <div>
        <Label htmlFor="model">Model</Label>
        <Select 
          value={formData.model} 
          onValueChange={(value) => setFormData({ ...formData, model: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="claude-3">Claude 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="inputParams">Input Parameters (JSON)</Label>
        <Textarea
          id="inputParams"
          value={formData.inputParams}
          onChange={(e) => setFormData({ ...formData, inputParams: e.target.value })}
          rows={4}
          placeholder='{"param1": "string", "param2": "object"}'
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Expert
        </Button>
      </div>
    </form>
  );
}