export interface WikiSection {
  title: string;
  content: string;
}

export interface WikiEntry {
  topic: string;
  summary: string;
  sections: WikiSection[];
  references: Reference[];
}

export interface Reference {
  title: string;
  url: string;
  source?: string;
}

export interface CalculatorInput {
  id: string;
  label: string;
  type: 'radio' | 'number' | 'select' | 'boolean';
  options?: { value: number | string; label: string }[];
  min?: number;
  max?: number;
  value?: any;
}

export interface CalculatorDefinition {
  id: string;
  name: string;
  description: string;
  inputs: CalculatorInput[];
  calculate: (values: Record<string, any>) => { score: number | string; interpretation: any };
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}