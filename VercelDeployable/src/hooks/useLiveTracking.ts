import { useState, useRef, useCallback, useEffect } from 'react';

interface Location {
    lat: number;
    lng: number;
    timestamp?: string;
    speed?: number;
    heading?: number;
}

type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'disconnected';

export const useLiveTracking = (tripId: string | number) => {
    const [location, setLocation] = useState<Location | null>(null);
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [errorCount, setErrorCount] = useState(0);
    const eventSourceRef = useRef<EventSource | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (!tripId) return;

        // Cleanup existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        setStatus('connecting');

        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        // Ensure no double slash if baseUrl ends with /
        const safeBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const url = `${safeBaseUrl}/trips/${tripId}/tracking-stream`;

        try {
            const eventSource = new EventSource(url);
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                setStatus('connected');
                setErrorCount(0);
            };

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // Assuming data structure matches Location or has lat/lng
                    if (data.lat && data.lng) {
                        setLocation({
                            lat: data.lat,
                            lng: data.lng,
                            timestamp: data.timestamp,
                            speed: data.speed,
                            heading: data.heading
                        });
                    }
                } catch (err) {
                    console.error('Error parsing SSE data:', err);
                }
            };

            eventSource.onerror = (err) => {
                console.error('SSE Error:', err);
                eventSource.close();
                setStatus('error');

                // Retry logic
                if (errorCount < 3) {
                    const timeout = setTimeout(() => {
                        setErrorCount(prev => prev + 1);
                        connect();
                    }, 3000 * (errorCount + 1)); // Exponential backoffish: 3s, 6s, 9s
                    retryTimeoutRef.current = timeout;
                } else {
                    // Manual retry needed
                    setStatus('error'); // Remains error
                }
            };

        } catch (err) {
            console.error('Failed to create EventSource:', err);
            setStatus('error');
        }
    }, [tripId, errorCount]);

    const disconnect = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
        setStatus('disconnected');
    }, []);

    // Initial connection handled by component calling connect()
    // or should we connect automatically on mount?
    // Requirement says: "Only establish the SSE connection when the component is **mounted and visible**."
    // We'll let the component decide when to call connect/disconnect, or handle it here if we assume this hook is only used there.
    // Better to provide connect/disconnect to the consumer.

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        location,
        status,
        errorCount,
        connect,
        disconnect
    };
};
