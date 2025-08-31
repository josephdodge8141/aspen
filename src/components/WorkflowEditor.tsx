import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Bot, 
  Database, 
  Zap,
  Filter,
  MapPin,
  GitBranch,
  RotateCcw,
  Merge,
  Split,
  Settings,
  CornerDownRight,
  Workflow,
  Clock,
  Link
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'ai' | 'resource' | 'action';
  subtype: string;
  name: string;
  x: number;
  y: number;
  config: Record<string, any>;
  connections: string[];
}

interface WorkflowEditorProps {
  workflowId: string | null;
  onBack: () => void;
}

const nodeTypes = {
  ai: [
    { id: 'job', name: 'Job', icon: Bot, description: 'AI prompt with structured output' },
    { id: 'embed', name: 'Embed', icon: Database, description: 'Embed text into vector store' }
  ],
  resource: [
    { id: 'guru', name: 'Guru', icon: Database, description: 'Query knowledge base' },
    { id: 'get-api', name: 'GET API', icon: Link, description: 'Make GET request' },
    { id: 'post-api', name: 'POST API', icon: Link, description: 'Make POST request' },
    { id: 'query-vector', name: 'Query Vector Store', icon: Database, description: 'Search vector database' }
  ],
  action: [
    { id: 'filter', name: 'Filter', icon: Filter, description: 'Filter array objects' },
    { id: 'map', name: 'Map', icon: MapPin, description: 'Transform data structure' },
    { id: 'if-else', name: 'If/Else', icon: GitBranch, description: 'Conditional branching' },
    { id: 'foreach', name: 'For Each', icon: RotateCcw, description: 'Iterate over array' },
    { id: 'merge', name: 'Merge', icon: Merge, description: 'Combine multiple inputs' },
    { id: 'split', name: 'Split', icon: Split, description: 'Split data into branches' },
    { id: 'advanced', name: 'Advanced Data', icon: Settings, description: 'Complex data manipulation' },
    { id: 'return', name: 'Return', icon: CornerDownRight, description: 'Return workflow result' },
    { id: 'workflow', name: 'Workflow', icon: Workflow, description: 'Call another workflow' }
  ]
};

