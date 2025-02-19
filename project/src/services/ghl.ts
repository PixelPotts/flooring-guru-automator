import axios, { AxiosError } from 'axios';
import { supabase } from '../lib/supabase';

interface GHLContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  companyName: string;
}

interface GHLError {
  message: string;
  code?: string;
  details?: string;
}

class GHLService {
  private static instance: GHLService | null = null;
  private locationId: string | null = null;
  private accessToken: string | null = null;
  private readonly API_BASE = 'https://services.leadconnectorhq.com';
  private initialized: boolean = false;
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
      (error: AxiosError<GHLError>) => {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        }
        if (!error.response) {
          throw new Error('Network error. Please check your connection.');
        }
        
        const errorMessage = error.response.data?.message || 
                           error.response.data?.details ||
                           error.message;
        
        throw new Error(errorMessage);
      }
    );

    this.initializeConnection();
  }

  public static getInstance(): GHLService {
    if (!GHLService.instance) {
      GHLService.instance = new GHLService();
    }
    return GHLService.instance;
  }

  private async initializeConnection() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings, error } = await supabase
        .from('ghl_settings')
        .select('location_id, access_token')
        .eq('created_by', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading GHL settings:', error);
        return;
      }

      if (settings) {
        this.locationId = settings.location_id;
        this.accessToken = settings.access_token;
      }
    } catch (error) {
      console.error('Error initializing GHL connection:', error);
    } finally {
      this.initialized = true;
    }
  }

  public async searchContacts(query: string): Promise<GHLContact[]> {
    try {
      if (!query?.trim()) return [];

      await this.waitForInitialization();
      if (!this.isConnected()) {
        throw new Error('GHL not connected. Please check your settings.');
      }

      const response = await this.axiosInstance.get(`/contacts/search`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Version': '2021-07-28'
        },
        params: {
          query: query.trim(),
          locationId: this.locationId
        }
      });

      if (!response.data?.contacts) {
        return [];
      }

      return response.data.contacts.map((contact: any) => ({
        id: String(contact.id || ''),
        firstName: String(contact.firstName || ''),
        lastName: String(contact.lastName || ''),
        email: String(contact.email || ''),
        phone: String(contact.phone || ''),
        address: String(contact.address1 || ''),
        companyName: String(contact.companyName || '')
      }));

    } catch (error) {
      console.error('Error searching contacts:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to search contacts');
    }
  }

  public async syncContact(contactId: string): Promise<GHLContact> {
    try {
      if (!contactId) {
        throw new Error('Contact ID is required');
      }

      await this.waitForInitialization();
      if (!this.isConnected()) {
        throw new Error('GHL not connected. Please check your settings.');
      }

      const response = await this.axiosInstance.get(`/contacts/${contactId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Version': '2021-07-28'
        },
        params: {
          locationId: this.locationId
        }
      });

      if (!response.data?.contact) {
        throw new Error('Contact not found in GHL');
      }

      const contact = response.data.contact;
      return {
        id: String(contact.id || ''),
        firstName: String(contact.firstName || ''),
        lastName: String(contact.lastName || ''),
        email: String(contact.email || ''),
        phone: String(contact.phone || ''),
        address: String(contact.address1 || ''),
        companyName: String(contact.companyName || '')
      };

    } catch (error) {
      console.error('Error syncing contact:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to sync contact');
    }
  }

  public async connect(accessToken: string, locationId: string): Promise<void> {
    try {
      if (!accessToken?.trim() || !locationId?.trim()) {
        throw new Error('Access token and location ID are required');
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user');

      // Test connection before saving
      this.accessToken = accessToken;
      this.locationId = locationId;
      await this.testConnection();

      // Save settings using RPC function
      const { error: rpcError } = await supabase.rpc('connect_ghl_settings', {
        p_location_id: locationId,
        p_access_token: accessToken
      });

      if (rpcError) throw rpcError;

      this.initialized = true;
    } catch (error) {
      this.accessToken = null;
      this.locationId = null;
      throw error instanceof Error 
        ? error 
        : new Error('Failed to connect to GHL');
    }
  }

  public async disconnect(): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user');

      const { error: deleteError } = await supabase
        .from('ghl_settings')
        .delete()
        .eq('created_by', user.id);

      if (deleteError) throw deleteError;

      this.locationId = null;
      this.accessToken = null;
      this.initialized = false;
    } catch (error) {
      throw error instanceof Error 
        ? error 
        : new Error('Failed to disconnect from GHL');
    }
  }

  public isConnected(): boolean {
    return Boolean(this.locationId && this.accessToken);
  }

  private async testConnection(): Promise<void> {
    try {
      if (!this.locationId || !this.accessToken) {
        throw new Error('Missing GHL credentials');
      }

      const response = await this.axiosInstance.get(`/locations/${this.locationId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Version': '2021-07-28'
        }
      });

      if (!response.data?.location) {
        throw new Error('Invalid GHL response');
      }
    } catch (error) {
      throw error instanceof Error 
        ? error 
        : new Error('Failed to verify GHL connection');
    }
  }

  private async waitForInitialization(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 50;
    
    while (!this.initialized && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!this.initialized) {
      throw new Error('Failed to initialize GHL service');
    }
  }

  public static reset(): void {
    GHLService.instance = null;
  }
}

export const ghlService = GHLService.getInstance();