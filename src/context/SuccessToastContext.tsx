import React, { useState, useCallback, useContext, createContext } from 'react';
import type { ReactNode } from 'react';

type SuccessContextType = {
  successMessage: string | null;
  showSuccessToast: (message: string) => void;
  cleatSuccess: () => void;
};

// Provide a default empty value with correct shape
export const SuccessContext = createContext<SuccessContextType>({
  successMessage: null,
  showSuccessToast: () => {},
  cleatSuccess: () => {},
});

export const useSuccess = () => useContext(SuccessContext);

type Props = {
  children: ReactNode;
};

export const SuccessProvider = ({ children }: Props) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccessToast = useCallback((message: string) => {
    setSuccessMessage(message);
  }, []);

  const cleatSuccess = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  return (
    <SuccessContext.Provider value={{ showSuccessToast, cleatSuccess, successMessage }}>
      {children}
    </SuccessContext.Provider>
  );
};
