import React, { useState, useEffect } from 'react';
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
import { expertsService, type Expert as BackendExpert } from '../services';

interface Expert extends BackendExpert {}

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExperts();
  }, []);

  const loadExperts = async () => {
    try {
      setLoading(true);
      setError(null);
      const backendExperts = await expertsService.listExperts();
      setExperts(backendExperts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load experts');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (expertId: number) => {
    const expertIdStr = expertId.toString();
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(expertIdStr)) {
      newExpanded.delete(expertIdStr);
    } else {
      newExpanded.add(expertIdStr);
    }
    setExpandedRows(newExpanded);
  };

  const handleEdit = (expert: Expert) => {
    setEditingExpert(expert);
  };

  const handleSave = async (updatedExpert: Expert) => {
    try {
      await expertsService.updateExpert(updatedExpert.id, {
        name: updatedExpert.name,
        model_name: updatedExpert.model_name,
        team_id: updatedExpert.team_id,
      });
      await loadExperts();
      setEditingExpert(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expert');
    }
  };

  const handleCreate = () => {
    const newExpert: Expert = {
      id: 0,
      name: 'New Expert',
      model_name: 'gpt-4',
      status: 'active',
      team_id: 1,
      created_on: new Date().toISOString()
    };
    setEditingExpert(newExpert);
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async (newExpert: Expert) => {
    try {
      await expertsService.createExpert({
        name: newExpert.name,
        model_name: newExpert.model_name,
        team_id: newExpert.team_id,
      });
      await loadExperts();
      setEditingExpert(null);
      setIsCreateModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expert');
    }
  };

  const handleDeleteExpert = async (expertId: number) => {
    try {
      await expertsService.deleteExpert(expertId);
      await loadExperts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expert');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading experts...</div>
      </div>
    );
  }

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

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={loadExperts} className="mt-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

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
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Team ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experts.map((expert) => (
                <Collapsible key={expert.id} asChild>
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="cursor-pointer" onClick={() => toggleRow(expert.id)}>
                        <TableCell>
                          {expandedRows.has(expert.id.toString()) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell>{expert.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{expert.model_name}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={expert.status === 'active' ? 'default' : 'secondary'}>
                            {expert.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{expert.team_id}</TableCell>
                        <TableCell>
                          {new Date(expert.created_on).toLocaleDateString()}
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
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteExpert(expert.id)}
                              className="text-destructive hover:text-destructive"
                            >
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Model</Label>
                                <p className="text-sm mt-1">{expert.model_name}</p>
                              </div>
                              
                              <div>
                                <Label>Status</Label>
                                <p className="text-sm mt-1">{expert.status}</p>
                              </div>
                              
                              <div>
                                <Label>Team ID</Label>
                                <p className="text-sm mt-1">{expert.team_id}</p>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Created On</Label>
                              <p className="text-sm mt-1">{new Date(expert.created_on).toLocaleString()}</p>
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
    onSave(formData);
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
        <Label htmlFor="model">Model</Label>
        <Select 
          value={formData.model_name} 
          onValueChange={(value) => setFormData({ ...formData, model_name: value })}
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
        <Label htmlFor="team_id">Team ID</Label>
        <Input
          id="team_id"
          type="number"
          value={formData.team_id}
          onChange={(e) => setFormData({ ...formData, team_id: parseInt(e.target.value) || 1 })}
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