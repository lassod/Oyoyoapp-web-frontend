"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DynamicClientMap = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

const MapPage = () => {
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([51.509865, -0.118092]);
  const [zoom, setZoom] = useState(13);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchedLocation, setSearchedLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
          setLoading(false);
        },
        () => {
          console.error("Failed to retrieve your location");
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLocation) return;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation)}`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      setSearchedLocation([parseFloat(lat), parseFloat(lon)]);
      setZoom(14);
    } else {
      alert("Location not found");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className='pb-20 z-1'>
      <h5 className='mb-3'>Map</h5>
      <p>Search for an event location</p>

      {/* Search input field */}
      <form onSubmit={handleSearch} className='flex gap-2 mt-2 mb-5'>
        <Input
          type='text'
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          placeholder='Enter location'
        />
        <Button type='submit'>Search</Button>
      </form>

      {/* Render the map component with the searched location */}
      <div className='h-[800px] w-full mt-7 rounded-lg overflow-hidden'>
        <DynamicClientMap searchedLocation={searchedLocation} currentLocation={currentLocation} zoom={zoom} />
      </div>
    </div>
  );
};

export default MapPage;
