import React, { useState, useRef, useEffect } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
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
  center: { lat: 43.661036, lng: -79.391277 },
  zoom: 17,
  disableDefaultUI: true,
  heading: 25,
  tilt: 25,
};

export default function App() {
  return (
    <Wrapper apiKey={process.env.NEXT_PUBLIC_MAP_API_KEY}>
      <MyMap />
    </Wrapper>
  );
}

function MyMap() {
  const [_map, setMap] = useState();
  const ref = useRef();

  useEffect(() => {
    const instance = new window.google.maps.Map(ref.current, mapOptions);
    setMap(instance);
    createOverlay(instance);
  }, []);

  return <div ref={ref} id="map" />;
}

function createOverlay(map) {
  const overlay = new google.maps.WebGLOverlayView();
  const loader = new GLTFLoader();
  let renderer, scene, camera;

  overlay.onAdd = () => {
    scene = new Scene();
    camera = new PerspectiveCamera();
    const light = new AmbientLight(0xffffff, 0.9);
    scene.add(light);

    // This work is based on "Low Poly Scooter" (https://sketchfab.com/3d-models/low-poly-scooter-cf0b53fddb5c469b9d0259104151f72d) by Qbo2Qbo (https://sketchfab.com/Qbo2Qbo) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
    loader.loadAsync("/low_poly_scooter/scene.gltf").then((object) => {
      const group = object.scene;
      group.scale.setScalar(25);
      group.rotation.set(Math.PI / 2, 0, 0);
      group.position.setZ(-120);
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
          mapOptions.tilt += 0.5;
        } else if (mapOptions.zoom < 20) {
          mapOptions.zoom += 0.05;
        } else if (mapOptions.heading < 125) {
          mapOptions.heading += 0.5;
        } else {
          renderer.setAnimationLoop(null);
        }
      });
    };
  };

  overlay.onDraw = ({ transformer }) => {
    const matrix = transformer.fromLatLngAltitude({
      lat: mapOptions.center.lat,
      lng: mapOptions.center.lng,
      altitude: 120,
    });
    camera.projectionMatrix = new Matrix4().fromArray(matrix);

    overlay.requestRedraw();
    renderer.render(scene, camera);
    renderer.resetState();
  };

  overlay.setMap(map);
}
