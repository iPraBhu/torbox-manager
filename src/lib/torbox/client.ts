// TorBox API Client
// Based on https://api.torbox.app/docs
// Proxied through Cloudflare Worker to bypass CORS

const TORBOX_API_BASE = 'https://torbox-api.prabhu-tools.com/v1/api';

export class TorBoxAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public detail?: unknown
  ) {
    super(message);
    this.name = 'TorBoxAPIError';
  }
}

export class TorBoxClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${TORBOX_API_BASE}${endpoint}`;
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    // Don't set Content-Type for FormData, let browser set it with boundary
    const isFormData = options.body instanceof FormData;
    if (!isFormData) {
      (headers as any)['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorDetail: unknown;
        try {
          errorDetail = await response.json();
        } catch {
          errorDetail = await response.text();
        }
        
        throw new TorBoxAPIError(
          `TorBox API error: ${response.statusText}`,
          response.status,
          errorDetail
        );
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return {} as T;
    } catch (error) {
      if (error instanceof TorBoxAPIError) {
        throw error;
      }
      
      // Network or other errors
      throw new TorBoxAPIError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}
