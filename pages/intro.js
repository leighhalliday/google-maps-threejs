import React, { useState, useCallback, useEffect } from "react";
import {
  GoogleMapsProvider,
  useGoogleMap,
} from "@ubilabs/google-maps-react-hooks";
import {
  PerspectiveCamera,
  Scene,
  AmbientLight,
  WebGLRenderer,
  Matrix4,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const mapOptions = {
  mapId: process.env.NEXT_PUBLIC_MAP_ID,
  center: { lat: 43.66293, lng: -79.39314 },
  zoom: 17,
  disableDefaultUI: true,
  heading: 25,
  tilt: 25,
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
    >
      <div ref={mapRef} style={{ height: "100vh" }} />
      {mapReady && <Overlay />}
    </GoogleMapsProvider>
  );
}

function Overlay() {
  const map = useGoogleMap();

  useEffect(() => {
    const overlay = new google.maps.WebGLOverlayView();
    const loader = new GLTFLoader();
    let renderer, scene, camera;

    overlay.onAdd = () => {
      scene = new Scene();
      camera = new PerspectiveCamera();
      const light = new AmbientLight(0xffffff, 0.8);
      scene.add(light);

      loader.loadAsync("/low_poly_scooter/scene.gltf").then((object) => {
        const group = object.scene;
        group.scale.setScalar(50);
        group.rotation.set(Math.PI / 2, 0, 0);
        group.position.setZ(-100);
        scene.add(group);
      });
    };

    overlay.onContextRestored = ({ gl }) => {
      renderer = new WebGLRenderer({
        canvas: gl.canvas,
        context: gl,
        ...gl.getContextAttributes(),
      });
      renderer.autoClear = false;

      loader.manager.onLoad = () => {
        renderer.setAnimationLoop(() => {
          map.moveCamera({
            tilt: mapOptions.tilt,
            heading: mapOptions.heading,
            zoom: mapOptions.zoom,
          });

          if (mapOptions.tilt < 60) {
            mapOptions.tilt += 1;
          } else if (mapOptions.zoom < 19) {
            mapOptions.zoom += 0.05;
          } else if (mapOptions.heading < 75) {
            mapOptions.heading += 0.5;
          } else {
            renderer.setAnimationLoop(null);
          }
        });
      };
    };

    overlay.onDraw = ({ transformer }) => {
      overlay.requestRedraw();

      const matrix = transformer.fromLatLngAltitude({
        lat: mapOptions.center.lat,
        lng: mapOptions.center.lng,
        altitude: 120,
      });
      camera.projectionMatrix = new Matrix4().fromArray(matrix);

      renderer.render(scene, camera);
      renderer.resetState();
    };

    overlay.setMap(map);
  }, [map]);
}
