import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import { unlockStation } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

interface Props {
  stationId: string;
  stationName: string;
  visible: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

export function LoginModal({ stationId, stationName, visible, onClose, onUnlocked }: Props) {
  const { t } = useLang();
  const dark = useColorScheme() === "dark";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleUnlock = async () => {
    setLoading(true);
    setError(false);
    const token = await unlockStation(stationId, password);
    setLoading(false);
    if (token) {
      setPassword("");
      onUnlocked();
    } else {
      setError(true);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <View
          className={`w-full max-w-sm rounded-2xl p-6 ${dark ? "bg-gray-900" : "bg-white"}`}
        >
          <Text className={`mb-1 text-base font-medium ${dark ? "text-white" : "text-gray-900"}`}>
            {t("stationAccess")}
          </Text>
          <Text className={`mb-4 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {t("passwordFor")} {stationName}
          </Text>

          <TextInput
            value={password}
            onChangeText={(v) => { setPassword(v); setError(false); }}
            placeholder={t("password")}
            placeholderTextColor={dark ? "#6B7280" : "#9CA3AF"}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            className={`mb-1 rounded-xl border px-4 py-3 text-base ${
              error
                ? "border-red-500"
                : dark ? "border-gray-700" : "border-gray-200"
            } ${dark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
          />
          {error && (
            <Text className="mb-3 text-sm text-red-500">{t("wrongPassword")}</Text>
          )}
          {!error && <View className="mb-3" />}

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleClose}
              className={`h-11 flex-1 items-center justify-center rounded-xl border ${
                dark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <Text className={dark ? "text-white" : "text-gray-900"}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleUnlock}
              disabled={loading || !password}
              className={`h-11 flex-1 items-center justify-center rounded-xl ${
                loading || !password
                  ? dark ? "bg-gray-800" : "bg-gray-200"
                  : dark ? "bg-white" : "bg-gray-900"
              }`}
            >
              <Text
                className={
                  loading || !password
                    ? dark ? "text-gray-500" : "text-gray-400"
                    : dark ? "text-gray-900" : "text-white"
                }
              >
                {loading ? "…" : t("unlock")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
