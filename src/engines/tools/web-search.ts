/**
 * Web Search Tool - Uses Perplexity API for web search
 * Returns structured results for evidence gathering
 */

import ky from 'ky';
import { logger } from '../../utils/logger.js';

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  description?: string;
}

export class WebSearchTool {
  private apiKey: string;
  private apiUrl = 'https://api.perplexity.ai/chat/completions';
  
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('PERPLEXITY_API_KEY not set, web search disabled');
    }
  }
  
  /**
   * Search the web using Perplexity
   */
  async search(query: string, recency: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<WebSearchResult[]> {
    if (!this.apiKey) {
      logger.warn('Web search skipped - no API key');
      return [];
    }
    
    try {
      logger.info('Searching web', { query, recency });
      
      // Add recency to query for better results
      const enhancedQuery = `${query} ${this.getRecencyFilter(recency)}`;
      
      const response = await ky.post(this.apiUrl, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        json: {
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: 'You are a search assistant. Return the top 5 most relevant results with title, URL, and snippet. Focus on current, factual information.'
            },
            {
              role: 'user',
              content: `Search for: ${enhancedQuery}\n\nReturn results in this JSON format:
[{"title": "...", "url": "...", "snippet": "..."}]`
            }
          ],
          max_tokens: 1000,
          temperature: 0.1,
          stream: false
        },
        timeout: 15000,
        retry: {
          limit: 2,
          methods: ['POST'],
          statusCodes: [408, 429, 500, 502, 503, 504]
        }
      }).json<any>();
      
      // Parse the response
      const content = response.choices?.[0]?.message?.content || '[]';
      
      // Try to extract JSON from the response
      let results: WebSearchResult[] = [];
      try {
        // Look for JSON array in the content
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          results = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        logger.warn('Failed to parse search results as JSON, extracting text');
        // Fallback: extract what we can from the text
        results = this.extractResultsFromText(content);
      }
      
      // Add citations if Perplexity provided them
      if (response.citations && response.citations.length > 0) {
        response.citations.forEach((citation: string, index: number) => {
          if (results[index]) {
            results[index].url = citation;
          }
        });
      }
      
      logger.info('Web search complete', { query, results: results.length });
      return results.slice(0, 5); // Return top 5 results
      
    } catch (error: any) {
      logger.error('Web search failed', { error: error.message, query });
      return [];
    }
  }
  
  /**
   * Get recency filter for search
   */
  private getRecencyFilter(recency: string): string {
    const now = new Date();
    switch (recency) {
      case 'hour':
        return 'past hour';
      case 'day':
        return 'today';
      case 'week':
        return 'past week';
      case 'month':
        return `${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      default:
        return 'recent';
    }
  }
  
  /**
   * Fallback: Extract results from unstructured text
   */
  private extractResultsFromText(content: string): WebSearchResult[] {
    const results: WebSearchResult[] = [];
    
    // Split by common separators
    const lines = content.split(/\n+/);
    
    for (const line of lines) {
      // Look for URLs
      const urlMatch = line.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        results.push({
          title: line.substring(0, 100).replace(urlMatch[0], '').trim() || 'Search Result',
          url: urlMatch[0],
          snippet: line.substring(0, 200)
        });
      } else if (line.length > 20 && results.length < 5) {
        // Add as a fact without URL
        results.push({
          title: 'Web Result',
          url: '',
          snippet: line.substring(0, 200)
        });
      }
    }
    
    return results;
  }
}
