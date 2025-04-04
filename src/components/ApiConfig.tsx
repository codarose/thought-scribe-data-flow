
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface ApiConfigProps {
  onApiKeySet: (key: string) => void;
}

const ApiConfig: React.FC<ApiConfigProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Anthropic API key",
        variant: "destructive"
      });
      return;
    }

    // In a production app, you'd want to store this securely
    // For demo purposes, we'll just store it in localStorage
    localStorage.setItem('anthropic_api_key', apiKey);
    onApiKeySet(apiKey);
    setIsOpen(false);
    
    toast({
      description: "API key saved successfully",
    });
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        Configure Anthropic API
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anthropic API Configuration</DialogTitle>
            <DialogDescription>
              Enter your Anthropic API key to enable voice memo processing.
              <br />
              <small className="text-muted-foreground">
                Note: In a production app, API keys should be handled server-side.
              </small>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Input 
              placeholder="Anthropic API Key" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveApiKey}>
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApiConfig;
