type ResponseApi<T extends unknown> = {
  data: T;
  error: boolean;
  response: Response;
};

export interface AjaxHeaders {
  Authorization?: string;
  'content-type'?: string;
  Accept?: string;
  'Ft-Calling-App'?: string;
  'Ft-Calling-App-Version'?: string;
}

class Api {
  ajaxHeaders: AjaxHeaders;

  constructor() {
    this.ajaxHeaders = {
      'Ft-Calling-App': 'FtTechnicalChallenge',
      'Ft-Calling-App-Version': '3.9.27',
    };
  }

  setToken(token: string | null) {
    if (token) {
      this.ajaxHeaders.Authorization = `Basic ${token}`;
    } else {
      delete this.ajaxHeaders.Authorization;
    }
  }

  async fetchJson<T = unknown>(
    url: string,
    method = 'GET',
    body: BodyInit | null = null
  ): Promise<ResponseApi<T | null>> {
    const fetchResponse = await this.fetch(url, method, body);
    if (fetchResponse.ok) {
      const data: T = await fetchResponse.json();
      return { data, response: fetchResponse, error: false };
    }
    return { data: null, response: fetchResponse, error: true };
  }

  async fetch(
    url: string,
    method = 'GET',
    body: BodyInit | null = null,
    contentType: string | null = null,
    accept: string | null = null
  ): Promise<Response> {
    const headers = new Headers();
    if (this.ajaxHeaders) {
      if (this.ajaxHeaders.Authorization) {
        headers.set('Authorization', this.ajaxHeaders.Authorization);
      }
      if (this.ajaxHeaders.Accept) {
        headers.set('Accept', this.ajaxHeaders.Accept);
      }
      if (this.ajaxHeaders['Ft-Calling-App-Version']) {
        headers.set(
          'Ft-Calling-App-Version',
          this.ajaxHeaders['Ft-Calling-App-Version']
        );
      }
      if (this.ajaxHeaders['Ft-Calling-App']) {
        headers.set('Ft-Calling-App', this.ajaxHeaders['Ft-Calling-App']);
      }
    }
    if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
      headers.set('Content-Type', 'application/json');
    }

    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    if (accept) {
      headers.set('Accept', accept);
    }

    const fetchParams: RequestInit = {
      method,
      headers,
    };

    if (body) {
      fetchParams.body = body;
    }

    const request = new Request(url, fetchParams);

    const fetchResponse: Response = await fetch(request);

    return fetchResponse;
  }
}

const api = new Api();
export default api;
