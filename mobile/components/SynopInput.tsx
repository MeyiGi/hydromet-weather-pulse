import { View, Text, TextInput, useColorScheme } from "react-native";

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export function SynopInput({ value, onChange, disabled }: Props) {
  const dark = useColorScheme() === "dark";

  return (
    <View className="gap-3">
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.slice(0, 24))}
        editable={!disabled}
        maxLength={24}
        autoCapitalize="characters"
        autoCorrect={false}
        spellCheck={false}
        placeholder={"·".repeat(24)}
        placeholderTextColor={dark ? "#4B5563" : "#D1D5DB"}
        className={`rounded-xl border px-4 py-3 font-mono text-base tracking-widest ${
          dark
            ? "border-gray-700 bg-gray-800 text-white"
            : "border-gray-200 bg-gray-50 text-gray-900"
        } ${disabled ? "opacity-50" : ""}`}
      />
      {/* Character slots visualization */}
      <View className="flex-row flex-wrap gap-1">
        {Array.from({ length: 24 }).map((_, i) => {
          const char = value[i] ?? null;
          const filled = char !== null;
          return (
            <View
              key={i}
              className={`h-8 w-7 items-center justify-center rounded-md border ${
                filled
                  ? dark ? "border-gray-500 bg-gray-800" : "border-gray-400 bg-gray-100"
                  : dark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
              }`}
            >
              <Text
                className={`font-mono text-sm ${
                  filled
                    ? dark ? "text-white" : "text-gray-900"
                    : dark ? "text-gray-700" : "text-gray-300"
                }`}
              >
                {char ?? "·"}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
