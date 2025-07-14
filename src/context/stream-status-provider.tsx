'use client';

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

export type StreamStatus = 'idle' | 'streaming' | 'disabled';

interface StreamStatusContextType {
  status: StreamStatus;
  setStatus: Dispatch<SetStateAction<StreamStatus>>;
}

const StreamStatusContext = createContext<StreamStatusContextType | undefined>(undefined);

export const StreamStatusProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<StreamStatus>('idle');

  return (
    <StreamStatusContext.Provider value={{ status, setStatus }}>
      {children}
    </StreamStatusContext.Provider>
  );
};

export const useStreamStatus = () => {
  const context = useContext(StreamStatusContext);
  if (context === undefined) {
    throw new Error('useStreamStatus must be used within a StreamStatusProvider');
  }
  return context;
};
