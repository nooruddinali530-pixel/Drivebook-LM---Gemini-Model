
import { DriveFile } from "../types";

// Service account details provided by the user
const SERVICE_ACCOUNT = {
  "type": "service_account",
  "project_id": "gemini-drive-connector",
  "private_key_id": "bc97d165c835f749c99cc1b222ba3572b4677448",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCi5DUGmuqaYa71\nlDOZpGiesTC7IJ5Ft7V9s5HZehg7ps2vQul+Uj0NBAZ29yFwy/7tcNDVo5EnHUjc\nFkaJwNUnr1fAXF/8hJMOr73eAgWoqLDsVpxCUcI3Xe49rphBNe/iqrnpW79yvCq7\nFwtLk+NQ8cAngG/MKLm6wYwQZDLjQ1UxmIXRRrIvH3xO1EWKf4Hpeu4kWQnKwzhN\nEKli7TWYzn3w6JWvUdqgdqdcFkrdHDQvzY8aHLRGpJAunwMC/Mm4zP+DWa1M9RT6\nfwg+RhxVv46sbT6yTZfqaJ70UA0PlPOcxVh91X3MM3/jJrPt+w7rf7jRLY7x/2ab\nm9e+aL/nAgMBAAECggEALZsxUXkcSD8jSjTFQbYraIr5ttrKFYD6+ofFRRuPH1xz\naCeW0jxaRYOj/7jvjvI+nOIiRj52jHoBhUVjWHw58dOBASWb5kqEFe+UfE0aon8g\nkfsp4tObSf8tje2NSWy9jjv4s2JxtsECQcGQ8wcj9OzKvQSTyJh6b9Ryz8AOE1y7\nGVJ+TxN7J4+AXsTMDBkMfWxBprdwDdK2jn2gY/mPcDO93QszbbCPJ83hGFD8ffVv\nczBnxwQ8Fqnlj5VReNM5Z3tAlaa7XUrJrOgQo83HWCrITG17WPooVjQM/BQj61Zr\nWYqVRora12w+AEBv/hDiIYt90FQ4lx1ChcJIQNDFsQKBgQDcEnKJBKfMuW4oeao7\nK8Ni+LPoJiQQuoUtGk0482BCZqzXDI5i8HwPZPBZQ1WiwLUNGV2hawLFvBGDlrCk\nMPcDih/9aq8GLv3s6EQkrXieG6K/menRprFkdztZ9uzdopEnjy2Qw9AJBiwmf9WI\nDqHi+YzGy3dVgVbJRjV9MLFeiQKBgQC9e/0gyWorab2paKGqQhc0EiAlW1jqbKlp\nLJge6+OSBoQQ/26E78AA4r/X5SFNiYUy8BmU7mZp48u7XCLCIG94GUPE/TuuPvyu\njlkdWv/CT+dBdaEh3fsjVKUj1rYn+A2KLHR8Im8ikPD29zaMUEoIA3Mg9ViRUTat\nDpHXTvYO7wKBgANIuzDUQvTJJ52vAx1S792APJ8QQqWFQwuDQvfAmgUjpxymcVGE\nqTVJmlSarqJ5IbqKUF1iTW5J+jDuhMBOgsEoxIVxnB8JgHySksHBXPVvECSv1U9t\nn2QSa25SQwKjtGrUtidc5LPdxbblXXhkT4IlmzY0Pxmljnf+djniCiORAoGBAJbf\n3fq4RaBRruHwXSFrRHyCnjQAmzj10qLbDjk4zFgedhPuvzp8iB5sbiLi3/SUNooL\noeLzPHq+Fh+WSlrWZstzGoIEvPuOTbZTw+Na7OD0rIdzuRx1Wx2TrXZu5VXH7kgC\nA7I/3MviKuwKhdWNrJTa4lXw5Ve4GdgMDNYqmkPjAoGAGR+hDlp6n4wontFuInEA\nyDtrWDVzYu2z3wsdX2jhNkda7vuBTlgOH4H9GyEGU3nvFKAk+1topNnMjKPw4C9H\nIfdCva4HmIEG+Xfsm99ifa1GJuSNjso01ct5fqtOFEcRfxGg3cLwT4+7QTFKML2v\nikXFqFW5M0oFzgeTlCxjms0=\n-----END PRIVATE KEY-----\n",
  "client_email": "gemini-drive-bot@gemini-drive-connector.iam.gserviceaccount.com"
};

