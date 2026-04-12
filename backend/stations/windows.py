from dataclasses import dataclass
from datetime import datetime, timedelta, timezone, date
from typing import Iterator, Optional


@dataclass(frozen=True)
class Window:
    hour: int
    opens_at: datetime
    closes_at: datetime

    def is_active(self, now: datetime) -> bool:
        return self.opens_at <= now <= self.closes_at

    def seconds_left(self, now: datetime) -> int:
        return int((self.closes_at - now).total_seconds())

    def opens_in(self, now: datetime) -> int:
        return int((self.opens_at - now).total_seconds())


class WindowService:
    def __init__(
        self,
        hours: list[int],
        open_offset_min: int,
        close_offset_min: int,
    ):
        self.hours = hours
        self.open_offset = timedelta(minutes=open_offset_min)
        self.close_offset = timedelta(minutes=close_offset_min)

    def _iter_windows(self, d: date) -> Iterator[Window]:
        for day_offset in [-1, 0, 1]:
            current_day = d + timedelta(days=day_offset)
            for h in self.hours:
                base = datetime(current_day.year, current_day.month, current_day.day, h, tzinfo=timezone.utc)
                yield Window(
                    hour=h,
                    opens_at=base + self.open_offset,
                    closes_at=base + self.close_offset,
                )

    def is_open(self, now: Optional[datetime] = None) -> bool:
        now = now or datetime.now(timezone.utc)
        return any(w.is_active(now) for w in self._iter_windows(now.date()))

    def current(self, now: Optional[datetime] = None) -> Optional[Window]:
        now = now or datetime.now(timezone.utc)
        return next((w for w in self._iter_windows(now.date()) if w.is_active(now)), None)

    def next(self, now: Optional[datetime] = None) -> Window:
        now = now or datetime.now(timezone.utc)

        for w in self._iter_windows(now.date()):
            if w.opens_at > now:
                return w

        # fallback → tomorrow
        tomorrow = now.date() + timedelta(days=1)
        return next(self._iter_windows(tomorrow))