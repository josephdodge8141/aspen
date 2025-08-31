import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { 
  Plus, 
  Edit, 
  Eye, 
  EyeOff, 
  Copy,
  RefreshCw
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  environment: 'dev' | 'stage' | 'prod';
  team: string;
  apiKey: string;
  workflowCount: number;
  expertCount: number;
  segments: Array<{
    name: string;
    type: 'user_id' | 'client_id' | 'custom';
    required: boolean;
  }>;
  createdAt: Date;
  lastUsed?: Date;
}

const mockServices: Service[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    environment: 'prod',
    team: 'Engineering',
    apiKey: 'sk_prod_AbCdEf123456...',
    workflowCount: 5,
    expertCount: 3,
    segments: [
      { name: 'user_id', type: 'user_id', required: true },
      { name: 'store_id', type: 'custom', required: true }
    ],
    createdAt: new Date('2024-01-15'),
    lastUsed: new Date('2024-01-20')
  },
  {
    id: '2',
    name: 'Marketing Dashboard',
    environment: 'stage',
    team: 'Marketing',
    apiKey: 'sk_stage_GhIjKl789012...',
    workflowCount: 2,
    expertCount: 4,
    segments: [
      { name: 'user_id', type: 'user_id', required: true },
      { name: 'client_id', type: 'client_id', required: false }
    ],
    createdAt: new Date('2024-02-01'),
    lastUsed: new Date('2024-02-05')
  },
  {
    id: '3',
    name: 'Analytics Service',
    environment: 'dev',
    team: 'Data',
    apiKey: 'sk_dev_MnOpQr345678...',
    workflowCount: 1,
    expertCount: 2,
    segments: [
      { name: 'user_id', type: 'user_id', required: true }
    ],
    createdAt: new Date('2024-02-10')
  }
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [visibleApiKeys, setVisibleApiKeys] = useState<Set<string>>(new Set());

  const handleEdit = (service: Service) => {
    setEditingService(service);
  };

  const handleCreate = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: '',
      environment: 'dev',
      team: 'Default',
      apiKey: generateApiKey('dev'),
      workflowCount: 0,
      expertCount: 0,
      segments: [
        { name: 'user_id', type: 'user_id', required: true }
      ],
      createdAt: new Date()
    };
    setEditingService(newService);
    setIsCreateModalOpen(true);
  };

  const handleSave = (updatedService: Service) => {
    if (isCreateModalOpen) {
      setServices([...services, updatedService]);
      setIsCreateModalOpen(false);
    } else {
      setServices(services.map(s => s.id === updatedService.id ? updatedService : s));
    }
    setEditingService(null);
  };

  const toggleApiKeyVisibility = (serviceId: string) => {
    const newVisible = new Set(visibleApiKeys);
    if (newVisible.has(serviceId)) {
      newVisible.delete(serviceId);
    } else {
      newVisible.add(serviceId);
    }
    setVisibleApiKeys(newVisible);
  };

  const generateApiKey = (env: string) => {
    const prefix = `sk_${env}_`;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = prefix;
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const regenerateApiKey = (service: Service) => {
    const newApiKey = generateApiKey(service.environment);
    const updatedService = { ...service, apiKey: newApiKey };
    handleSave(updatedService);
  };

  const getEnvironmentColor = (env: Service['environment']) => {
    switch (env) {
      case 'prod':
        return 'bg-red-100 text-red-800';
      case 'stage':
        return 'bg-yellow-100 text-yellow-800';
      case 'dev':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Services</h1>
          <p className="text-muted-foreground">Manage service integrations and API access</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Register New Service
        </Button>
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Services</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Workflows</TableHead>
                <TableHead>Experts</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>
                    <Badge className={getEnvironmentColor(service.environment)}>
                      {service.environment.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{service.team}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{service.workflowCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{service.expertCount}</Badge>
                  </TableCell>
                  <TableCell>
                    {service.lastUsed ? service.lastUsed.toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit/Create Modal */}
      <Dialog open={!!editingService} onOpenChange={(open) => {
        if (!open) {
          setEditingService(null);
          setIsCreateModalOpen(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateModalOpen ? 'Register New Service' : 'Edit Service'}
            </DialogTitle>
          </DialogHeader>
          
          {editingService && (
            <ServiceForm 
              service={editingService} 
              onSave={handleSave}
              onCancel={() => {
                setEditingService(null);
                setIsCreateModalOpen(false);
              }}
              onRegenerateApiKey={() => regenerateApiKey(editingService)}
              visibleApiKey={visibleApiKeys.has(editingService.id)}
              onToggleApiKeyVisibility={() => toggleApiKeyVisibility(editingService.id)}
              onCopyApiKey={() => copyToClipboard(editingService.apiKey)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ServiceFormProps {
  service: Service;
  onSave: (service: Service) => void;
  onCancel: () => void;
  onRegenerateApiKey: () => void;
  visibleApiKey: boolean;
  onToggleApiKeyVisibility: () => void;
  onCopyApiKey: () => void;
}

function ServiceForm({ 
  service, 
  onSave, 
  onCancel, 
  onRegenerateApiKey, 
  visibleApiKey, 
  onToggleApiKeyVisibility,
  onCopyApiKey 
}: ServiceFormProps) {
  const [formData, setFormData] = useState(service);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addSegment = () => {
    const newSegment = {
      name: '',
      type: 'custom' as const,
      required: false
    };
    setFormData({
      ...formData,
      segments: [...formData.segments, newSegment]
    });
  };

  const updateSegment = (index: number, updates: Partial<typeof formData.segments[0]>) => {
    const newSegments = [...formData.segments];
    newSegments[index] = { ...newSegments[index], ...updates };
    setFormData({ ...formData, segments: newSegments });
  };

  const removeSegment = (index: number) => {
    const newSegments = formData.segments.filter((_, i) => i !== index);
    setFormData({ ...formData, segments: newSegments });
  };

  const maskedApiKey = formData.apiKey.replace(/(.{12}).*(.{4})/, '$1...$2');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Service Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="environment">Environment</Label>
          <Select 
            value={formData.environment} 
            onValueChange={(value) => setFormData({ ...formData, environment: value as Service['environment'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dev">Development</SelectItem>
              <SelectItem value="stage">Staging</SelectItem>
              <SelectItem value="prod">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>API Key</Label>
        <div className="flex items-center space-x-2 mt-1">
          <Input
            value={visibleApiKey ? formData.apiKey : maskedApiKey}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleApiKeyVisibility}
          >
            {visibleApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCopyApiKey}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRegenerateApiKey}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Use this API key to authenticate requests from your service
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Data Segments</Label>
          <Button type="button" variant="outline" size="sm" onClick={addSegment}>
            <Plus className="h-4 w-4 mr-2" />
            Add Segment
          </Button>
        </div>
        
        <div className="space-y-3">
          {formData.segments.map((segment, index) => (
            <div key={index} className="p-3 border rounded-md space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-sm">Name</Label>
                  <Input
                    value={segment.name}
                    onChange={(e) => updateSegment(index, { name: e.target.value })}
                    placeholder="segment_name"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-sm">Type</Label>
                  <Select 
                    value={segment.type} 
                    onValueChange={(value) => updateSegment(index, { type: value as typeof segment.type })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user_id">User ID</SelectItem>
                      <SelectItem value="client_id">Client ID</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={segment.required}
                      onChange={(e) => updateSegment(index, { required: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label className="text-sm">Required</Label>
                  </div>
                  
                  {formData.segments.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSegment(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {segment.type === 'user_id' && 'Standard user identifier for your service'}
                {segment.type === 'client_id' && 'Client-specific identifier for multi-tenant services'}
                {segment.type === 'custom' && 'Custom segment for specialized use cases'}
              </p>
            </div>
          ))}
        </div>
        
        <p className="text-sm text-muted-foreground mt-2">
          Segments help organize and isolate data from your service. The user_id segment is required and ensures data privacy between users.
        </p>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {service.id ? 'Update Service' : 'Register Service'}
        </Button>
      </div>
    </form>
  );
}