"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { unlockStation } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { Lock } from "lucide-react";

export function StationLoginDialog({
  stationId,
  stationName,
  open,
  onOpenChange,
  onUnlocked,
}: {
  stationId: string;
  stationName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUnlocked: () => void;
}) {
  const { t } = useLang();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError(null);
    const token = await unlockStation(stationId, password);
    setLoading(false);
    if (token) {
      setPassword("");
      onUnlocked();
    } else {
      setError(t("wrongPassword"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-muted">
            <Lock className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center font-medium">
            {t("stationAccess")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("passwordFor")}{" "}
            <span className="font-medium text-foreground">{stationName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <div className="space-y-2">
            <Label htmlFor="pw" className="font-normal">
              {t("password")}
            </Label>
            <Input
              id="pw"
              type="password"
              value={password}
              autoFocus
              className="h-11 rounded-xl"
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
          <Button
            onClick={submit}
            disabled={!password || loading}
            className="h-11 w-full rounded-xl font-normal"
          >
            {loading ? "…" : t("unlock")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