export default function WorkflowEditor({ workflowId, onBack }: WorkflowEditorProps) {
  const [workflowData, setWorkflowData] = useState({
    name: workflowId === 'new' ? 'New Workflow' : 'Sample Workflow',
    description: '',
    team: 'Default',
    services: [],
    triggers: [] as string[],
    apiUrl: '',
    cronSchedule: '',
    retryCount: 1
  });

  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [selectedNodeType, setSelectedNodeType] = useState<{category: string, type: string} | null>(null);
  const [editingNode, setEditingNode] = useState<WorkflowNode | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleAddNode = () => {
    setShowNodeModal(true);
  };

  const handleNodeTypeSelect = (category: string, type: string) => {
    setSelectedNodeType({ category, type });
    setShowNodeModal(false);
    
    // Create new node
    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type: category as 'ai' | 'resource' | 'action',
      subtype: type,
      name: nodeTypes[category as keyof typeof nodeTypes].find(n => n.id === type)?.name || type,
      x: 300,
      y: 200,
      config: {},
      connections: []
    };
    
    setNodes([...nodes, newNode]);
    setEditingNode(newNode);
  };

  const handleNodeClick = (node: WorkflowNode) => {
    setEditingNode(node);
  };

  const handleNodeConfigSave = (config: Record<string, any>) => {
    if (editingNode) {
      const updatedNodes = nodes.map(node => 
        node.id === editingNode.id 
          ? { ...node, config }
          : node
      );
      setNodes(updatedNodes);
    }
    setEditingNode(null);
  };

  const getNodeIcon = (node: WorkflowNode) => {
    const category = nodeTypes[node.type as keyof typeof nodeTypes];
    const nodeType = category?.find(n => n.id === node.subtype);
    return nodeType?.icon || Bot;
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'ai':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'resource':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'action':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workflows
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h2>{workflowData.name}</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Save as Draft</Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Workflow
          </Button>
        </div>
      </div>

      {/* Workflow Configuration */}
      <div className="p-4 border-b bg-muted/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Name</Label>
            <Input
              value={workflowData.name}
              onChange={(e) => setWorkflowData({ ...workflowData, name: e.target.value })}
            />
          </div>
          
          <div>
            <Label>Triggers</Label>
            <div className="flex space-x-2 mt-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={workflowData.triggers.includes('api')}
                  onCheckedChange={(checked) => {
                    const triggers = checked 
                      ? [...workflowData.triggers, 'api']
                      : workflowData.triggers.filter(t => t !== 'api');
                    setWorkflowData({ ...workflowData, triggers });
                  }}
                />
                <Label>API</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={workflowData.triggers.includes('cron')}
                  onCheckedChange={(checked) => {
                    const triggers = checked 
                      ? [...workflowData.triggers, 'cron']
                      : workflowData.triggers.filter(t => t !== 'cron');
                    setWorkflowData({ ...workflowData, triggers });
                  }}
                />
                <Label>CRON</Label>
              </div>
            </div>
          </div>
          
          {workflowData.triggers.includes('cron') && (
            <div>
              <Label>CRON Schedule</Label>
              <Input
                value={workflowData.cronSchedule}
                onChange={(e) => setWorkflowData({ ...workflowData, cronSchedule: e.target.value })}
                placeholder="* * * * *"
              />
            </div>
          )}
          
          <div>
            <Label>Retry Count</Label>
            <Input
              type="number"
              value={workflowData.retryCount}
              onChange={(e) => setWorkflowData({ ...workflowData, retryCount: parseInt(e.target.value) })}
              min="0"
              max="10"
            />
          </div>
        </div>
        
        {workflowData.triggers.includes('api') && (
          <div className="mt-4">
            <Label>API URL</Label>
            <div className="flex items-center space-x-2 mt-1">
              <code className="text-sm bg-background px-2 py-1 rounded border">
                /api/workflows/{workflowData.name.toLowerCase().replace(/\s+/g, '-')}
              </code>
              <Badge variant="outline">GET/POST</Badge>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-grid-pattern">
          <div 
            ref={canvasRef}
            className="w-full h-full relative"
            style={{ backgroundImage: 'radial-gradient(circle, #ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          >
            {/* Add Node Button */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button onClick={handleAddNode} size="lg" className="shadow-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Add First Node
                </Button>
              </div>
            )}

            {/* Workflow Nodes */}
            {nodes.map((node) => {
              const Icon = getNodeIcon(node);
              return (
                <div
                  key={node.id}
                  className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${getNodeColor(node.type)}`}
                  style={{ left: node.x, top: node.y }}
                  onClick={() => handleNodeClick(node)}
                >
                  <Card className="w-32 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-3 text-center">
                      <Icon className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-xs truncate">{node.name}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {/* Floating Add Button */}
            {nodes.length > 0 && (
              <Button
                onClick={handleAddNode}
                className="absolute bottom-4 right-4 rounded-full shadow-lg"
                size="lg"
              >
                <Plus className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l bg-card p-4">
          <h3 className="mb-4">Available Data</h3>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {nodes.map((node) => (
                <div key={node.id} className="p-2 border rounded text-sm">
                  <div className="font-medium">{node.name}</div>
                  <div className="text-muted-foreground text-xs">
                    Output: {node.type === 'ai' ? 'AI Response' : 'Data Object'}
                  </div>
                </div>
              ))}
              {nodes.length === 0 && (
                <p className="text-muted-foreground text-sm">No nodes yet. Add nodes to see available data.</p>
              )}
            </div>
          </ScrollArea>
          
          <div className="mt-6">
            <h3 className="mb-4">Workflow Log</h3>
            <ScrollArea className="h-32">
              <div className="text-sm text-muted-foreground">
                Execution log will appear here when workflow runs...
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Node Type Selection Modal */}
      <Dialog open={showNodeModal} onOpenChange={setShowNodeModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Node Type</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(nodeTypes).map(([category, types]) => (
              <div key={category}>
                <h3 className="mb-3 capitalize">{category}</h3>
                <div className="space-y-2">
                  {types.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant="outline"
                        className="w-full justify-start h-auto p-3"
                        onClick={() => handleNodeTypeSelect(category, type.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className="h-5 w-5 mt-0.5" />
                          <div className="text-left">
                            <div>{type.name}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Node Configuration Modal */}
      <Dialog open={!!editingNode} onOpenChange={(open) => !open && setEditingNode(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure {editingNode?.name}</DialogTitle>
          </DialogHeader>
          
          {editingNode && (
            <NodeConfigForm 
              node={editingNode} 
              onSave={handleNodeConfigSave}
              onCancel={() => setEditingNode(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface NodeConfigFormProps {
  node: WorkflowNode;
  onSave: (config: Record<string, any>) => void;
  onCancel: () => void;
}

function NodeConfigForm({ node, onSave, onCancel }: NodeConfigFormProps) {
  const [config, setConfig] = useState(node.config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  const renderConfigFields = () => {
    switch (node.subtype) {
      case 'job':
        return (
          <>
            <div>
              <Label>Prompt</Label>
              <Textarea
                value={config.prompt || ''}
                onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                placeholder="Enter your AI prompt here..."
                rows={4}
              />
            </div>
            <div>
              <Label>Model</Label>
              <Select value={config.model || 'gpt-4'} onValueChange={(value) => setConfig({ ...config, model: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Expected Output Schema (JSON)</Label>
              <Textarea
                value={config.outputSchema || ''}
                onChange={(e) => setConfig({ ...config, outputSchema: e.target.value })}
                placeholder='{"result": "string", "confidence": "number"}'
                rows={3}
              />
            </div>
          </>
        );
        
      case 'get-api':
      case 'post-api':
        return (
          <>
            <div>
              <Label>API URL</Label>
              <Input
                value={config.url || ''}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div>
              <Label>Headers (JSON)</Label>
              <Textarea
                value={config.headers || ''}
                onChange={(e) => setConfig({ ...config, headers: e.target.value })}
                placeholder='{"Authorization": "Bearer {{token}}", "Content-Type": "application/json"}'
                rows={3}
              />
            </div>
            {node.subtype === 'post-api' && (
              <div>
                <Label>Request Body (JSON)</Label>
                <Textarea
                  value={config.body || ''}
                  onChange={(e) => setConfig({ ...config, body: e.target.value })}
                  placeholder='{"data": "{{input.data}}"}'
                  rows={3}
                />
              </div>
            )}
          </>
        );
        
      case 'filter':
        return (
          <div>
            <Label>Filter Condition (JSONata)</Label>
            <Input
              value={config.condition || ''}
              onChange={(e) => setConfig({ ...config, condition: e.target.value })}
              placeholder="status = 'active'"
            />
          </div>
        );
        
      default:
        return (
          <div>
            <Label>Configuration (JSON)</Label>
            <Textarea
              value={JSON.stringify(config, null, 2)}
              onChange={(e) => {
                try {
                  setConfig(JSON.parse(e.target.value));
                } catch {
                  // Invalid JSON, keep current config
                }
              }}
              rows={6}
            />
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderConfigFields()}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Configuration
        </Button>
      </div>
    </form>
  );
}