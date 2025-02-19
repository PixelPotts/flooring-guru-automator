import OpenAI from 'openai';
import { supabase } from '../lib/supabase';
import type { DamageAnalysis, DamageReport } from '../types/damage';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const ANALYSIS_PROMPT = `You are a professional flooring inspector. Analyze this image and provide:
1. Floor type and material details
2. List of visible defects or damage
3. Severity assessment (0-1 scale, where 1 is most severe)
4. Specific repair recommendations
5. Estimated repair costs

Format your response as JSON with the following structure:
{
  "severity": number,
  "issues": string[],
  "recommendations": string[],
  "costs": [{ "item": string, "amount": number }]
}`;

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const analyzeImage = async (imageData: string, clientId?: string): Promise<DamageAnalysis> => {
  try {
    // Validate environment variables
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Validate image data
    if (!imageData) {
      throw new Error('No image data provided');
    }

    // Extract base64 data
    let base64Image: string;
    try {
      base64Image = imageData.includes('base64,') 
        ? imageData.split('base64,')[1]
        : imageData;
    } catch (error) {
      throw new Error('Invalid image data format');
    }

    // Check image size
    const binarySize = atob(base64Image).length;
    if (binarySize > MAX_IMAGE_SIZE) {
      throw new Error('Image size exceeds maximum limit of 20MB');
    }

    // Implement retry logic
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: ANALYSIS_PROMPT,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: "high"
                  },
                },
              ],
            }
          ],
          max_tokens: 500,
          temperature: 0.5
        });

        if (!response.choices?.[0]?.message?.content) {
          throw new Error('No analysis generated');
        }

        const content = response.choices[0].message.content;

        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Invalid response format');
        }

        let analysis: any;
        try {
          analysis = JSON.parse(jsonMatch[0]);
        } catch (error) {
          console.error('JSON parse error:', error);
          throw new Error('Failed to parse analysis results');
        }

        // Validate and normalize the response
        const result: DamageAnalysis = {
          severity: Number(analysis.severity) || 0,
          issues: Array.isArray(analysis.issues) ? analysis.issues : [],
          recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
          costs: Array.isArray(analysis.costs) ? analysis.costs.map(cost => ({
            item: String(cost.item || ''),
            amount: Number(cost.amount) || 0
          })) : []
        };

        // Validate severity range
        result.severity = Math.max(0, Math.min(1, result.severity));

        // Save the analysis to the database if we have a client ID
        if (clientId) {
          await saveDamageReport({
            clientId,
            imageUrl: imageData,
            analysis: result
          }).catch(error => {
            console.error('Failed to save damage report:', error);
            // Don't throw here - we still want to return the analysis
          });
        }

        return result;

      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt} failed:`, error);
        
        // Check if we should retry
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
          continue;
        }
        
        // Handle specific OpenAI errors
        if (error instanceof Error) {
          if (error.message.includes('model_not_found')) {
            throw new Error('The AI model is currently unavailable. Please try again later.');
          }
          if (error.message.includes('invalid_api_key')) {
            throw new Error('Invalid API key configuration. Please contact support.');
          }
          if (error.message.includes('rate_limit_exceeded')) {
            throw new Error('Service is currently busy. Please try again in a few minutes.');
          }
          throw error;
        }
        throw new Error('Failed to analyze image');
      }
    }

    throw lastError || new Error('Failed to analyze image after multiple attempts');

  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred during image analysis');
  }
};

export const saveDamageReport = async (report: {
  clientId: string;
  imageUrl: string;
  analysis: DamageAnalysis;
  notes?: string;
}): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('damage_reports')
      .insert([{
        client_id: report.clientId,
        date: new Date().toISOString(),
        image_url: report.imageUrl,
        severity: report.analysis.severity,
        issues: report.analysis.issues,
        recommendations: report.analysis.recommendations,
        costs: report.analysis.costs,
        notes: report.notes,
        created_by: user.id
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error saving damage report:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to save damage report');
  }
};

export const getDamageHistory = async (clientId?: string): Promise<DamageReport[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('damage_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(report => ({
      id: report.id,
      date: report.date,
      imageUrl: report.image_url,
      analysis: {
        severity: report.severity,
        issues: report.issues,
        recommendations: report.recommendations,
        costs: report.costs
      },
      notes: report.notes
    }));
  } catch (error) {
    console.error('Error getting damage history:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to retrieve damage history');
  }
};