import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface SessionState {
  [sessionId: string]: 'idle' | 'in-progress' | 'ended';
}

export function useSessionManager() {
  const [sessions, setSessions] = useState<SessionState>({});

  const startSession = useCallback(async (sessionId: string, studentName: string) => {
    try {
      await api.patch(`/tutor/start-session/${sessionId}`);
      setSessions(prev => ({ ...prev, [sessionId]: 'in-progress' }));
      toast.success(`Session started with ${studentName}`, {
        description: 'Timer is running. Click "End Session" when done.',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to start session');
    }
  }, []);

  const endSession = useCallback(async (sessionId: string, studentName: string) => {
    try {
      await api.patch(`/tutor/end-session/${sessionId}`);
      setSessions(prev => ({ ...prev, [sessionId]: 'ended' }));
      toast.success(`Session ended with ${studentName}`, {
        description: 'Your attendance claim has been submitted for approval.',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to end session');
    }
  }, []);

  const getSessionState = useCallback((sessionId: string) => {
    return sessions[sessionId] || 'idle';
  }, [sessions]);

  return { startSession, endSession, getSessionState };
}
