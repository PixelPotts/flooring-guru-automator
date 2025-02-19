import axios from 'axios';
import { Conversation, ConversationSearchParams, MessageType } from '../types/conversation';
import { ghlService } from './ghl';

class GHLConversationsService {
  private static instance: GHLConversationsService | null = null;
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
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(errorMessage);
      }
    );
  }

  public static getInstance(): GHLConversationsService {
    if (!GHLConversationsService.instance) {
      GHLConversationsService.instance = new GHLConversationsService();
    }
    return GHLConversationsService.instance;
  }

  private async getHeaders() {
    try {
      const accessToken = await ghlService.getAccessToken();
      const locationId = await ghlService.getLocationId();
      
      if (!accessToken || !locationId) {
        throw new Error('GHL not properly configured');
      }

      return {
        'Authorization': `Bearer ${accessToken}`,
        'Version': '2021-04-15',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('Error getting GHL headers:', error);
      throw new Error('Failed to get GHL authorization');
    }
  }

  public async searchConversations(params: ConversationSearchParams): Promise<Conversation[]> {
    try {
      const locationId = await ghlService.getLocationId();
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('locationId', locationId);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.query) queryParams.append('query', params.query);
      if (params.status) queryParams.append('status', params.status);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.assignedTo) queryParams.append('assignedTo', params.assignedTo);
      if (params.contactId) queryParams.append('contactId', params.contactId);

      const response = await this.axiosInstance.get(
        `/conversations/search?${queryParams.toString()}`,
        { headers: await this.getHeaders() }
      );

      if (!response.data?.conversations) {
        return [];
      }

      // Map conversations to ensure only serializable data
      return response.data.conversations.map((conv: any) => ({
        id: String(conv.id || ''),
        contactId: String(conv.contactId || ''),
        locationId: String(conv.locationId || ''),
        lastMessageBody: String(conv.lastMessageBody || ''),
        lastMessageType: (conv.lastMessageType || 'TYPE_SMS') as MessageType,
        lastMessageDate: conv.lastMessageDate || new Date().toISOString(),
        type: conv.type || 'TYPE_SMS',
        unreadCount: Number(conv.unreadCount || 0),
        inbox: Boolean(conv.inbox),
        starred: Boolean(conv.starred),
        deleted: Boolean(conv.deleted),
        assignedTo: String(conv.assignedTo || ''),
        userId: String(conv.userId || '')
      }));
    } catch (error) {
      console.error('Error searching conversations:', error);
      throw error instanceof Error ? error : new Error('Failed to search conversations');
    }
  }

  public async updateConversation(
    conversationId: string,
    updates: {
      unreadCount?: number;
      starred?: boolean;
    }
  ): Promise<Conversation> {
    try {
      const locationId = await ghlService.getLocationId();
      
      const response = await this.axiosInstance.put(
        `/conversations/${conversationId}`,
        {
          locationId,
          ...updates
        },
        { headers: await this.getHeaders() }
      );

      if (!response.data?.conversation) {
        throw new Error('Failed to update conversation');
      }

      const conv = response.data.conversation;
      return {
        id: String(conv.id || ''),
        contactId: String(conv.contactId || ''),
        locationId: String(conv.locationId || ''),
        lastMessageBody: String(conv.lastMessageBody || ''),
        lastMessageType: (conv.lastMessageType || 'TYPE_SMS') as MessageType,
        lastMessageDate: conv.lastMessageDate || new Date().toISOString(),
        type: conv.type || 'TYPE_SMS',
        unreadCount: Number(conv.unreadCount || 0),
        inbox: Boolean(conv.inbox),
        starred: Boolean(conv.starred),
        deleted: Boolean(conv.deleted),
        assignedTo: String(conv.assignedTo || ''),
        userId: String(conv.userId || '')
      };
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error instanceof Error ? error : new Error('Failed to update conversation');
    }
  }

  public static reset(): void {
    GHLConversationsService.instance = null;
  }
}

export const ghlConversationsService = GHLConversationsService.getInstance();