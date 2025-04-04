
export enum DataType {
  TODO = "todo",
  TABLE = "table",
  NOTE = "note",
  UNKNOWN = "unknown",
}

export interface TodoItem {
  text: string;
  completed: boolean;
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface ProcessedResult {
  type: DataType;
  content: TodoItem[] | TableData | string;
  rawTranscription: string;
}
