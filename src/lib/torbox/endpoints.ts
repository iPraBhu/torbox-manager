// TorBox API Endpoints
// Based on https://api.torbox.app/docs and https://www.postman.com/torbox/torbox/overview

import { TorBoxClient } from './client';
import type {
  TorBoxUser,
  TorBoxTorrent,
  TorBoxUsenetDownload,
  TorBoxWebDownload,
} from '@/types';

export interface TorBoxUserResponse {
  success: boolean;
  detail: string;
  data: TorBoxUser;
}

export interface TorBoxTorrentsResponse {
  success: boolean;
  detail: string;
  data: TorBoxTorrent[];
}

export interface TorBoxUsenetResponse {
  success: boolean;
  detail: string;
  data: TorBoxUsenetDownload[];
}

export interface TorBoxWebDownloadsResponse {
  success: boolean;
  detail: string;
  data: TorBoxWebDownload[];
}

export interface TorBoxCreateTorrentResponse {
  success: boolean;
  detail: string;
  data: {
    torrent_id: number;
    hash: string;
    name: string;
  };
}

export interface TorBoxCachedResponse {
  success: boolean;
  detail: string;
  data: Array<{
    hash: string;
    name?: string;
    size?: number;
  }>;
}

export class TorBoxEndpoints {
  constructor(private client: TorBoxClient) {}

  // ============ User / Account ============
  
  async getUser(): Promise<TorBoxUser> {
    const response = await this.client.get<TorBoxUserResponse>('/user/me');
    return response.data;
  }

  // ============ Torrents ============
  
  async getTorrents(): Promise<TorBoxTorrent[]> {
    const response = await this.client.get<TorBoxTorrentsResponse>('/torrents/mylist');
    return response.data || [];
  }

  async createTorrent(magnet: string): Promise<TorBoxCreateTorrentResponse> {
    return this.client.post<TorBoxCreateTorrentResponse>('/torrents/createtorrent', {
      magnet,
    });
  }

  async getTorrentInfo(id: number): Promise<TorBoxTorrent> {
    const response = await this.client.get<{ success: boolean; data: TorBoxTorrent }>(
      `/torrents/torrentinfo?id=${id}`
    );
    return response.data;
  }

  async deleteTorrent(id: number): Promise<void> {
    await this.client.post(`/torrents/controltorrent`, {
      torrent_id: id,
      operation: 'Delete',
    });
  }

  async checkCached(hashes: string[]): Promise<TorBoxCachedResponse> {
    // Format: hash1,hash2,hash3
    const hashString = hashes.join(',');
    return this.client.get<TorBoxCachedResponse>(
      `/torrents/checkcached?hash=${encodeURIComponent(hashString)}`
    );
  }

  // ============ Usenet ============
  
  async getUsenetDownloads(): Promise<TorBoxUsenetDownload[]> {
    const response = await this.client.get<TorBoxUsenetResponse>('/usenet/mylist');
    return response.data || [];
  }

  async createUsenetDownload(link: string): Promise<void> {
    await this.client.post('/usenet/createusenetdownload', { link });
  }

  async deleteUsenetDownload(id: number): Promise<void> {
    await this.client.post(`/usenet/controlusenetdownload`, {
      usenet_id: id,
      operation: 'Delete',
    });
  }

  // ============ Web Downloads ============
  
  async getWebDownloads(): Promise<TorBoxWebDownload[]> {
    const response = await this.client.get<TorBoxWebDownloadsResponse>('/webdownload/mylist');
    return response.data || [];
  }

  async createWebDownload(link: string): Promise<void> {
    await this.client.post('/webdownload/createwebdownload', { link });
  }

  async deleteWebDownload(id: number): Promise<void> {
    await this.client.post(`/webdownload/controlwebdownload`, {
      webdownload_id: id,
      operation: 'Delete',
    });
  }

  // ============ Request Download Link ============
  
  async requestDownloadLink(
    type: 'torrent' | 'usenet' | 'webdownload',
    id: number,
    fileId?: number,
    zipLink?: boolean
  ): Promise<string> {
    const params = new URLSearchParams({
      [`${type}_id`]: id.toString(),
      ...(fileId !== undefined && { file_id: fileId.toString() }),
      ...(zipLink && { zip_link: 'true' }),
    });

    const response = await this.client.get<{ success: boolean; data: string }>(
      `/torrents/requestdl?${params.toString()}`
    );
    
    return response.data;
  }
}

// Helper to create an instance
export function createTorBoxAPI(apiKey: string): TorBoxEndpoints {
  const client = new TorBoxClient(apiKey);
  return new TorBoxEndpoints(client);
}
