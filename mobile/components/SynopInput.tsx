import { View, Text, TextInput, useColorScheme } from "react-native";

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  onFocus?: () => void;
}

export function SynopInput({ value, onChange, disabled, onFocus }: Props) {
  const dark = useColorScheme() === "dark";
  const groups = value.trim() ? value.trim().split(/\s+/) : [];

  const handleChange = (raw: string) =>
    onChange(raw.replace(/[^\d\s]/g, "").replace(/\s{2,}/g, " "));

  return (
    <View className="gap-3">
      <TextInput
        value={value}
        onChangeText={handleChange}
        onFocus={onFocus}
        editable={!disabled}
        placeholder="38476 22999 00801 10083 20000 38358 48610 52003 333 …"
        placeholderTextColor={dark ? "#6B7280" : "#9CA3AF"}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        style={{ opacity: disabled ? 0.4 : 1 }}
        className={`rounded-xl border px-4 py-3 font-mono text-sm tracking-wider ${
          dark
            ? "border-gray-700 bg-gray-800 text-white"
            : "border-gray-200 bg-white text-gray-900"
        }`}
      />
      {groups.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5">
          {groups.map((g, i) => {
            const sep = g === "333" || g === "555";
            const valid = /^\d{3}$/.test(g) || /^\d{5}$/.test(g);
            return (
              <View
                key={i}
                className={`rounded-md px-2 py-0.5 ${
                  sep
                    ? dark ? "bg-amber-900/30" : "bg-amber-100"
                    : valid
                    ? dark ? "bg-gray-800" : "bg-gray-100"
                    : dark ? "bg-red-900/30" : "bg-red-100"
                }`}
              >
                <Text
                  className={`font-mono text-xs ${
                    sep
                      ? dark ? "text-amber-400" : "text-amber-700"
                      : valid
                      ? dark ? "text-gray-300" : "text-gray-700"
                      : dark ? "text-red-400" : "text-red-600"
                  }`}
                >
                  {g}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
