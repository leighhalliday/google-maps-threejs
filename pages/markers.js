import { Wrapper } from "@googlemaps/react-wrapper";
import { useRef, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

export default function App() {
  return (
    <Wrapper
      apiKey={process.env.NEXT_PUBLIC_MAP_API_KEY}
      version="beta"
      libraries={["marker"]}
    >
      <MyMap />
    </Wrapper>
  );
}

const mapOptions = {
  mapId: process.env.NEXT_PUBLIC_MAP_ID,
  center: { lat: 43.66293, lng: -79.39314 },
  zoom: 17,
  disableDefaultUI: true,
};

function MyMap() {
  const [map, setMap] = useState();
  const ref = useRef();

  useEffect(() => {
    setMap(new window.google.maps.Map(ref.current, mapOptions));
  }, []);

  return (
    <>
      <div ref={ref} id="map" />
      {map && <Weather map={map} />}
    </>
  );
}

function Weather({ map }) {
  const [editing, setEditing] = useState();
  const [highlight, setHighlight] = useState();
  const [data, setData] = useState({
    A: {
      name: "Toronto",
      position: { lat: 43.66293, lng: -79.39314 },
      climate: "Sunny",
      high: 20,
      low: 15,
    },
    B: {
      name: "Mississauga",
      position: { lat: 43.66493, lng: -79.39314 },
      climate: "Sunny",
      high: 20,
      low: 15,
    },
    C: {
      name: "Brampton",
      position: { lat: 43.66493, lng: -79.39114 },
      climate: "Sunny",
      high: 20,
      low: 15,
    },
  });

  return (
    <>
      {editing && (
        <Editing
          data={data[editing]}
          update={(newData) =>
            setData((existing) => ({ ...existing, [editing]: newData }))
          }
          close={() => setEditing(null)}
        />
      )}
      {Object.entries(data).map(([key, value]) => (
        <Marker
          key={key}
          map={map}
          position={value.position}
          onClick={(e) => {
            e.domEvent.preventDefault();
            setEditing(key);
            console.log("click marker", key, e.domEvent.target);
          }}
        >
          <div
            className={`price-tag ${highlight === key ? "highlight" : ""}`}
            onMouseEnter={(e) => {
              setHighlight(key);
            }}
            onMouseLeave={(e) => {
              setHighlight(null);
            }}
          >
            <h2>{value.climate}</h2>
            <div>High: {value.high}c</div>
            <div>Low: {value.low}c</div>
          </div>
        </Marker>
      ))}
    </>
  );
}

function Editing({ data, update, close }) {
  return (
    <div className="editing">
      <h2>Editing {data.name}</h2>
      <input
        type="number"
        value={data.high}
        onChange={(e) => update({ ...data, high: e.target.value })}
      />
      <input
        type="number"
        value={data.low}
        onChange={(e) => update({ ...data, low: e.target.value })}
      />
      <button type="button" onClick={() => close()}>
        Save
      </button>
    </div>
  );
}

function Marker({ map, children, onClick, position }) {
  const rootRef = useRef();
  const markerRef = useRef();

  useEffect(() => {
    if (!markerRef.current) {
      const container = document.createElement("div");
      rootRef.current = createRoot(container);

      markerRef.current = new google.maps.marker.AdvancedMarkerView({
        position,
        content: container,
      });

      console.log("creating", position);
    }

    return () => {
      markerRef.current.map = null;
    };
  }, []);

  useEffect(() => {
    rootRef.current.render(children);
    markerRef.current.position = position;
    markerRef.current.map = map;
    const listener = markerRef.current.addListener("click", onClick);

    return () => {
      listener.remove();
    };
  }, [map, children]);

  return null;
}
