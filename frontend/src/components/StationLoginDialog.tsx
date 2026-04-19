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
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (unlockStation(stationId, password)) {
      setPassword("");
      setError(null);
      onUnlocked();
    } else {
      setError("Wrong password");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-muted">
            <Lock className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center">Station access</DialogTitle>
          <DialogDescription className="text-center">
            Password for <span className="font-medium">{stationName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <div className="space-y-2">
            <Label htmlFor="pw">Password</Label>
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
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button
            onClick={submit}
            disabled={!password}
            className="h-11 w-full rounded-xl"
          >
            Unlock
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
