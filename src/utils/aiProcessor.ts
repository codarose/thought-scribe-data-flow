import { DataType, ProcessedResult, TodoItem, TableData } from "../types";

export async function processTranscription(transcription: string): Promise<ProcessedResult> {
  try {
    // In a real implementation, this would call your backend API
    // which would then call Anthropic's API
    const response = await fetch('/api/process-transcription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcription }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing transcription:', error);
    
    // Fallback to simple keyword detection if API call fails
    return fallbackProcessing(transcription);
  }
}

function fallbackProcessing(transcription: string): ProcessedResult {
  const lowerCaseText = transcription.toLowerCase();
  
  if (containsTodoPattern(lowerCaseText)) {
    return {
      type: DataType.TODO,
      content: extractTodos(transcription),
      rawTranscription: transcription
    };
  } else if (containsTablePattern(lowerCaseText)) {
    return {
      type: DataType.TABLE,
      content: extractTable(transcription),
      rawTranscription: transcription
    };
  } else {
    // Default to note
    return {
      type: DataType.NOTE,
      content: transcription,
      rawTranscription: transcription
    };
  }
}

function containsTodoPattern(text: string): boolean {
  const todoPatterns = [
    'to do', 'todo', 'task', 'list', 'remember to', 'don\'t forget',
    'need to', 'should', 'must'
  ];
  
  return todoPatterns.some(pattern => text.includes(pattern));
}

function containsTablePattern(text: string): boolean {
  const tablePatterns = [
    'table', 'spreadsheet', 'column', 'row', 'data', 'excel',
    'entries', 'cells', 'tabular'
  ];
  
  return tablePatterns.some(pattern => text.includes(pattern));
}

function extractTodos(text: string): TodoItem[] {
  // Simple approach: split by common delimiters or new lines
  let items: TodoItem[] = [];
  
  // Split by common list patterns
  let lines = text
    .replace(/\d+\.\s/g, '\n')  // Replace "1. " with newline
    .replace(/\r\n|\r|\n/g, '\n') // Normalize line endings
    .split('\n')
    .filter(line => line.trim().length > 0);
  
  // Look for task-like patterns in each line
  items = lines.map(line => {
    // Clean up the line
    let cleanedLine = line
      .replace(/^[-*•]|\s+[-*•]\s+/g, '') // Remove bullet points
      .trim();
    
    // Don't include very short phrases or common connecting words
    if (cleanedLine.length > 3 && 
        !['and', 'also', 'then', 'next', 'finally'].includes(cleanedLine.toLowerCase())) {
      return {
        text: cleanedLine,
        completed: false
      };
    }
    return null;
  }).filter(Boolean) as TodoItem[];
  
  // If no items found via structured approach, try natural language
  if (items.length === 0) {
    items = extractTasksFromNaturalLanguage(text);
  }
  
  return items;
}

function extractTasksFromNaturalLanguage(text: string): TodoItem[] {
  // Look for phrases that might indicate tasks
  const taskIndicators = [
    'need to', 'should', 'have to', 'must', 'remember to', 
    'don\'t forget to', 'to do', 'todo', 'task'
  ];
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const tasks: TodoItem[] = [];
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase().trim();
    
    // If the sentence contains a task indicator
    if (taskIndicators.some(indicator => lowerSentence.includes(indicator))) {
      tasks.push({
        text: sentence.trim(),
        completed: false
      });
    }
  });
  
  // If still no tasks found, just use sentences as tasks
  if (tasks.length === 0 && sentences.length > 0) {
    return sentences.slice(0, 5).map(sentence => ({
      text: sentence.trim(),
      completed: false
    }));
  }
  
  return tasks;
}

function extractTable(text: string): TableData {
  // Simplified table extraction - in a real app you'd use NLP
  // Split the text into lines
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Try to find headers and rows
  let headers: string[] = [];
  let rows: string[][] = [];
  
  // Look for patterns like "columns are X, Y, Z" or "headers include A, B, C"
  const headerMatch = text.match(/columns are|headers include|fields are|columns include(.*)/i);
  if (headerMatch && headerMatch[1]) {
    headers = headerMatch[1]
      .split(/,|;/)
      .map(h => h.replace(/and/g, '').trim())
      .filter(h => h.length > 0);
  }
  
  // If we can't find explicit headers, try to infer from content
  if (headers.length === 0 && lines.length > 1) {
    // Use the first line as headers if it's not too long
    const potentialHeaderLine = lines[0];
    const headerCandidates = potentialHeaderLine
      .split(/\t|,|;|\|/)
      .map(h => h.trim())
      .filter(h => h.length > 0);
    
    if (headerCandidates.length >= 2 && headerCandidates.length <= 10) {
      headers = headerCandidates;
      lines.shift(); // Remove the header line from data rows
    } else {
      // Create generic headers
      headers = ['Column 1', 'Column 2', 'Column 3'];
    }
  }
  
  // Process remaining lines as data rows
  lines.forEach(line => {
    // Split by common delimiters
    const cells = line
      .split(/\t|,|;|\|/)
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0);
    
    if (cells.length >= 2) {
      // Ensure all rows have the same number of columns as headers
      while (cells.length < headers.length) cells.push('');
      rows.push(cells.slice(0, headers.length));
    }
  });
  
  // If no rows detected, create sample data
  if (rows.length === 0) {
    // Create some dummy rows from sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    sentences.forEach(sentence => {
      const words = sentence.split(' ').filter(w => w.trim().length > 0);
      if (words.length >= headers.length) {
        const row = Array(headers.length).fill('');
        for (let i = 0; i < headers.length; i++) {
          row[i] = words[i];
        }
        rows.push(row);
      }
    });
  }
  
  return { headers, rows };
}
