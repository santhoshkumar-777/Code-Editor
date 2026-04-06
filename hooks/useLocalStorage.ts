
import { useState, useEffect } from 'react';

// FIX: Updated the hook's return type signature to correctly support a function updater for the setter.
function useLocalStorage<T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // FIX: Updated the `value` parameter's type to match the new signature, allowing it to be a value or a function.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key) {
            try {
                setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
            } catch (error) {
                console.error(error);
            }
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