export class DriveService {
  private folderId: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(folderId: string) {
    this.folderId = folderId;
  }

  updateFolderId(id: string) {
    this.folderId = id;
    this.accessToken = null; // Clear token as new folder might require refresh if scope changed (though here scope is global drive)
  }

  /**
   * Helper to sign a JWT using the browser's SubtleCrypto API.
   */
  private async createSignedJwt(): Promise<string> {
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: SERVICE_ACCOUNT.client_email,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    const base64UrlEncode = (obj: any) => 
      btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const pemContents = SERVICE_ACCOUNT.private_key
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');
    const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey.buffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      new TextEncoder().encode(signatureInput)
    );

    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    return `${signatureInput}.${encodedSignature}`;
  }

  private async refreshAccessToken(): Promise<string> {
    const jwt = await this.createSignedJwt();
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Auth Error: ${JSON.stringify(err)}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    return data.access_token;
  }

  private async getValidToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }
    return await this.refreshAccessToken();
  }

  async getFolderName(): Promise<string> {
    try {
      const token = await this.getValidToken();
      const url = `https://www.googleapis.com/drive/v3/files/${this.folderId}?fields=name&supportsAllDrives=true`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return "Unknown Folder";
      const data = await response.json();
      return data.name || "Unnamed Folder";
    } catch {
      return "Connected Folder";
    }
  }

  async initialize(): Promise<string> {
    try {
      const token = await this.getValidToken();
      const url = `https://www.googleapis.com/drive/v3/files/${this.folderId}?fields=id,name,mimeType&supportsAllDrives=true`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Drive Init Error: ${JSON.stringify(errorData.error || errorData)}`);
      }
      
      const data = await response.json();
      return data.name || "Connected Folder";
    } catch (error) {
      console.error("Initialization failed:", error);
      throw error;
    }
  }

  async fetchFiles(): Promise<DriveFile[]> {
    try {
      const token = await this.getValidToken();
      const q = `'${this.folderId}' in parents and trashed = false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,size)&supportsAllDrives=true&includeItemsFromAllDrives=true`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Fetch Error: ${JSON.stringify(errorData.error || errorData)}`);
      }
      
      const data = await response.json();
      const files = data.files || [];

      return files.map((f: any) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        icon: this.getIcon(f.mimeType)
      }));
    } catch (error) {
      console.error("Fetch files error:", error);
      throw error;
    }
  }

  async getFileContent(fileId: string, mimeType: string): Promise<string> {
    try {
      const token = await this.getValidToken();
      let url: string;

      if (mimeType === 'application/vnd.google-apps.document') {
        url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
      } 
      else if (mimeType === 'text/plain' || mimeType.includes('text/')) {
        url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      }
      else {
        return `[Binary file content for ${mimeType} skipped. Text-based files only.]`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return `[Error fetching content: ${response.statusText} ${JSON.stringify(errorData)}]`;
      }
      
      return await response.text();
    } catch (error) {
      console.error(`Error reading file ${fileId}:`, error);
      return `[Error reading file content: ${error instanceof Error ? error.message : String(error)}]`;
    }
  }

  private getIcon(mimeType: string): string {
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📘';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📙';
    if (mimeType.includes('image')) return '🖼️';
    return '📄';
  }
}

export const driveService = new DriveService("18BC83uHgViAm-R16s-JDjbZEaIccU6Y4");
