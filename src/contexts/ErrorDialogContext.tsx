"use client";

import React, { createContext, useContext, useState } from "react";

interface ErrorDialogState {
  isOpen: boolean;
  message: string;
}

interface ErrorDialogContextType {
  showError: (message: string) => void;
  hideError: () => void;
  errorState: ErrorDialogState;
}

const ErrorDialogContext = createContext<ErrorDialogContextType | undefined>(undefined);

export function ErrorDialogProvider({ children }: { children: React.ReactNode }) {
  const [errorState, setErrorState] = useState<ErrorDialogState>({
    isOpen: false,
    message: "",
  });

  const showError = (message: string) => {
    setErrorState({
      isOpen: true,
      message,
    });
  };

  const hideError = () => {
    setErrorState({
      isOpen: false,
      message: "",
    });
  };

  return (
    <ErrorDialogContext.Provider value={{ showError, hideError, errorState }}>
      {children}
    </ErrorDialogContext.Provider>
  );
}

export function useErrorDialog() {
  const context = useContext(ErrorDialogContext);
  if (context === undefined) {
    throw new Error("useErrorDialog must be used within an ErrorDialogProvider");
  }
  return context;
}