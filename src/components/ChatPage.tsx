import React, { useState, useEffect } from 'react';
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
import { 
  expertsService, 
  workflowsService, 
  chatService, 
  type Expert as BackendExpert, 
  type Workflow as BackendWorkflow 
} from '../services';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Expert extends BackendExpert {}
interface Workflow extends BackendWorkflow {}

export default function ChatPage() {
  const [mode, setMode] = useState<'expert' | 'workflow'>('expert');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [workflowInputs, setWorkflowInputs] = useState('{}');
  const [expertPrompt, setExpertPrompt] = useState('');
  const [inputParams, setInputParams] = useState('{}');
  const [workflowLog, setWorkflowLog] = useState<Array<{step: string, data: any, timestamp: Date}>>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [expertsData, workflowsData] = await Promise.all([
        expertsService.listExperts(),
        workflowsService.listWorkflows()
      ]);
      setExperts(expertsData);
      setWorkflows(workflowsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize expert prompt when expert is selected
  React.useEffect(() => {
    if (selectedExpert) {
      // Since experts from the list don't have prompt/input_params, 
      // we'll use placeholder values or fetch detailed expert info
      setExpertPrompt(`Expert: ${selectedExpert.name} (${selectedExpert.model_name})`);
      setInputParams('{"user_message": "string"}');
    }
  }, [selectedExpert]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || (!selectedExpert && mode === 'expert')) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');

    try {
      if (mode === 'expert' && selectedExpert) {
        const inputParamsObj = JSON.parse(inputParams);
        const response = await chatService.runExpert({
          expert_id: selectedExpert.id,
          input_params: inputParamsObj,
          base: { time: new Date().toISOString() }
        });

        // Add assistant messages from the response
        response.messages.forEach((msg, index) => {
          if (msg.role === 'assistant') {
            const assistantMessage: Message = {
              id: (Date.now() + index).toString(),
              type: 'assistant',
              content: msg.content,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
          }
        });
      }
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 999).toString(),
        type: 'system',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to process request'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!selectedWorkflow) return;

    // Add system message about workflow execution
    const systemMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: `Executing workflow: ${selectedWorkflow.name}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, systemMessage]);
    setWorkflowLog([]);

    try {
      const inputsObj = JSON.parse(workflowInputs);
      const response = await chatService.runWorkflow({
        workflow_id: selectedWorkflow.id,
        starting_inputs: inputsObj
      });

      // Log each step
      response.steps.forEach((step, index) => {
        setTimeout(() => {
          setWorkflowLog(prev => [...prev, {
            step: `Node ${step.node_id} (${step.node_type}): ${step.status}`,
            data: { inputs: step.inputs, outputs: step.outputs },
            timestamp: new Date()
          }]);

          if (index === response.steps.length - 1) {
            const resultMessage: Message = {
              id: (Date.now() + index).toString(),
              type: 'assistant',
              content: `Workflow "${selectedWorkflow.name}" completed successfully. Run ID: ${response.run_id}`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, resultMessage]);
          }
        }, index * 500);
      });
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 999).toString(),
        type: 'system',
        content: `Workflow Error: ${err instanceof Error ? err.message : 'Failed to execute workflow'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSaveExpert = () => {
    // This would save the modified expert or create a new one
    console.log('Saving expert with prompt:', expertPrompt);
  };

  const handleSaveAsCopy = async () => {
    if (!selectedExpert) return;
    
    try {
      const inputParamsObj = JSON.parse(inputParams);
      await expertsService.createExpert({
        name: `${selectedExpert.name} (Copy)`,
        prompt: expertPrompt,
        model_name: selectedExpert.model_name,
        input_params: inputParamsObj,
      });
      
      // Reload experts to show the new copy
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expert copy');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading data...</div>
      </div>
    );
  }

      return (
      <div className="flex h-full">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Error Display */}
          {error && (
            <div className="p-4 bg-destructive/10 border-b border-destructive/20">
              <p className="text-destructive text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={loadData} className="mt-2">
                Retry
              </Button>
            </div>
          )}

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
                  value={selectedExpert?.id.toString() || ''}
                  onValueChange={(value) => {
                    const expert = experts.find(e => e.id.toString() === value);
                    setSelectedExpert(expert || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an expert..." />
                  </SelectTrigger>
                  <SelectContent>
                    {experts.map((expert) => (
                      <SelectItem key={expert.id} value={expert.id.toString()}>
                        {expert.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedExpert && (
                <div>
                  <Label>Expert Model</Label>
                  <div className="mt-2">
                    <Badge variant="secondary">{selectedExpert.model_name}</Badge>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <Label>Select Workflow</Label>
              <Select
                value={selectedWorkflow?.id.toString() || ''}
                onValueChange={(value) => {
                  const workflow = workflows.find(w => w.id.toString() === value);
                  setSelectedWorkflow(workflow || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a workflow..." />
                </SelectTrigger>
                <SelectContent>
                  {workflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id.toString()}>
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