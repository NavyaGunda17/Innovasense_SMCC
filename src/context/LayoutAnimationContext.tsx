import React, { createContext, useContext, useState } from 'react';

type LayoutAnimationContextType = {
  isLoggingOut: boolean;
  triggerLogout: (callback: () => void) => void;
};

const LayoutAnimationContext = createContext<LayoutAnimationContextType>({
  isLoggingOut: false,
  triggerLogout: () => {},
});

export const useLayoutAnimation = () => useContext(LayoutAnimationContext);

export const LayoutAnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const triggerLogout = (callback: () => void) => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setIsLoggingOut(false);
    //   callback(); // navigate to login
    }, 800); // match animation duration
  };

  return (
    <LayoutAnimationContext.Provider value={{ isLoggingOut, triggerLogout }}>
      {children}
    </LayoutAnimationContext.Provider>
  );
};
