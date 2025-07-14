'use client';

import { useStreamStatus } from '@/context/stream-status-provider';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useEffect } from 'react';

export function StreamStatusIndicator() {
  const { status, setStatus } = useStreamStatus();

  // Temporary simulation of stream events
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'idle') {
      timer = setTimeout(() => setStatus('streaming'), 3000); // Switch to streaming after 3s
    } else if (status === 'streaming') {
      timer = setTimeout(() => setStatus('idle'), 5000); // Switch back to idle after 5s
    }
    return () => clearTimeout(timer);
  }, [status, setStatus]);

  const statusConfig = {
    disabled: {
      color: 'bg-red-500',
      tooltip: 'Streaming is disabled.',
    },
    idle: {
      color: 'bg-orange-500 animate-pulse',
      tooltip: 'Waiting for data stream...',
    },
    streaming: {
      color: 'bg-green-500',
      tooltip: 'Streaming data in progress...',
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center">
            <span
              className={cn(
                'h-3 w-3 rounded-full transition-colors',
                currentStatus.color
              )}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{currentStatus.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
