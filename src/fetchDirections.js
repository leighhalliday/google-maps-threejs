import { getGeocode, getLatLng } from "use-places-autocomplete";

export default async function fetchDirections(origin, destination, setRoute) {
  const originResults = await getGeocode({ address: origin });
  const originLocation = await getLatLng(originResults[0]);

  const destinationResults = await getGeocode({ address: destination });
  const destinationLocation = await getLatLng(destinationResults[0]);

  const service = new google.maps.DirectionsService();
  service.route(
    {
      origin: originLocation,
      destination: destinationLocation,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === "OK" && result) {
        const route = result.routes[0].overview_path.map((path) => ({
          lat: path.lat(),
          lng: path.lng(),
        }));
        setRoute(route);
      }
    }
  );
}
