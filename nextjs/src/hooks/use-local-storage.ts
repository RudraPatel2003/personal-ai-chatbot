import { useEffect, useState } from "react";

type UseLocalStorageHook = [string, (value: string) => void];

export default function useLocalStorage(
  key: string,
  initialValue: string,
): UseLocalStorageHook {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const item = localStorage.getItem(key);
    if (item) {
      setValue(item);
    }
  }, [key]);

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
}
