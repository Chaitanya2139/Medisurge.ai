import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const LocationTest = () => {
  const [locationStatus, setLocationStatus] = useState('checking');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState(null);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        setLocationStatus('not-supported');
        setError('Geolocation is not supported by your browser');
        return;
      }

      // Check permission API if available
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          setPermissionState(result.state);
          
          result.addEventListener('change', () => {
            setPermissionState(result.state);
          });
        } catch (e) {
          console.log('Permission API not available:', e);
        }
      }

      // Request location
      requestLocation();
    } catch (err) {
      setError(err.message);
      setLocationStatus('error');
    }
  };

  const requestLocation = () => {
    setLocationStatus('requesting');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toLocaleString()
        });
        setLocationStatus('granted');
        setError(null);
      },
      (err) => {
        setLocationStatus('denied');
        switch(err.code) {
          case err.PERMISSION_DENIED:
            setError('Location access denied by user');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information unavailable');
            break;
          case err.TIMEOUT:
            setError('Location request timed out');
            break;
          default:
            setError('An unknown error occurred');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="min-h-screen bg-deep-void flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-gray-900 border border-white/10 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <MapPin className="text-neon-teal" />
          Location Permission Test
        </h1>

        {/* Status Indicator */}
        <div className="mb-8 p-6 bg-black/30 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            {locationStatus === 'granted' && <CheckCircle className="text-green-500" size={32} />}
            {locationStatus === 'denied' && <XCircle className="text-red-500" size={32} />}
            {locationStatus === 'requesting' && <AlertCircle className="text-yellow-500 animate-pulse" size={32} />}
            {locationStatus === 'checking' && <AlertCircle className="text-blue-500 animate-spin" size={32} />}
            
            <div>
              <h2 className="text-xl font-bold text-white">
                {locationStatus === 'granted' && 'Location Access Granted ✓'}
                {locationStatus === 'denied' && 'Location Access Denied'}
                {locationStatus === 'requesting' && 'Requesting Location...'}
                {locationStatus === 'checking' && 'Checking Permissions...'}
                {locationStatus === 'not-supported' && 'Not Supported'}
              </h2>
              {permissionState && (
                <p className="text-sm text-gray-400 mt-1">
                  Permission State: <span className="text-neon-teal">{permissionState}</span>
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Location Data */}
        {location && (
          <div className="mb-8 p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
            <h3 className="text-lg font-bold text-green-400 mb-4">Location Data</h3>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Latitude:</span>
                <span className="text-white">{location.latitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Longitude:</span>
                <span className="text-white">{location.longitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Accuracy:</span>
                <span className="text-white">{location.accuracy.toFixed(2)} meters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Timestamp:</span>
                <span className="text-white">{location.timestamp}</span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-blue-400 mb-3">How to Enable Location:</h3>
          <ol className="space-y-2 text-sm text-gray-300">
            <li>1. Look for the location icon (🔒) in your browser's address bar</li>
            <li>2. Click on it and select "Allow" for location access</li>
            <li>3. If using HTTPS, you may need to reload the page</li>
            <li>4. Check browser settings → Privacy → Location permissions</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={requestLocation}
            className="flex-1 py-3 bg-neon-teal text-black font-bold rounded-lg hover:bg-white transition-colors"
          >
            Request Location Again
          </button>
          <button
            onClick={checkLocationPermission}
            className="flex-1 py-3 border border-white/20 text-white font-bold rounded-lg hover:bg-white hover:text-black transition-colors"
          >
            Recheck Permissions
          </button>
        </div>

        {/* Browser Info */}
        <div className="mt-6 p-4 bg-black/30 rounded-lg text-xs text-gray-500 font-mono">
          <div>Browser: {navigator.userAgent}</div>
          <div className="mt-2">Geolocation Support: {navigator.geolocation ? '✓ Yes' : '✗ No'}</div>
          <div>HTTPS: {window.location.protocol === 'https:' ? '✓ Yes' : '✗ No (Required for production)'}</div>
        </div>
      </div>
    </div>
  );
};

export default LocationTest;
