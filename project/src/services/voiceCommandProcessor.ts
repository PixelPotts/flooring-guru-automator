import OpenAI from 'openai';
import { CommandResult } from '../types/voice';

class VoiceCommandProcessor {
  private openai: OpenAI;
  private context: Record<string, any> = {};

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  public updateContext(newContext: Record<string, any>) {
    this.context = { ...this.context, ...newContext };
  }

  public clearContext() {
    this.context = {};
  }

  public async processCommand(command: string): Promise<CommandResult> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for a flooring CRM system. Parse voice commands and return structured actions in JSON format.
            
            ALWAYS return response in this exact JSON format:
            {
              "action": "action_name",
              "parameters": { parsed parameters },
              "feedback": "user feedback message"
            }
            
            Available actions and parameters:
            - create_client: { name, company, email, phone, address }
            - create_estimate: { clientId, items, notes }
            - schedule_installation: { date, time, location, notes }
            - order_materials: { type, quantity, supplier }
            - navigate: { path }
            - search: { query, type }
            - help: { topic }
            
            Current context: ${JSON.stringify(this.context)}
            
            Example response:
            {
              "action": "create_client",
              "parameters": {
                "name": "John Smith",
                "company": "ABC Corp",
                "email": "john@abc.com"
              },
              "feedback": "I'll help you create a new client for John Smith from ABC Corp"
            }`
          },
          {
            role: "user",
            content: command
          }
        ],
        temperature: 0,
        max_tokens: 150
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('Empty response from OpenAI');
      }

      try {
        // Extract JSON from response, handling potential markdown code blocks
        const jsonMatch = response.match(/```json\n?(.*)\n?```|(\{[\s\S]*\})/);
        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[2] : null;
        
        if (!jsonStr) {
          throw new Error('No JSON found in response');
        }

        const result = JSON.parse(jsonStr.trim());
        
        // Validate required fields
        if (!result.action || !result.parameters || !result.feedback) {
          throw new Error('Invalid response format');
        }

        return {
          ...result,
          success: true
        };
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        return {
          action: 'help',
          parameters: {},
          feedback: 'I apologize, but I had trouble understanding that command. Could you please rephrase it?',
          success: false,
          error: 'Failed to understand command'
        };
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        action: 'help',
        parameters: {},
        feedback: 'Sorry, I encountered an error processing your request. Please try again.',
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process command'
      };
    }
  }
}

export const voiceCommandProcessor = new VoiceCommandProcessor();