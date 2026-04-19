export interface Station {
  station_id: string;
  name: string;
  location: string;
  last_seen: string | null;
  is_overdue: string;
}

export interface WindowStatus {
  is_open: boolean;
  current: { hour: number; closes_at: string; seconds_left: number };
  next: { hour: number; opens_at: string; opens_in_seconds: number };
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  level: "info" | "warning" | "error";
  created_at: string;
  is_read: boolean;
}
