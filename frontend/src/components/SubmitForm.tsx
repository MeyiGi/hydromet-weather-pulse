"use client";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { SynopInput } from "./SynopInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Send, LockKeyhole, CheckCircle2 } from "lucide-react";

export function SubmitForm({
  stationId,
  windowOpen,
  onLock,
  onSubmitted,
}: {
  stationId: string;
  windowOpen: boolean;
  onLock: () => void;
  onSubmitted?: () => void;
}) {
  const { t } = useLang();
  const [value, setValue] = useState("");
  const [submitting, setSubmit] = useState(false);
  const [receivedAt, setReceivedAt] = useState<string | null>(null);
  const complete = value.length === 24;

  const submit = async () => {
    setSubmit(true);
    try {
      await api.submit(stationId, value);
      const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setReceivedAt(now);
      setValue("");
      onSubmitted?.();
      toast.success(t("dataSubmitted"), {
        description: `${stationId} — ${now}`,
      });
    } catch (e) {
      toast.error(t("submissionFailed"), {
        description: (e as Error).message,
      });
    } finally {
      setSubmit(false);
    }
  };

  if (receivedAt) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="font-medium">{t("dataSubmitted")}</p>
            <p className="text-sm text-muted-foreground">
              {stationId} &mdash; {receivedAt}
            </p>
          </div>
          <Button
            variant="outline"
            className="h-10 rounded-xl font-normal"
            onClick={() => setReceivedAt(null)}
          >
            {t("submitAnother")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-medium">
          {t("submitReading")}
        </CardTitle>
        <CardDescription className="font-normal">
          {t("enterSynop")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center overflow-x-auto py-1">
          <SynopInput
            value={value}
            onChange={setValue}
            disabled={submitting || !windowOpen}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">{value.length} / 24</span>
          {!windowOpen && (
            <span className="text-amber-500">{t("windowClosed")}</span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={submit}
            disabled={!complete || submitting || !windowOpen}
            className="h-11 flex-1 rounded-xl font-normal"
          >
            <Send className="mr-2 h-4 w-4" />
            {submitting ? t("sending") : t("submit")}
          </Button>

          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onLock}
                  className="h-11 w-11 rounded-xl"
                >
                  <LockKeyhole className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("lockStation")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
