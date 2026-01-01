// Parse torrent/release names to extract clean title and metadata

export interface ParsedRelease {
  title: string;
  year?: number;
  season?: number;
  episode?: number;
  resolution?: string;
  quality?: string;
  isComplete?: boolean; // For complete series/seasons
}

export function parseReleaseName(name: string): ParsedRelease {
  // Remove file extension
  let cleaned = name.replace(/\.(mkv|mp4|avi|mov|wmv|flv|webm|iso|img|m2ts|vob)$/i, '');
  
  // Remove common brackets and their content (often metadata)
  cleaned = cleaned.replace(/\[[^\]]+\]/g, ' ');
  cleaned = cleaned.replace(/\{[^}]+\}/g, ' ');
  cleaned = cleaned.replace(/\([^)]*(?:HEVC|x265|x264|10bit|8bit|AAC|DTS|AC3|BluRay|WEBRip|HDR)[^)]*\)/gi, ' ');
  
  // Detect complete series/seasons
  const isComplete = /\b(Complete|Full\s*Series|Season\s*Pack|S\d+\s*Complete)\b/i.test(cleaned);
  
  // Extract year (4 digits, typically 1920-2029, but avoid frame rates like 23.976 and bit depths like 2160p)
  const yearMatch = cleaned.match(/\b(19[2-9]\d|20[0-2]\d)\b(?!bit|p|fps)/);
  const year = yearMatch ? parseInt(yearMatch[1]) : undefined;
  
  // Extract season/episode (multiple formats including anime)
  const seasonEpisodeMatch = cleaned.match(
    /[Ss](\d{1,2})\s*[Ee](\d{1,3})|(\d{1,2})x(\d{1,3})|[Ss]eason\s*(\d+).*?[Ee]pisode\s*(\d+)|\b[Ee]p?\.?\s*(\d{1,3})\b/i
  );
  const season = seasonEpisodeMatch 
    ? parseInt(seasonEpisodeMatch[1] || seasonEpisodeMatch[3] || seasonEpisodeMatch[5]) 
    : undefined;
  const episode = seasonEpisodeMatch 
    ? parseInt(seasonEpisodeMatch[2] || seasonEpisodeMatch[4] || seasonEpisodeMatch[6] || seasonEpisodeMatch[7]) 
    : undefined;
  
  // Extract resolution
  const resolutionMatch = cleaned.match(/\b(2160p|1080p|720p|576p|480p|360p|4K|8K|UHD|FHD|HD)\b/i);
  const resolution = resolutionMatch ? resolutionMatch[1].toUpperCase() : undefined;
  
  // Extract quality/source info
  const qualityMatch = cleaned.match(/\b(BluRay|BRRip|BDRip|WEBRip|WEB-DL|HDTV|DVDRip|REMUX|Hybrid|CAM|TS|TC)\b/i);
  const quality = qualityMatch ? qualityMatch[1] : undefined;
  
  // Find where the release info starts (common delimiters)
  let cutoffIndex = cleaned.length;
  
  // Look for common cutoff points (ordered by typical appearance)
  const cutoffPatterns = [
    /\b(2160p|1080p|720p|576p|480p|360p|4K|8K|UHD|FHD|HD)\b/i,
    /\b(BluRay|BRRip|BDRip|WEBRip|WEB-DL|HDTV|DVDRip|REMUX|Hybrid)\b/i,
    /\b(x264|x265|HEVC|H\.?264|H\.?265|AVC|VC-1|XviD)\b/i,
    /\b(10bit|8bit|HDR10|HDR|Dolby\.?Vision|DV)\b/i,
    /\bDS4K\b/i,
    /\b(AMZN|NF|HULU|DSNP|ATVP|HBO|MAX|PCOK|PMTP)\b/i, // Streaming services
    /\b(MULTI|DUAL|Dual\.Audio|Hindi|Telugu|Tamil|Korean|Japanese|Chinese)\b/i, // Languages
  ];
  
  for (const pattern of cutoffPatterns) {
    const match = cleaned.match(pattern);
    if (match && match.index !== undefined && match.index < cutoffIndex) {
      cutoffIndex = match.index;
    }
  }
  
  // Extract title before the cutoff
  let title = cleaned.substring(0, cutoffIndex);
  
  // Remove year from title (we already extracted it)
  if (year) {
    title = title.replace(new RegExp(`\\b${year}\\b`), ' ');
  }
  
  // Remove season/episode from title
  if (seasonEpisodeMatch) {
    title = title.replace(seasonEpisodeMatch[0], ' ');
  }
  
  // Additional cleanup patterns
  const removePatterns = [
    // Common prefixes/sites
    /^(?:www\.[^\s]+|rarbg|yts|eztv|1337x|ettv|tgx)/gi,
    // Remaining resolution indicators
    /\b(HDTV|SDTV|PDTV|UHD)\b/gi,
    // Edition markers
    /\b(REPACK|PROPER|REAL|RETAIL|EXTENDED|UNRATED|UNCUT|Theatrical|DC|Directors?\.?Cut|IMAX|3D|Open\.?Matte)\b/gi,
    // HDR/Color
    /\b(HDR10\+?|HDR|Dolby\.?Vision|DV|HLG|SDR|10bit|8bit)\b/gi,
    // Audio info
    /\b(Atmos|TrueHD|DTS-HD|DTS\.HD|MA|FLAC|OPUS)\b/gi,
    // Part/CD indicators
    /\b(Part\.?\d+|CD\d+|Disc\.?\d+)\b/gi,
    // Misc tags
    /\b(RARBG|YIFY|YTS|PSA|NOGRP)\b/gi,
    // Complete/Pack tags
    /\b(Complete|Full\.?Series|Season\.?Pack)\b/gi,
    // Common separators at word boundaries
    /(?<=\w)[._-](?=\w)/g,
    // Multiple spaces
    /\s{2,}/g,
  ];
  
  removePatterns.forEach(pattern => {
    title = title.replace(pattern, ' ');
  });
  
  // Final cleanup
  title = title
    .replace(/[._-]/g, ' ')  // Convert separators to spaces
    .replace(/\s+/g, ' ')     // Multiple spaces to single
    .trim()                   // Remove leading/trailing whitespace
    .replace(/\s*[:\-\.,;!?]\s*$/g, '')  // Remove trailing punctuation
    .replace(/^[:\-\.,;!?]\s*/g, '');     // Remove leading punctuation
  
  // Remove common suffixes that might remain
  title = title.replace(/\s+(The|A|An)$/i, '');
  
  // Capitalize first letter of each word for better matching
  title = title.replace(/\b\w/g, (char) => char.toUpperCase());
  
  // Fix common acronyms
  title = title
    .replace(/\bUs\b/g, 'US')
    .replace(/\bUk\b/g, 'UK')
    .replace(/\bDc\b/g, 'DC')
    .replace(/\bHbo\b/g, 'HBO')
    .replace(/\bTv\b/g, 'TV');
  
  return {
    title,
    year,
    season,
    episode,
    resolution,
    quality,
    isComplete,
  };
}

// Generate a unique key for grouping similar content
export function getGroupKey(parsed: ParsedRelease): string {
  const key = `${parsed.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  if (parsed.year) return `${key}-${parsed.year}`;
  if (parsed.season) return `${key}-s${parsed.season}`;
  return key;
}

// Example usage:
// parseReleaseName('The.Girlfriend.2021.1080p.10bit.DS4K.NF.WEBRip.Hindi-Telugu.DDP5.1.x265.HEVC-Ospreay')
// Returns: { title: 'The Girlfriend', year: 2021, resolution: '1080p' }
