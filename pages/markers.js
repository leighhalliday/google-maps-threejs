import React, { useState, useCallback, useEffect } from "react";
import {
  GoogleMapsProvider,
  useGoogleMap,
} from "@ubilabs/google-maps-react-hooks";

const mapOptions = {
  mapId: process.env.NEXT_PUBLIC_MAP_ID,
  center: { lat: 43.66293, lng: -79.39314 },
  zoom: 17,
  disableDefaultUI: true,
};

export default function App() {
  const [mapContainer, setMapContainer] = useState(null);
  const mapRef = useCallback((node) => {
    node && setMapContainer(node);
  }, []);
  const [mapReady, setMapReady] = useState(false);

  return (
    <GoogleMapsProvider
      mapContainer={mapContainer}
      mapOptions={mapOptions}
      googleMapsAPIKey={process.env.NEXT_PUBLIC_MAP_API_KEY}
      onLoadMap={() => setMapReady(true)}
      libraries={["marker"]}
    >
      <div ref={mapRef} style={{ height: "100vh" }} />
      {mapReady && <Marker />}
    </GoogleMapsProvider>
  );
}

function Marker() {
  const map = useGoogleMap();

  useEffect(() => {
    const priceTag = document.createElement("div");
    priceTag.className = "price-tag";
    priceTag.textContent = "$2.5M";

    const markerView = new google.maps.Marker.AdvancedMarkerView({
      map,
      position: { lat: 37.42, lng: -122.1 },
      content: priceTag,
    });

    return () => {
      // markerView.setMap(null);
    };
  }, [map]);
}
