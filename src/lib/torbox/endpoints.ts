// TorBox API Endpoints
// Based on https://api.torbox.app/docs and https://www.postman.com/torbox/torbox/overview

import { TorBoxClient } from './client';
import type {
  TorBoxUser,
  TorBoxTorrent,
  TorBoxUsenetDownload,
  TorBoxWebDownload,
  TorBoxFile,
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

export interface TorBoxControlTorrentResponse {
  success: boolean;
  detail: string;
}

export interface TorBoxAddMagnetResponse {
  success: boolean;
  detail: string;
  data: {
    torrent_id: number;
    hash: string;
    name: string;
  };
}

export interface TorBoxAddTorrentFileResponse {
  success: boolean;
  detail: string;
  data: {
    torrent_id: number;
    hash: string;
    name: string;
  };
}

export interface TorBoxDownloadLinkResponse {
  success: boolean;
  detail: string;
  data: string;
}

export interface TorBoxStreamLinkResponse {
  success: boolean;
  detail: string;
  data: string;
}

export interface TorBoxFileListResponse {
  success: boolean;
  detail: string;
  data: TorBoxFile[];
}

export interface TorBoxUserSettingsResponse {
  success: boolean;
  detail: string;
  data: {
    download_directory: string;
    max_concurrent_downloads: number;
    max_torrent_size: number;
    max_usenet_size: number;
    max_webdownload_size: number;
    premiumize_enabled: boolean;
    real_debrid_enabled: boolean;
    seed_until_ratio: number;
    seed_until_time: number;
    zip_downloads: boolean;
  };
}

export interface TorBoxUpdateSettingsResponse {
  success: boolean;
  detail: string;
}

export interface TorBoxAccountStatsResponse {
  success: boolean;
  detail: string;
  data: {
    total_downloaded: number;
    total_uploaded: number;
    current_ratio: number;
    total_torrents: number;
    total_usenet: number;
    total_webdownloads: number;
    total_size: number;
  };
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

export interface TorBoxFileListResponse {
  success: boolean;
  detail: string;
  data: TorBoxFile[];
}

export interface TorBoxBulkDeleteResponse {
  success: boolean;
  detail: string;
  data: {
    deleted: number;
    failed: number;
  };
}

export interface TorBoxSearchResponse {
  success: boolean;
  detail: string;
  data: Array<{
    id: number;
    hash: string;
    name: string;
    size: number;
    seeds: number;
    peers: number;
    category: string;
    magnet: string;
    created_at: string;
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

  async addMagnet(magnet: string): Promise<TorBoxAddMagnetResponse> {
    return this.client.post<TorBoxAddMagnetResponse>('/torrents/addmagnet', {
      magnet,
    });
  }

  async addTorrentFile(file: File): Promise<TorBoxAddTorrentFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.client.post<TorBoxAddTorrentFileResponse>('/torrents/addtorrentfile', formData);
  }

  async getTorrentInfo(id: number): Promise<TorBoxTorrent> {
    const response = await this.client.get<{ success: boolean; data: TorBoxTorrent }>(
      `/torrents/torrentinfo?id=${id}`
    );
    return response.data;
  }

  async controlTorrent(id: number, operation: 'Pause' | 'Resume' | 'Delete' | 'Reannounce' | 'Recheck'): Promise<TorBoxControlTorrentResponse> {
    return this.client.post<TorBoxControlTorrentResponse>('/torrents/controltorrent', {
      torrent_id: id,
      operation,
    });
  }

  async deleteTorrent(id: number): Promise<void> {
    await this.controlTorrent(id, 'Delete');
  }

  async pauseTorrent(id: number): Promise<TorBoxControlTorrentResponse> {
    return this.controlTorrent(id, 'Pause');
  }

  async resumeTorrent(id: number): Promise<TorBoxControlTorrentResponse> {
    return this.controlTorrent(id, 'Resume');
  }

  async reannounceTorrent(id: number): Promise<TorBoxControlTorrentResponse> {
    return this.controlTorrent(id, 'Reannounce');
  }

  async recheckTorrent(id: number): Promise<TorBoxControlTorrentResponse> {
    return this.controlTorrent(id, 'Recheck');
  }

  async getTorrentFiles(id: number): Promise<TorBoxFile[]> {
    const response = await this.client.get<TorBoxFileListResponse>(
      `/torrents/getfiles?id=${id}`
    );
    return response.data || [];
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

  async controlUsenetDownload(id: number, operation: 'Pause' | 'Resume' | 'Delete'): Promise<TorBoxControlTorrentResponse> {
    return this.client.post<TorBoxControlTorrentResponse>('/usenet/controlusenetdownload', {
      usenet_id: id,
      operation,
    });
  }

  async deleteUsenetDownload(id: number): Promise<void> {
    await this.controlUsenetDownload(id, 'Delete');
  }

  async pauseUsenetDownload(id: number): Promise<TorBoxControlTorrentResponse> {
    return this.controlUsenetDownload(id, 'Pause');
  }

  async resumeUsenetDownload(id: number): Promise<TorBoxControlTorrentResponse> {
    return this.controlUsenetDownload(id, 'Resume');
  }

  async getUsenetInfo(id: number): Promise<TorBoxUsenetDownload> {
    const response = await this.client.get<{ success: boolean; data: TorBoxUsenetDownload }>(
      `/usenet/usenetinfo?id=${id}`
    );
    return response.data;
  }

  // ============ Web Downloads ============
  
  async getWebDownloads(): Promise<TorBoxWebDownload[]> {
    const response = await this.client.get<TorBoxWebDownloadsResponse>('/webdownload/mylist');
    return response.data || [];
  }

  async createWebDownload(link: string): Promise<void> {
    await this.client.post('/webdownload/createwebdownload', { link });
  }

  async controlWebDownload(id: number, operation: 'Pause' | 'Resume' | 'Delete'): Promise<TorBoxControlTorrentResponse> {
    return this.client.post<TorBoxControlTorrentResponse>('/webdownload/controlwebdownload', {
      webdownload_id: id,
      operation,
    });
  }

  async deleteWebDownload(id: number): Promise<void> {
    await this.controlWebDownload(id, 'Delete');
  }

  async pauseWebDownload(id: number): Promise<TorBoxControlTorrentResponse> {
    return this.controlWebDownload(id, 'Pause');
  }

  async resumeWebDownload(id: number): Promise<TorBoxControlTorrentResponse> {
    return this.controlWebDownload(id, 'Resume');
  }

  async getWebDownloadInfo(id: number): Promise<TorBoxWebDownload> {
    const response = await this.client.get<{ success: boolean; data: TorBoxWebDownload }>(
      `/webdownload/webdownloadinfo?id=${id}`
    );
    return response.data;
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

    const response = await this.client.get<TorBoxDownloadLinkResponse>(
      `/torrents/requestdl?${params.toString()}`
    );
    
    return response.data;
  }

  async requestStreamLink(
    type: 'torrent' | 'usenet' | 'webdownload',
    id: number,
    fileId?: number
  ): Promise<string> {
    const params = new URLSearchParams({
      [`${type}_id`]: id.toString(),
      ...(fileId !== undefined && { file_id: fileId.toString() }),
    });

    const response = await this.client.get<TorBoxStreamLinkResponse>(
      `/torrents/requeststream?${params.toString()}`
    );
    
    return response.data;
  }

  // ============ User / Account ============
  
  async getUserSettings(): Promise<TorBoxUserSettingsResponse['data']> {
    const response = await this.client.get<TorBoxUserSettingsResponse>('/user/settings');
    return response.data;
  }

  async updateUserSettings(settings: Partial<TorBoxUserSettingsResponse['data']>): Promise<TorBoxUpdateSettingsResponse> {
    return this.client.post<TorBoxUpdateSettingsResponse>('/user/updatesettings', settings);
  }

  async getAccountStats(): Promise<TorBoxAccountStatsResponse['data']> {
    const response = await this.client.get<TorBoxAccountStatsResponse>('/user/stats');
    return response.data;
  }

  // ============ Search ============
  
  async searchTorrents(query: string, category?: string, limit?: number): Promise<TorBoxSearchResponse['data']> {
    const params = new URLSearchParams({
      query,
      ...(category && { category }),
      ...(limit && { limit: limit.toString() }),
    });

    const response = await this.client.get<TorBoxSearchResponse>(
      `/torrents/search?${params.toString()}`
    );
    
    return response.data;
  }

  // ============ Bulk Operations ============
  
  async bulkDeleteTorrents(ids: number[]): Promise<TorBoxBulkDeleteResponse> {
    return this.client.post<TorBoxBulkDeleteResponse>('/torrents/bulkdelete', {
      torrent_ids: ids,
    });
  }

  async bulkDeleteUsenet(ids: number[]): Promise<TorBoxBulkDeleteResponse> {
    return this.client.post<TorBoxBulkDeleteResponse>('/usenet/bulkdelete', {
      usenet_ids: ids,
    });
  }

  async bulkDeleteWebDownloads(ids: number[]): Promise<TorBoxBulkDeleteResponse> {
    return this.client.post<TorBoxBulkDeleteResponse>('/webdownload/bulkdelete', {
      webdownload_ids: ids,
    });
  }
}

// Helper to create an instance
export function createTorBoxAPI(apiKey: string): TorBoxEndpoints {
  const client = new TorBoxClient(apiKey);
  return new TorBoxEndpoints(client);
}
