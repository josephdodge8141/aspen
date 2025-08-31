import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Send, 
  Save, 
  Copy, 
  Bot, 
  User, 
  Settings,
  Play,
  Pause,
  RotateCw
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Expert {
  id: string;
  name: string;
  prompt: string;
  workflows: string[];
  model: string;
  inputParams: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'error';
}

const mockExperts: Expert[] = [
  {
    id: '1',
    name: 'Code Review Assistant',
    prompt: 'You are a senior software engineer specializing in code reviews. Current time: {{base.time}}. Analyze the following code: {{input.code}}',
    workflows: ['code-analysis', 'security-scan'],
    model: 'gpt-4',
    inputParams: '{"code": "string", "language": "string", "context": "object"}'
  },
  {
    id: '2',
    name: 'Content Strategist',
    prompt: 'You are an expert content strategist. Today is {{base.time}}. Create content for: {{input.topic}} targeting {{input.audience}}',
    workflows: ['content-generation', 'seo-optimization'],
    model: 'gpt-4',
    inputParams: '{"topic": "string", "audience": "string", "tone": "string"}'
  }
];

const mockWorkflows: Workflow[] = [
  { id: '1', name: 'Code Review Pipeline', description: 'Automated code review process', status: 'idle' },
  { id: '2', name: 'Content Creation Workflow', description: 'End-to-end content creation', status: 'idle' }
];

