import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { useLang, type Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "kg", label: "КГ" },
];

export function LangPicker() {
  const { lang, setLang } = useLang();
  const dark = useColorScheme() === "dark";

  return (
    <View className="flex-row gap-1">
      {LANGS.map(({ code, label }) => (
        <TouchableOpacity
          key={code}
          onPress={() => setLang(code)}
          className={`rounded-lg px-2.5 py-1.5 ${
            lang === code
              ? dark ? "bg-white" : "bg-gray-900"
              : "bg-transparent"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              lang === code
                ? dark ? "text-gray-900" : "text-white"
                : dark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
