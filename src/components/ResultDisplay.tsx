
import React, { useState } from 'react';
import { Check, Table, FileText, X, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { processTranscription } from '@/utils/aiProcessor';
import { ProcessedResult, DataType, TodoItem, TableData } from '@/types';
import { toast } from "@/components/ui/use-toast";

interface ResultDisplayProps {
  transcription: string;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  transcription, 
  isProcessing,
  setIsProcessing
}) => {
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>(DataType.NOTE);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  
  React.useEffect(() => {
    // Process the transcription when it changes
    if (transcription) {
      setIsProcessing(true);
      
      processTranscription(transcription).then((processed) => {
        setResult(processed);
        setActiveTab(processed.type);
        
        // Set todos if type is TODO
        if (processed.type === DataType.TODO) {
          setTodos(processed.content as TodoItem[]);
        }
        
        setIsProcessing(false);
      });
    }
  }, [transcription, setIsProcessing]);
  
  const handleTodoToggle = (index: number) => {
    const newTodos = [...todos];
    newTodos[index].completed = !newTodos[index].completed;
    setTodos(newTodos);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({ description: "Copied to clipboard" });
      })
      .catch(() => {
        toast({ 
          title: "Failed to copy",
          description: "Please try again",
          variant: "destructive"
        });
      });
  };
  
  const downloadAsCSV = (tableData: TableData) => {
    const { headers, rows } = tableData;
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      // Escape quotes and wrap fields with quotes if they contain commas
      const escapedRow = row.map(cell => {
        if (cell.includes(',') || cell.includes('"')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      });
      
      csvContent += escapedRow.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table-data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ description: "Downloaded as CSV" });
  };
  
  if (!transcription) {
    return null;
  }
  
  return (
    <div className="w-full animate-fade-in">
      <Card className="bg-white shadow-md">
        <CardHeader className="border-b">
          <CardTitle className="text-thought-950">Your Structured Results</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-none">
              <TabsTrigger value={DataType.TODO}>
                <Check className="h-4 w-4 mr-2" />
                To-Do
              </TabsTrigger>
              <TabsTrigger value={DataType.TABLE}>
                <Table className="h-4 w-4 mr-2" />
                Table
              </TabsTrigger>
              <TabsTrigger value={DataType.NOTE}>
                <FileText className="h-4 w-4 mr-2" />
                Raw Text
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={DataType.TODO}>
              <div className="p-4">
                {isProcessing ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse text-muted-foreground">Processing...</div>
                  </div>
                ) : todos && todos.length > 0 ? (
                  <ul className="space-y-2">
                    {todos.map((todo, index) => (
                      <li key={index} className="flex items-center gap-2 p-2 hover:bg-secondary rounded-md">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className={`h-6 w-6 rounded-full ${todo.completed ? 'bg-green-100 text-green-700 border-green-300' : 'border-gray-300'}`}
                          onClick={() => handleTodoToggle(index)}
                        >
                          {todo.completed && <Check className="h-3 w-3" />}
                        </Button>
                        <span className={`flex-1 ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {todo.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <p>No task items detected</p>
                    <p className="text-sm mt-2">Try recording a memo about tasks or to-dos</p>
                  </div>
                )}
                
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(todos.map(t => `- ${t.text}`).join('\n'))}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy List
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value={DataType.TABLE}>
              <div className="p-4">
                {isProcessing ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse text-muted-foreground">Processing...</div>
                  </div>
                ) : result && result.type === DataType.TABLE ? (
                  <div>
                    <ScrollArea className="max-h-64 w-full">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-secondary">
                            {(result.content as TableData).headers.map((header, index) => (
                              <th key={index} className="p-2 text-left border border-muted">{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(result.content as TableData).rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-muted">
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="p-2 border border-muted">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                    
                    <div className="flex justify-end mt-4 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => downloadAsCSV(result.content as TableData)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <p>No tabular data detected</p>
                    <p className="text-sm mt-2">Try recording a memo about structured data</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value={DataType.NOTE}>
              <div className="p-4">
                <ScrollArea className="max-h-64 w-full">
                  <div className="p-2 whitespace-pre-wrap">
                    {result?.rawTranscription || transcription}
                  </div>
                </ScrollArea>
                
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(result?.rawTranscription || transcription)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Text
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultDisplay;
