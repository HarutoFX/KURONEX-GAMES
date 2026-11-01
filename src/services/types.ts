/**
 * KURONEX GAMES — Standardized API & DTO Contracts
 *
 * Designed to guarantee 100% interoperability with future microservices / backends:
 * - Go (Gin/Fiber)
 * - Node.js (NestJS/Fastify)
 * - Rust (Axum/Actix-web)
 * - Python (FastAPI)
 * - C# (.NET Core)
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    version?: string;
    count?: number;
  };
}

export interface GameSlotDto {
  id: string;
  category: string;
  slotNumber: number;
  title: string;
  tagline: string;
  description: string;
  coverImage: string;
  progressPercent: number;
  badge: string;
  tags: string[];
  accentColor: string;
  iconName: string;
  developer: string;
  engine?: string;
  targetOs?: ("windows" | "mac" | "linux")[];
  systemSpecs?: {
    os: string;
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
  };
  isEmpty: boolean;
}

export interface DeveloperPartnerDto {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  website: string;
  partnerTier: "Premier Partner" | "Studio Partner" | "Indie Pioneer";
  genre: string;
  headquarters: string;
  description: string;
  gamesCount: number;
  showInTicker: boolean;
  country?: string;
  logo?: string;
  teamSize?: string;
  primaryEngine?: string;
}

export interface DeveloperSubmissionDto {
  id: string;
  studioName: string;
  contactEmail: string;
  title: string;
  category: string;
  targetEngine: string;
  targetOs: string[];
  readinessPercent: number;
  coverImageUrl?: string;
  status: "Draft" | "In Review" | "Approved" | "Published";
  pitchSummary: string;
  submittedAt: string;
  clientArtifact?: {
    binaryName: string;
    versionTag: string;
    channel: "Alpha" | "Beta" | "Release";
  };
}

export interface ClientBuildDto {
  id: string;
  submissionId?: string;
  gameTitle: string;
  versionTag: string;
  channel: "Alpha" | "Beta" | "Release";
  targetOs: "Windows (DirectX 12)" | "macOS (Metal)" | "Linux (Vulkan)";
  executableName: string;
  buildSizeBytes: number;
  sha256Hash: string;
  releaseNotes: string;
  releasedAt: string;
  status: "Active" | "Superseded" | "Archived";
}

export interface WaitlistEntryDto {
  id: string;
  email: string;
  platform: "windows" | "macos" | "linux";
  queueNumber: number;
  vipToken: string;
  createdAt: string;
}
