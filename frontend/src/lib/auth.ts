const DEV_PASSWORD = "operator";
const key = (id: string) => `station_auth:${id}`;

export const unlockStation = (id: string, password: string): boolean => {
  if (password !== DEV_PASSWORD) return false;
  sessionStorage.setItem(key(id), "1");
  return true;
};

export const isUnlocked = (id: string) =>
  typeof window !== "undefined" && sessionStorage.getItem(key(id)) === "1";

export const lock = (id: string) => sessionStorage.removeItem(key(id));
