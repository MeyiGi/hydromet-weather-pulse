import { useState } from "react";
import { View, Text, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { SynopInput } from "./SynopInput";

interface Props {
  stationId: string;
  windowOpen: boolean;
  onLock: () => void;
  onSubmitted?: () => void;
  onInputFocus?: () => void;
}

export function SubmitForm({ stationId, windowOpen, onLock, onSubmitted, onInputFocus }: Props) {
  const { t } = useLang();
  const dark = useColorScheme() === "dark";
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receivedAt, setReceivedAt] = useState<string | null>(null);
  const complete = value.length === 24;

  const submit = async () => {
    setSubmitting(true);
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
    } catch (e) {
      Alert.alert(t("submissionFailed"), (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (receivedAt) {
    return (
      <View className={`rounded-2xl p-6 shadow-sm ${dark ? "bg-gray-900" : "bg-white"}`}>
        <View className="items-center gap-4 py-4">
          <Ionicons name="checkmark-circle" size={52} color="#22c55e" />
          <View className="items-center gap-1">
            <Text className={`font-medium ${dark ? "text-white" : "text-gray-900"}`}>
              {t("dataSubmitted")}
            </Text>
            <Text className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
              {stationId} — {receivedAt}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setReceivedAt(null)}
            className={`rounded-xl border px-5 py-2.5 ${
              dark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <Text className={`font-normal ${dark ? "text-white" : "text-gray-900"}`}>
              {t("submitAnother")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className={`rounded-2xl p-4 shadow-sm ${dark ? "bg-gray-900" : "bg-white"}`}>
      <Text className={`mb-0.5 text-base font-medium ${dark ? "text-white" : "text-gray-900"}`}>
        {t("submitReading")}
      </Text>
      <Text className={`mb-4 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
        {t("enterSynop")}
      </Text>

      <SynopInput value={value} onChange={setValue} disabled={submitting || !windowOpen} onFocus={onInputFocus} />

      <View className="mt-3 flex-row items-center justify-between">
        <Text className={`text-xs tabular-nums ${dark ? "text-gray-400" : "text-gray-500"}`}>
          {value.length} / 24
        </Text>
        {!windowOpen && (
          <Text className="text-xs text-amber-500">{t("windowClosed")}</Text>
        )}
      </View>

      <View className="mt-4 flex-row gap-2">
        <TouchableOpacity
          onPress={submit}
          disabled={!complete || submitting || !windowOpen}
          className={`h-11 flex-1 flex-row items-center justify-center rounded-xl gap-2 ${
            !complete || submitting || !windowOpen
              ? dark ? "bg-gray-800" : "bg-gray-200"
              : dark ? "bg-white" : "bg-gray-900"
          }`}
        >
          <Ionicons
            name="send"
            size={15}
            color={
              !complete || submitting || !windowOpen
                ? dark ? "#6B7280" : "#9CA3AF"
                : dark ? "#111827" : "#FFFFFF"
            }
          />
          <Text
            className={`font-normal ${
              !complete || submitting || !windowOpen
                ? dark ? "text-gray-500" : "text-gray-400"
                : dark ? "text-gray-900" : "text-white"
            }`}
          >
            {submitting ? t("sending") : t("submit")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLock}
          className={`h-11 w-11 items-center justify-center rounded-xl border ${
            dark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <Ionicons
            name="lock-closed-outline"
            size={17}
            color={dark ? "#9CA3AF" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
