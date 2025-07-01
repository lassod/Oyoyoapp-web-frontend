import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Ensure Leaflet CSS is loaded
import { useEffect } from "react";

const ClientMap = ({ searchedLocation, currentLocation, zoom }: any) => {
  // Component to update the map's center when the searched location changes
  const UpdateMapCenter = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, zoom);
    }, [center, map]);
    return null;
  };

  return (
    <MapContainer
      center={searchedLocation || currentLocation}
      zoom={zoom}
      style={{ height: "100%", width: "100%", zIndex: 1 }}
      scrollWheelZoom={true} // Enable scroll zooming
    >
      {/* TileLayer for OpenStreetMap */}
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />

      {/* Marker for current or searched location */}
      <Marker position={searchedLocation || currentLocation}>
        <Popup>{searchedLocation ? "Searched Location" : "You are here"}</Popup>
      </Marker>

      {/* Update map center on search */}
      {searchedLocation && <UpdateMapCenter center={searchedLocation} />}
    </MapContainer>
  );
};

export default ClientMap;
