"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type Lang = "en" | "ru" | "kg";

const T = {
  en: {
    appSubtitle: "Kyrgyzstan weather stations",
    submissionWindow: "Submission window",
    closesIn: "closes in",
    opensIn: "opens in",
    open: "open",
    closed: "closed",
    nextWindow: "next",
    stations: "Stations",
    lastSeen: "last seen",
    overdue: "overdue",
    onTime: "on time",
    pending: "pending",
    stationNotFound: "Station not found.",
    backToStations: "Back to stations",
    noStationsYet: "No stations yet.",
    couldNotLoad: "Could not load stations",
    stationAccess: "Station access",
    passwordFor: "Password for",
    password: "Password",
    wrongPassword: "Wrong password",
    unlock: "Unlock",
    onlyOperator: "Only the station operator can submit readings.",
    unlockStation: "Unlock station",
    submitReading: "Submit reading",
    enterSynop: "Enter SYNOP groups separated by spaces (min 8 groups, e.g. 38476 22999 00801 …).",
    windowClosed: "Window is closed",
    windowClosedDesc: "Submission is not available right now.",
    sending: "Sending…",
    submit: "Submit",
    lockStation: "Lock station",
    dataSubmitted: "Data received",
    submissionFailed: "Submission failed",
    submitAnother: "Submit another",
    notifications: "Notifications",
    nothingHereYet: "Nothing here yet.",
    unread: "unread",
    toggleTheme: "Toggle theme",
    searchPlaceholder: "Search stations…",
    filterAll: "All",
  },
  ru: {
    appSubtitle: "Метеостанции Кыргызстана",
    submissionWindow: "Окно подачи",
    closesIn: "закрывается через",
    opensIn: "открывается через",
    open: "открыто",
    closed: "закрыто",
    nextWindow: "следующее",
    stations: "Станции",
    lastSeen: "последний раз",
    overdue: "просрочено",
    onTime: "в срок",
    pending: "ожидается",
    stationNotFound: "Станция не найдена.",
    backToStations: "К станциям",
    noStationsYet: "Станций пока нет.",
    couldNotLoad: "Не удалось загрузить станции",
    stationAccess: "Доступ к станции",
    passwordFor: "Пароль для",
    password: "Пароль",
    wrongPassword: "Неверный пароль",
    unlock: "Открыть",
    onlyOperator: "Только оператор станции может отправить данные.",
    unlockStation: "Разблокировать",
    submitReading: "Отправить данные",
    enterSynop: "Введите группы SYNOP через пробелы (мин. 8 групп, напр. 38476 22999 00801 …).",
    windowClosed: "Окно закрыто",
    windowClosedDesc: "Подача данных сейчас недоступна.",
    sending: "Отправка…",
    submit: "Отправить",
    lockStation: "Заблокировать",
    dataSubmitted: "Данные получены",
    submissionFailed: "Ошибка отправки",
    submitAnother: "Отправить ещё",
    notifications: "Уведомления",
    nothingHereYet: "Пока пусто.",
    unread: "непрочитанных",
    toggleTheme: "Тема",
    searchPlaceholder: "Поиск станций…",
    filterAll: "Все",
  },
  kg: {
    appSubtitle: "Кыргызстан аба ырайы станциялары",
    submissionWindow: "Берүү терезеси",
    closesIn: "жабылат",
    opensIn: "ачылат",
    open: "ачык",
    closed: "жабык",
    nextWindow: "кийинки",
    stations: "Станциялар",
    lastSeen: "акыркы жолу",
    overdue: "мөөнөтү өттү",
    onTime: "убагында",
    pending: "күтүлүүдө",
    stationNotFound: "Станция табылган жок.",
    backToStations: "Станцияларга",
    noStationsYet: "Станциялар жок.",
    couldNotLoad: "Станцияларды жүктөө мүмкүн болгон жок",
    stationAccess: "Станцияга кирүү",
    passwordFor: "Сырсөз:",
    password: "Сырсөз",
    wrongPassword: "Туура эмес сырсөз",
    unlock: "Ачуу",
    onlyOperator: "Маалыматты оператор гана жөнөтөт.",
    unlockStation: "Ачуу",
    submitReading: "Маалымат жөнөтүү",
    enterSynop: "SYNOP топторун боштук менен киргизиңиз (мин. 8 топ, мис. 38476 22999 00801 …).",
    windowClosed: "Терезе жабык",
    windowClosedDesc: "Маалымат берүү азыр жеткиликтүү эмес.",
    sending: "Жөнөтүлүүдө…",
    submit: "Жөнөтүү",
    lockStation: "Кулпулоо",
    dataSubmitted: "Маалымат кабыл алынды",
    submissionFailed: "Жөнөтүү ошолду",
    submitAnother: "Дагы жөнөтүү",
    notifications: "Билдирүүлөр",
    nothingHereYet: "Азырынча эч нерсе жок.",
    unread: "окулган жок",
    toggleTheme: "Тема",
    searchPlaceholder: "Станцияларды издөө…",
    filterAll: "Баары",
  },
} as const;

type Keys = keyof typeof T.en;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Keys) => string;
}

const LangContext = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("synopnet-lang") as Lang | null;
    if (saved && saved in T) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("synopnet-lang", l);
  };

  const t = (key: Keys): string => T[lang][key] ?? T.en[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
