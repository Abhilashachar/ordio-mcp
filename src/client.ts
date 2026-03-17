/**
 * Thin HTTP client for the ordio REST API.
 * All methods attach the Bearer token and org context automatically.
 */

import type { Config } from './config.js';

export class OrdioClient {
  private readonly baseUrl: string;
  private readonly orgId: string;
  private readonly headers: Record<string, string>;

  constructor(config: Config) {
    this.baseUrl = config.apiBaseUrl.replace(/\/$/, '');
    this.orgId = config.orgId;
    this.headers = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private url(path: string): string {
    const orgPath = path.startsWith('/orgs/') ? path : path;
    return `${this.baseUrl}/api/v1${orgPath}`;
  }

  private orgUrl(resource: string): string {
    return this.url(`/orgs/${this.orgId}/${resource}`);
  }

  async get<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    let url = path.startsWith('/') ? this.url(path) : this.orgUrl(path);
    if (query) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null && v !== '') {
          params.set(k, String(v));
        }
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }
    const res = await fetch(url, { method: 'GET', headers: this.headers });
    return this.parseResponse<T>(res);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = path.startsWith('/') ? this.url(path) : this.orgUrl(path);
    const res = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.parseResponse<T>(res);
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const url = path.startsWith('/') ? this.url(path) : this.orgUrl(path);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: this.headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.parseResponse<T>(res);
  }

  async delete<T>(path: string): Promise<T> {
    const url = path.startsWith('/') ? this.url(path) : this.orgUrl(path);
    const res = await fetch(url, { method: 'DELETE', headers: this.headers });
    return this.parseResponse<T>(res);
  }

  private async parseResponse<T>(res: Response): Promise<T> {
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`ordio API returned non-JSON (${res.status}): ${text.slice(0, 200)}`);
    }

    if (!res.ok) {
      const err = json as { message?: string; error?: string };
      const msg = err.message ?? err.error ?? `HTTP ${res.status}`;
      throw new Error(`ordio API error ${res.status}: ${msg}`);
    }

    const envelope = json as { data?: T; items?: T; success?: boolean };
    if ('data' in envelope) return envelope.data as T;
    if ('items' in envelope) return envelope.items as T;
    return json as T;
  }
}
