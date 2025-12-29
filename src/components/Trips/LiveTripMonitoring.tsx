import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useLiveTracking } from '../../hooks/useLiveTracking';
import { Truck, RefreshCw, MapPinOff } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';

// Custom Truck Icon
const truckIconMarkup = renderToStaticMarkup(
    <div className="relative flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-xl">
        <Truck className="text-white w-5 h-5" />
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20"></span>
    </div>
);

const truckIcon = L.divIcon({
    html: truckIconMarkup,
    className: 'bg-transparent',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20]
});

// Map Updater Component to center map smoothly
const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        if (center[0] !== 0 && center[1] !== 0) {
            map.flyTo(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

interface LiveTripMonitoringProps {
    tripId: string | number;
    initialLat: number;
    initialLng: number;
}

const LiveTripMonitoring: React.FC<LiveTripMonitoringProps> = ({ tripId, initialLat, initialLng }) => {
    const { ref, inView } = useInView({
        threshold: 0.1, // Trigger when 10% visible
        triggerOnce: false
    });

    // Manage tab visibility
    const [isPageVisible, setIsPageVisible] = useState(!document.hidden);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsPageVisible(!document.hidden);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const { location, status, errorCount, connect, disconnect } = useLiveTracking(tripId);

    // Connect/Disconnect based on visibility
    useEffect(() => {
        if (inView && isPageVisible) {
            connect();
        } else {
            disconnect();
        }
    }, [inView, isPageVisible, connect, disconnect]);

    const currentLat = location?.lat || initialLat;
    const currentLng = location?.lng || initialLng;
    const position: [number, number] = [currentLat, currentLng];

    // Basic validity check
    const hasValidCoords = (currentLat !== 0 || currentLng !== 0) && !isNaN(currentLat) && !isNaN(currentLng);

    if (!hasValidCoords) {
        return (
            <div ref={ref} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-slate-700 text-center">
                <MapPinOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-xs font-bold uppercase">Location Signal Unavailable</p>
                <p className="text-gray-400 text-[10px] mt-1">Waiting for initial coordinates...</p>
            </div>
        );
    }

    return (
        <div ref={ref} className="space-y-4">
            {/* Header Section */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        {status === 'connected' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'connected' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                    </span>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">
                        {status === 'connected' ? 'Live Telemetry' : (status === 'connecting' ? 'Connecting...' : 'Offline')}
                    </h3>
                </div>

                {status === 'error' && (
                    <button onClick={connect} className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-lg px-2 py-1 transition-colors">
                        <RefreshCw size={12} /> Retry Connection ({errorCount})
                    </button>
                )}
            </div>

            {/* Map Container */}
            <div className="h-[400px] w-full rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm relative z-0">
                <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="h-full w-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position} icon={truckIcon}>
                        <Popup className="custom-popup">
                            <div className="text-center">
                                <p className="font-bold text-xs uppercase text-gray-500 mb-1">Current Position</p>
                                <p className="font-black text-sm">{currentLat.toFixed(4)}, {currentLng.toFixed(4)}</p>
                                {location?.speed !== undefined && <p className="text-xs mt-1 text-blue-600 font-bold">{location.speed} km/h</p>}
                            </div>
                        </Popup>
                    </Marker>
                    <MapUpdater center={position} />
                </MapContainer>

                {/* Status Overlay */}
                {status === 'connecting' && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] z-[1000] flex items-center justify-center">
                        <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Acquiring Signal...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Last Update Info */}
            <div className="flex justify-between items-center px-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Status: <span className={status === 'connected' ? 'text-green-500' : 'text-orange-500'}>{status}</span>
                </p>
                {location?.timestamp && (
                    <p className="text-[10px] font-mono text-gray-400">
                        Updated: {new Date(location.timestamp).toLocaleTimeString()}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LiveTripMonitoring;
