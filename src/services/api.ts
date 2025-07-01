export class Api {
    private static readonly baseUrl: string = 'https://backend-squizzit.dreadex.dev/api';
    private static token: string | null = null;

    private static getHeaders(
    extraHeaders?: Record<string, string>
    ): Record<string, string> {
        const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...extraHeaders,
        };

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

    // Bypass refresh logic for login/register
    const isAuthRoute =
      url.includes("/auth/login") || url.includes("/auth/register");

    if (response.status === 401 && !isAuthRoute) {
      /*const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        options.headers = this.getHeaders(extraHeaders); // refresh headers
        response = await fetch(fullUrl, options);
      }*/
    }

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