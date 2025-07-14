import { GoogleMap, LoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const Map = () => {
  const navigate = useNavigate();
  const [center, setCenter] = useState({ lat: 30.0444, lng: 31.2357 });
  const [location, setLocation] = useState(center);
  const mapRef = useRef(null);
  const placeRef = useRef(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCenter(newLoc);
      setLocation(newLoc);
    });
  }, []);

  const handleConfirm = () => {
    const place = placeRef.current.getPlaces()?.[0];
    const payload = {
      lat: location.lat,
      lng: location.lng,
      address: place?.formatted_address || '',
      name: place?.name || '',
      vicinity: place?.vicinity || '',
      googleAddressId: place?.id || '',
    };

    localStorage.setItem('shippingLocation', JSON.stringify(payload));
    navigate('/shipping');
  };

  return (
    <div className="h-screen w-full">
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API} libraries={['places']}>
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerClassName="w-full h-full"
          onLoad={(map) => (mapRef.current = map)}
          onIdle={() => {
            const c = mapRef.current.getCenter();
            setLocation({ lat: c.lat(), lng: c.lng() });
          }}
        >
          <StandaloneSearchBox
            onLoad={(ref) => (placeRef.current = ref)}
            onPlacesChanged={() => {
              const place = placeRef.current.getPlaces()?.[0].geometry.location;
              setCenter({ lat: place.lat(), lng: place.lng() });
              setLocation({ lat: place.lat(), lng: place.lng() });
            }}
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white p-2 rounded shadow z-10 flex gap-2">
              <input type="text" placeholder="Search" className="border p-2 rounded w-64" />
              <button onClick={handleConfirm} className="bg-yellow-400 px-4 py-2 rounded hover:bg-yellow-500">
                Confirm
              </button>
            </div>
          </StandaloneSearchBox>
          <Marker position={location} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default Map;
