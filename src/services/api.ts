export class Api {
    private static readonly baseUrl: string = 'http://localhost:3000/api';
    private static token: string | null = null;

    private static getHeaders(
    extraHeaders?: Record<string, string>
    ): Record<string, string> {
        const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...extraHeaders,
        };
        this.token = localStorage.getItem('token');
        if (this.token) {
            headers["Authorization"] = `Bearer ${this.token}`;
        }

        return headers;
    }

    private static async request(
    method: string,
    url: string,
    body?: Record<string, any>,
    extraHeaders?: Record<string, string>
  ) {
    const fullUrl = this.baseUrl + url;
    const options: RequestInit = {
      method,
      headers: this.getHeaders(extraHeaders),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(fullUrl, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static get(url: string) {
    return this.request("GET", url);
  }

  static post(
    url: string,
    body: Record<string, any>,
    options?: { headers?: Record<string, string> }
  ) {
    return this.request("POST", url, body, options?.headers);
  }

  static put(url: string, body: Record<string, any>) {
    return this.request("PUT", url, body);
  }

  static delete(url: string) {
    return this.request("DELETE", url);
  }
}