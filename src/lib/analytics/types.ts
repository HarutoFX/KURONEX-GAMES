/**
 * KURONEX GAMES — Platform Analytics & Observability Types
 */

export type EventCategory = "auth" | "engagement" | "downloads" | "catalogue" | "admin" | "system";

export type EventType =
  | "user.registered"
  | "user.login"
  | "user.logout"
  | "game.page_view"
  | "library.game_added"
  | "library.game_removed"
  | "download.initiated"
  | "download.completed"
  | "download.failed"
  | "game.published"
  | "game.slot_updated"
  | "admin.action"
  | "announcement.published";

export interface PlatformEvent {
  id: string;
  eventType: EventType;
  category: EventCategory;
  timestamp: string; // ISO 8601
  userId?: string; // Optional authenticated user ID
  anonymousSessionId?: string; // Pseudonymous identifier for unauthenticated tracking
  resourceId?: string; // Game ID, Slot ID, Announcement ID, etc.
  metadata?: Record<string, string | number | boolean | undefined>;
}

export interface TimeRangeFilter {
  range: "24H" | "7D" | "30D" | "ALL";
  startDate?: string;
  endDate?: string;
}

export interface MetricTrend {
  current: number;
  previous: number;
  percentChange: number | null; // null if previous was 0 (cannot divide by zero)
  trendDirection: "UP" | "DOWN" | "FLAT" | "INSUFFICIENT_DATA";
}

export interface AnalyticsSummary {
  timeRange: "24H" | "7D" | "30D" | "ALL";
  lastUpdated: string;
  isLive: boolean;

  // User Velocity
  users: {
    totalRegistered: number;
    dau: number; // Daily Active Users (past 24h)
    wau: number; // Weekly Active Users (past 7d)
    mau: number; // Monthly Active Users (past 30d)
    newRegistrations: number;
    trend: MetricTrend;
  };

  // Engagement & Traffic
  engagement: {
    totalPageViews: number;
    uniqueVisitors: number;
    libraryAdditions: number;
    libraryRemovals: number;
    netLibraryGrowth: number;
    libraryAddsPerActiveUser: number;
    downloadsPerActiveUser: number;
  };

  // Telemetry & Downloads
  downloads: {
    initiated: number;
    completed: number;
    failed: number;
    successRate: number | null; // percentage, null if 0 attempts
    platformShare: {
      windows: number;
      linux: number;
      macos: number;
      other: number;
      total: number;
    };
  };

  // Breakdown tables
  topGames: {
    gameId: string;
    title: string;
    views: number;
    downloads: number;
    libraryAdds: number;
  }[];

  categoryShare: {
    category: string;
    count: number;
    percentage: number;
  }[];

  // Recent Event Stream
  recentEvents: PlatformEvent[];
}

// ─── Observability & Monitoring Types ─────────────────────────────────────────

export interface RequestLatencyMetric {
  endpoint: string;
  method: string;
  status: number;
  durationMs: number;
  timestamp: number;
}

export interface ObservabilitySnapshot {
  timestamp: string;
  uptimeSeconds: number;
  environment: string;

  api: {
    totalRequests: number;
    successCount: number; // 2xx
    clientErrorCount: number; // 4xx
    serverErrorCount: number; // 5xx
    errorRatePercent: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
    requestsPerMinute: number;
  };

  subsystems: {
    name: string;
    category: "internal" | "external";
    status: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "NOT_CONFIGURED";
    latencyMs: number | null;
    lastChecked: string;
    message: string;
  }[];

  alerts: OperationalAlert[];
}

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface OperationalAlert {
  id: string;
  code:
    | "API_HIGH_ERROR_RATE"
    | "AUTH_BRUTE_FORCE_SPIKE"
    | "DATABASE_UNAVAILABLE"
    | "DOWNLOAD_FAILURE_SPIKE"
    | "STORAGE_WRITE_FAILURE"
    | "SYSTEM_DEGRADED";
  title: string;
  message: string;
  severity: AlertSeverity;
  triggerTime: string;
  resolvedTime?: string;
  isActive: boolean;
  deliveryStatus: "LOGGED" | "WEBHOOK_DISPATCHED" | "WEBHOOK_NOT_CONFIGURED";
}
