export interface Station {
  station_id: string;
  name: string;
  location: string;
  last_seen: string | null;
  submission_status: "on_time" | "pending" | "overdue";
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
}

export interface PaginatedStations {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: Station[];
}

export interface WindowStatus {
  is_open: boolean;
  windows: number[];
  window_duration_seconds: number;
  window_close_offset_minutes: number;
  current: { hour: number; closes_at: string; seconds_left: number } | null;
  next: { hour: number; opens_at: string; opens_in_seconds: number } | null;
}

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  level: "info" | "warning" | "error";
  created_at: string;
  is_read: boolean;
}