export default function ChatPage() {
  const [mode, setMode] = useState<'expert' | 'workflow'>('expert');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [workflowInputs, setWorkflowInputs] = useState('{}');
  const [activeWorkflows, setActiveWorkflows] = useState<Set<string>>(new Set());
  const [expertPrompt, setExpertPrompt] = useState('');
  const [inputParams, setInputParams] = useState('{}');
  const [workflowLog, setWorkflowLog] = useState<Array<{step: string, data: any, timestamp: Date}>>([]);

  // Initialize expert prompt when expert is selected
  React.useEffect(() => {
    if (selectedExpert) {
      setExpertPrompt(selectedExpert.prompt);
      setInputParams(selectedExpert.inputParams);
    }
  }, [selectedExpert]);

  const handleSendMessage = () => {
    if (!currentMessage.trim() || (!selectedExpert && mode === 'expert')) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: mode === 'expert' 
          ? `I've analyzed your request using the ${selectedExpert?.name} expert. Here's my response based on the prompt configuration...`
          : `Workflow execution completed. Here are the results from the ${selectedWorkflow?.name} workflow...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1500);

    setCurrentMessage('');
  };

  const handleExecuteWorkflow = () => {
    if (!selectedWorkflow) return;

    // Add system message about workflow execution
    const systemMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: `Executing workflow: ${selectedWorkflow.name}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, systemMessage]);

    // Simulate workflow execution with log entries
    const steps = [
      'Initializing workflow...',
      'Processing input data...',
      'Executing AI analysis...',
      'Gathering results...',
      'Workflow completed'
    ];

    setWorkflowLog([]);
    
    steps.forEach((step, index) => {
      setTimeout(() => {
        setWorkflowLog(prev => [...prev, {
          step,
          data: { step: index + 1, total: steps.length },
          timestamp: new Date()
        }]);

        if (index === steps.length - 1) {
          const resultMessage: Message = {
            id: (Date.now() + index).toString(),
            type: 'assistant',
            content: `Workflow "${selectedWorkflow.name}" completed successfully. Results are available in the workflow log.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, resultMessage]);
        }
      }, (index + 1) * 1000);
    });
  };

  const handleSaveExpert = () => {
    // This would save the modified expert or create a new one
    console.log('Saving expert with prompt:', expertPrompt);
  };

  const handleSaveAsCopy = () => {
    // This would create a new expert based on the current configuration
    console.log('Saving as copy with prompt:', expertPrompt);
  };

  const toggleWorkflow = (workflowId: string) => {
    const newActive = new Set(activeWorkflows);
    if (newActive.has(workflowId)) {
      newActive.delete(workflowId);
    } else {
      newActive.add(workflowId);
    }
    setActiveWorkflows(newActive);
  };

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mode Selection */}
        <div className="p-4 border-b">
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'expert' | 'workflow')}>
            <TabsList>
              <TabsTrigger value="expert">Expert Mode</TabsTrigger>
              <TabsTrigger value="workflow">Workflow Mode</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Expert/Workflow Selection */}
        <div className="p-4 border-b bg-muted/30">
          {mode === 'expert' ? (
            <div className="space-y-4">
              <div>
                <Label>Select Expert</Label>
                <Select
                  value={selectedExpert?.id || ''}
                  onValueChange={(value) => {
                    const expert = mockExperts.find(e => e.id === value);
                    setSelectedExpert(expert || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an expert..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockExperts.map((expert) => (
                      <SelectItem key={expert.id} value={expert.id}>
                        {expert.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedExpert && selectedExpert.workflows.length > 0 && (
                <div>
                  <Label>Attached Workflows</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedExpert.workflows.map((workflow) => (
                      <div key={workflow} className="flex items-center space-x-2">
                        <Checkbox
                          checked={activeWorkflows.has(workflow)}
                          onCheckedChange={() => toggleWorkflow(workflow)}
                        />
                        <Badge variant="outline">{workflow}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <Label>Select Workflow</Label>
              <Select
                value={selectedWorkflow?.id || ''}
                onValueChange={(value) => {
                  const workflow = mockWorkflows.find(w => w.id === value);
                  setSelectedWorkflow(workflow || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a workflow..." />
                </SelectTrigger>
                <SelectContent>
                  {mockWorkflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                {mode === 'expert' 
                  ? 'Select an expert and start chatting to experiment with AI responses.'
                  : 'Select a workflow and execute it to see the results.'}
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.type === 'system'
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 mt-0.5" />
                    ) : message.type === 'assistant' ? (
                      <Bot className="h-4 w-4 mt-0.5" />
                    ) : (
                      <Settings className="h-4 w-4 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t">
          {mode === 'expert' ? (
            <div className="flex space-x-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!selectedExpert}
              />
              <Button onClick={handleSendMessage} disabled={!selectedExpert || !currentMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <Label>Workflow Input (JSON)</Label>
                <Textarea
                  value={workflowInputs}
                  onChange={(e) => setWorkflowInputs(e.target.value)}
                  placeholder='{"input": "data", "parameters": {}}'
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleExecuteWorkflow} 
                disabled={!selectedWorkflow}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Execute Workflow
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-96 border-l bg-card">
        <Tabs defaultValue="config" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 m-2">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="log">Execution Log</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="flex-1 p-4 space-y-4">
            {mode === 'expert' && selectedExpert && (
              <>
                <div>
                  <Label>Expert Prompt</Label>
                  <Textarea
                    value={expertPrompt}
                    onChange={(e) => setExpertPrompt(e.target.value)}
                    rows={6}
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label>Input Parameters</Label>
                  <Textarea
                    value={inputParams}
                    onChange={(e) => setInputParams(e.target.value)}
                    rows={4}
                    className="text-sm font-mono"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleSaveAsCopy} size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Save as Copy
                  </Button>
                  <Button onClick={handleSaveExpert} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </>
            )}

            {mode === 'workflow' && selectedWorkflow && (
              <div>
                <h3>Workflow: {selectedWorkflow.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedWorkflow.description}</p>
                
                <div className="mt-4">
                  <Badge 
                    variant={selectedWorkflow.status === 'running' ? 'default' : 'secondary'}
                  >
                    {selectedWorkflow.status}
                  </Badge>
                </div>
              </div>
            )}

            {!selectedExpert && !selectedWorkflow && (
              <div className="text-center text-muted-foreground py-8">
                Select an expert or workflow to see configuration options.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="log" className="flex-1 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {workflowLog.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Execute a workflow to see the execution log.
                  </div>
                ) : (
                  workflowLog.map((entry, index) => (
                    <div key={index} className="p-2 border rounded text-sm">
                      <div className="flex items-center justify-between">
                        <span>{entry.step}</span>
                        <span className="text-xs text-muted-foreground">
                          {entry.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="text-xs mt-1 text-muted-foreground overflow-x-auto">
                        {JSON.stringify(entry.data, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}