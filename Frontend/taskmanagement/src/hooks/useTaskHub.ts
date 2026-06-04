import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const HUB_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:5079/api').replace(
  /\/api\/?$/,
  '',
);

export function useTaskHub(
  onRefresh: () => void,
  options?: { shouldSkip?: () => boolean },
) {
  const callbackRef = useRef(onRefresh);
  callbackRef.current = onRefresh;

  const skipRef = useRef(options?.shouldSkip);
  skipRef.current = options?.shouldSkip;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_BASE}/hubs/tasks`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    const refresh = () => {
      if (skipRef.current?.()) return;
      callbackRef.current();
    };

    connection.on('TaskCreated', refresh);
    connection.on('TaskUpdated', refresh);
    connection.on('TaskStatusChanged', refresh);
    connection.on('TaskDeleted', refresh);

    void connection.start().catch(() => {});

    return () => {
      void connection.stop();
    };
  }, []);
}
