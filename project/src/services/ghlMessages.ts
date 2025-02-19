import axios from 'axios';
import { ghlService } from './ghl';

export interface Message {
  id: string;
  type: string;
  messageType: string;
  locationId: string;
  contactId: string;
  conversationId: string;
  dateAdded: string;
  body?: string;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'scheduled' | 'sent' | 'delivered' | 'read' | 'undelivered' | 'connected' | 'failed' | 'opened';
  contentType: string;
  attachments?: string[];
  meta?: {
    email?: {
      messageIds: string[];
    };
  };
  source?: 'workflow' | 'bulk_actions' | 'campaign' | 'api' | 'app';
  userId?: string;
}

class GHLMessagesService {
  private static instance: GHLMessagesService | null = null;
  private readonly API_BASE = 'https://services.leadconnectorhq.com';
  private axiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.API_BASE,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    this.axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        }
        if (!error.response) {
          throw new Error('Network error. Please check your connection.');
        }
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw error;
      }
    );
  }

  public static getInstance(): GHLMessagesService {
    if (!GHLMessagesService.instance) {
      GHLMessagesService.instance = new GHLMessagesService();
    }
    return GHLMessagesService.instance;
  }

  private async getHeaders() {
    try {
      const accessToken = await ghlService.getAccessToken();
      return {
        'Authorization': `Bearer ${accessToken}`,
        'Version': '2021-04-15',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('Error getting GHL headers:', error);
      throw new Error('Failed to get GHL authorization. Please check your connection.');
    }
  }

  public async getMessages(conversationId: string, params?: {
    lastMessageId?: string;
    limit?: number;
    type?: string;
  }): Promise<Message[]> {
    try {
      const response = await this.axiosInstance.get(
        `/conversations/${conversationId}/messages`,
        {
          headers: await this.getHeaders(),
          params
        }
      );

      return response.data.messages || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  public async sendMessage(params: {
    type: 'SMS' | 'Email' | 'WhatsApp' | 'GMB' | 'IG' | 'FB' | 'Custom' | 'Live_Chat';
    contactId: string;
    message: string;
    attachments?: string[];
    subject?: string;
    emailFrom?: string;
    emailTo?: string;
    emailCc?: string[];
    emailBcc?: string[];
    fromNumber?: string;
    toNumber?: string;
  }): Promise<{
    conversationId: string;
    messageId: string;
    emailMessageId?: string;
  }> {
    try {
      const response = await this.axiosInstance.post(
        `/conversations/messages`,
        params,
        { headers: await this.getHeaders() }
      );

      if (!response.data?.messageId) {
        throw new Error('Failed to send message');
      }

      return {
        conversationId: response.data.conversationId,
        messageId: response.data.messageId,
        emailMessageId: response.data.emailMessageId
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  public async uploadAttachment(conversationId: string, file: File): Promise<string[]> {
    try {
      const locationId = await ghlService.getLocationId();
      const formData = new FormData();
      formData.append('fileAttachment', file);
      formData.append('conversationId', conversationId);
      formData.append('locationId', locationId);

      const response = await this.axiosInstance.post(
        `/conversations/messages/upload`,
        formData,
        {
          headers: {
            ...(await this.getHeaders()),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.uploadedFiles || [];
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }

  public async getRecording(messageId: string, locationId: string): Promise<Blob> {
    try {
      const response = await this.axiosInstance.get(
        `/conversations/messages/${messageId}/locations/${locationId}/recording`,
        {
          headers: await this.getHeaders(),
          responseType: 'blob'
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting recording:', error);
      throw error;
    }
  }

  public async getTranscription(messageId: string, locationId: string): Promise<{
    mediaChannel: number;
    sentenceIndex: number;
    startTime: number;
    endTime: number;
    transcript: string;
    confidence: number;
  }> {
    try {
      const response = await this.axiosInstance.get(
        `/conversations/locations/${locationId}/messages/${messageId}/transcription`,
        { headers: await this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting transcription:', error);
      throw error;
    }
  }
}

export const ghlMessagesService = GHLMessagesService.getInstance();
export const ghlConversationsService = ghlMessagesService;