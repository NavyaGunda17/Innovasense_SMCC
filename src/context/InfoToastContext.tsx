import React, { useState, useCallback, useContext, createContext } from 'react';
import type { ReactNode } from 'react';

type InfoContextType = {
  infoMessage: string | null;
  showInfoToast: (message: string) => void;
  clearInfo: () => void;
};

// Provide a default empty value with correct shape
export const InfoContext = createContext<InfoContextType>({
  infoMessage: null,
  showInfoToast: () => {},
  clearInfo: () => {},
});

export const useInfo = () => useContext(InfoContext);

type Props = {
  children: ReactNode;
};

export const InfoProvider = ({ children }: Props) => {
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const showInfoToast = useCallback((message: string) => {
    setInfoMessage(message);
  }, []);

  const clearInfo = useCallback(() => {
    setInfoMessage(null);
  }, []);

  return (
    <InfoContext.Provider value={{ showInfoToast, clearInfo, infoMessage }}>
      {children}
    </InfoContext.Provider>
  );
};
