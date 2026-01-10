export type ThoughtSource = 'text' | 'voice' | 'api';
export type ThoughtProcessedState = 'UNPROCESSED' | 'PROCESSED' | 'ARCHIVED';

export interface Thought {
  id: string;
  text: string;
  source: ThoughtSource;
  timestamp: string;
  processedState: ThoughtProcessedState;
}
