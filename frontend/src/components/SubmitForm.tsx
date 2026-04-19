"use client";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
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
import { Send, LockKeyhole } from "lucide-react";

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
  const [value, setValue] = useState("");
  const [submitting, setSubmit] = useState(false);
  const complete = value.length === 24;

  const submit = async () => {
    setSubmit(true);
    try {
      await api.submit(stationId, value);
      setValue("");
      onSubmitted?.();
      toast.success("Data submitted", {
        description: `Station ${stationId} reading received.`,
      });
    } catch (e) {
      toast.error("Submission failed", { description: (e as Error).message });
    } finally {
      setSubmit(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-medium">Submit reading</CardTitle>
        <CardDescription>
          Enter the 24-character encrypted SYNOP code.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <SynopInput
            value={value}
            onChange={setValue}
            disabled={submitting || !windowOpen}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">{value.length} / 24</span>
          {!windowOpen && (
            <span className="text-amber-600">Window is closed</span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={submit}
            disabled={!complete || submitting || !windowOpen}
            className="h-11 flex-1 rounded-xl"
          >
            <Send className="mr-2 h-4 w-4" />
            {submitting ? "Sending…" : "Submit"}
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
              <TooltipContent>Lock station</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
