import React, { useState, useCallback, useContext, createContext } from 'react';
import type { ReactNode } from 'react';

type ErrorContextType = {
  errorMessage: string | null;
  showErrorToast: (message: string) => void;
  clearError: () => void;
};

// Provide a default empty value with correct shape
export const ErrorContext = createContext<ErrorContextType>({
  errorMessage: null,
  showErrorToast: () => {},
  clearError: () => {},
});

export const useError = () => useContext(ErrorContext);

type Props = {
  children: ReactNode;
};

export const ErrorProvider = ({ children }: Props) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showErrorToast = useCallback((message: string) => {
    setErrorMessage(message);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return (
    <ErrorContext.Provider value={{ showErrorToast, clearError, errorMessage }}>
      {children}
    </ErrorContext.Provider>
  );
};
