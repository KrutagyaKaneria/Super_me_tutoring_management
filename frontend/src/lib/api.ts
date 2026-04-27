const API_URL = '/api';

export const api = {
  
async get(endpoint: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return this.handleResponse(response);
  },

  async post(endpoint: string, data: any) {
    const token = localStorage.getItem('token');
    const url = `${API_URL}${endpoint}`;
    console.log(`📤 POST ${url}:`, data);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      console.log(`📥 Response status: ${response.status}`);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error(`💥 Fetch error:`, error);
      throw error;
    }
  },

  async patch(endpoint: string, data?: any) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(response);
  },

  async put(endpoint: string, data: any) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  },

  async delete(endpoint: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return this.handleResponse(response);
  },

  async handleResponse(response: Response) {
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = (data && data.message) || response.statusText || 'API error';
      throw new Error(error);
    }

    return data;
  }
};
