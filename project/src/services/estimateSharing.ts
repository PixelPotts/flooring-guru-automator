import { supabase } from '../lib/supabase';
import { Estimate, EstimateShare } from '../types/estimate';

class EstimateSharingService {
  private static instance: EstimateSharingService | null = null;

  private constructor() {}

  public static getInstance(): EstimateSharingService {
    if (!EstimateSharingService.instance) {
      EstimateSharingService.instance = new EstimateSharingService();
    }
    return EstimateSharingService.instance;
  }

  public async generateShareUrl(estimate: Estimate): Promise<EstimateShare> {
    try {
      // Verify user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      // Call the RPC function to generate share URL
      const { data, error } = await supabase.rpc('generate_estimate_share', {
        estimate_id: estimate.id,
        expires_in_days: 30
      });

      if (error) {
        console.error('Share URL generation error:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No share data returned');
      }

      // Use the actual deployment URL for share links
      const shareUrl = `${window.location.origin}/estimates/share/${data.token}`;

      return {
        id: estimate.id, // Use estimate ID as share ID
        estimateId: estimate.id,
        token: data.token,
        url: shareUrl,
        expiresAt: data.expires_at,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating share URL:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to generate share URL');
    }
  }

  public async getEstimateByToken(token: string): Promise<Estimate | null> {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          id,
          client_id,
          client_name,
          status,
          date,
          items,
          subtotal,
          tax,
          total,
          notes,
          rooms,
          room_dimensions,
          share_token,
          share_url,
          client_feedback,
          client_viewed_at,
          client_responded_at,
          expires_at
        `)
        .eq('share_token', token)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Convert database fields to frontend format
      return {
        id: data.id,
        clientId: data.client_id,
        clientName: data.client_name,
        status: data.status,
        date: data.date,
        items: data.items || [],
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
        notes: data.notes || '',
        rooms: data.rooms || [],
        roomDimensions: data.room_dimensions || {},
        shareUrl: data.share_url,
        shareToken: data.share_token,
        clientFeedback: data.client_feedback,
        clientViewedAt: data.client_viewed_at,
        clientRespondedAt: data.client_responded_at,
        expiresAt: data.expires_at
      };
    } catch (error) {
      console.error('Error getting estimate by token:', error);
      throw error instanceof Error
        ? error
        : new Error('Failed to retrieve estimate');
    }
  }

  public async recordEstimateView(token: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('record_estimate_view', {
        share_token: token
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording estimate view:', error);
      throw error instanceof Error
        ? error
        : new Error('Failed to record view');
    }
  }

  public async submitEstimateResponse(
    token: string,
    response: 'approved' | 'rejected',
    feedback?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('submit_estimate_response', {
        share_token: token,
        response_status: response,
        response_feedback: feedback
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error submitting estimate response:', error);
      throw error instanceof Error
        ? error
        : new Error('Failed to submit response');
    }
  }
}

export const estimateSharingService = EstimateSharingService.getInstance();