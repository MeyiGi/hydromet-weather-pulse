import { useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, useColorScheme } from "react-native";

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  onFocus?: () => void;
}

export function SynopInput({ value, onChange, disabled, onFocus }: Props) {
  const dark = useColorScheme() === "dark";
  const inputRef = useRef<TextInput>(null);

  const focus = () => {
    if (!disabled) inputRef.current?.focus();
  };

  return (
    <TouchableOpacity onPress={focus} activeOpacity={1}>
      {/* Hidden real input */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^A-Za-z0-9]/g, "").slice(0, 24).toUpperCase())}
        onFocus={onFocus}
        editable={!disabled}
        maxLength={24}
        autoCapitalize="characters"
        autoCorrect={false}
        spellCheck={false}
        style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
        caretHidden
      />

      {/* 6 groups × 4 slots */}
      <View className={`flex-row flex-wrap justify-center gap-1.5 ${disabled ? "opacity-40" : ""}`}>
        {Array.from({ length: 6 }).map((_, gi) => (
          <View key={gi} className="flex-row gap-1">
            {Array.from({ length: 4 }).map((_, si) => {
              const idx = gi * 4 + si;
              const char = value[idx] ?? null;
              const isCursor = idx === value.length && !disabled;
              return (
                <View
                  key={si}
                  className={[
                    "h-11 w-8 items-center justify-center rounded-lg border",
                    isCursor
                      ? "border-blue-500 bg-blue-500/10"
                      : char
                        ? dark ? "border-gray-500 bg-gray-800" : "border-gray-400 bg-gray-100"
                        : dark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white",
                  ].join(" ")}
                >
                  <Text
                    className={[
                      "font-mono text-sm font-medium",
                      char
                        ? dark ? "text-white" : "text-gray-900"
                        : dark ? "text-gray-700" : "text-gray-300",
                    ].join(" ")}
                  >
                    {char ?? "·"}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}
