import React, { useState, useEffect } from 'react';
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
import { servicesService, type Service as BackendService, type ServiceSegment } from '../services';

interface Service extends BackendService {
  segments: ServiceSegment[];
  workflowCount: number;
  expertCount: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [visibleApiKeys, setVisibleApiKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const backendServices = await servicesService.listServices();
      
      const servicesWithDetails = await Promise.all(
        backendServices.map(async (service) => {
          try {
            const segments = await servicesService.listSegments(service.id);
            const exposure = await servicesService.getServiceExposure(service.id);
            
            return {
              ...service,
              segments,
              workflowCount: exposure.workflows.length,
              expertCount: exposure.experts.length,
            } as Service;
          } catch (err) {
            return {
              ...service,
              segments: [],
              workflowCount: 0,
              expertCount: 0,
            } as Service;
          }
        })
      );
      
      setServices(servicesWithDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
  };

  const handleCreate = () => {
    const newService: Service = {
      id: 0,
      name: '',
      environment: 'dev',
      api_key_last4: '',
      segments: [],
      workflowCount: 0,
      expertCount: 0,
    };
    setEditingService(newService);
    setIsCreateModalOpen(true);
  };

  const handleSave = async (updatedService: Service) => {
    try {
      if (isCreateModalOpen) {
        await servicesService.createService({
          name: updatedService.name,
          environment: updatedService.environment,
        });
        setIsCreateModalOpen(false);
      } else {
        // Note: Backend doesn't have update service endpoint yet
        console.warn('Service update not implemented in backend yet');
      }
      await loadServices();
      setEditingService(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service');
    }
  };

  const toggleApiKeyVisibility = (serviceId: number) => {
    const newVisible = new Set(visibleApiKeys);
    const serviceIdStr = serviceId.toString();
    if (newVisible.has(serviceIdStr)) {
      newVisible.delete(serviceIdStr);
    } else {
      newVisible.add(serviceIdStr);
    }
    setVisibleApiKeys(newVisible);
  };

  const regenerateApiKey = async (service: Service) => {
    try {
      const updatedService = await servicesService.rotateApiKey(service.id);
      if (updatedService.api_key_plaintext) {
        setVisibleApiKeys(new Set([service.id.toString()]));
      }
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate API key');
    }
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

  const handleDeleteService = async (serviceId: number) => {
    try {
      await servicesService.deleteService(serviceId);
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading services...</div>
      </div>
    );
  }

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

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={loadServices} className="mt-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

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
                <TableHead>API Key</TableHead>
                <TableHead>Workflows</TableHead>
                <TableHead>Experts</TableHead>
                <TableHead>Segments</TableHead>
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
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">...{service.api_key_last4}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleApiKeyVisibility(service.id)}
                      >
                        {visibleApiKeys.has(service.id.toString()) ? 
                          <EyeOff className="h-4 w-4" /> : 
                          <Eye className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{service.workflowCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{service.expertCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{service.segments.length}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
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
              visibleApiKey={visibleApiKeys.has(editingService.id.toString())}
              onToggleApiKeyVisibility={() => toggleApiKeyVisibility(editingService.id)}
              onCopyApiKey={() => copyToClipboard(editingService.api_key_plaintext || `...${editingService.api_key_last4}`)}
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
      id: 0,
      service_id: formData.id,
      name: '',
    };
    setFormData({
      ...formData,
      segments: [...formData.segments, newSegment]
    });
  };

  const updateSegment = (index: number, updates: Partial<ServiceSegment>) => {
    const newSegments = [...formData.segments];
    newSegments[index] = { ...newSegments[index], ...updates };
    setFormData({ ...formData, segments: newSegments });
  };

  const removeSegment = (index: number) => {
    const newSegments = formData.segments.filter((_, i) => i !== index);
    setFormData({ ...formData, segments: newSegments });
  };

  const apiKeyDisplay = formData.api_key_plaintext || `...${formData.api_key_last4}`;
  const maskedApiKey = formData.api_key_plaintext ? 
    formData.api_key_plaintext.replace(/(.{12}).*(.{4})/, '$1...$2') : 
    `...${formData.api_key_last4}`;

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

              {formData.id > 0 && (
          <div>
            <Label>API Key</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                value={visibleApiKey ? apiKeyDisplay : maskedApiKey}
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
        )}

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
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-sm">Segment Name</Label>
                  <Input
                    value={segment.name}
                    onChange={(e) => updateSegment(index, { name: e.target.value })}
                    placeholder="segment_name"
                    className="text-sm"
                  />
                </div>
                
                {formData.segments.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSegment(index)}
                    className="text-destructive hover:text-destructive ml-2"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Segments help organize and isolate data from your service
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
          {service.id > 0 ? 'Update Service' : 'Register Service'}
        </Button>
      </div>
    </form>
  );
}