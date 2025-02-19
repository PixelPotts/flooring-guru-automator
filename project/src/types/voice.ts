export type CommandAction = 
  | 'create_client'
  | 'create_estimate' 
  | 'schedule_installation'
  | 'order_materials'
  | 'navigate'
  | 'search'
  | 'help';

export interface CommandResult {
  action: CommandAction;
  parameters: Record<string, any>;
  success: boolean;
  feedback?: string;
  error?: string;
}

export interface VoiceResponse {
  transcript: string;
  success: boolean;
  error?: string;
}