// lib/google.ts (server)
"use server";

import { Client } from "@googlemaps/google-maps-services-js";
const client = new Client();

export async function placesAutocomplete(
  input: string,
  sessionToken: string,
  country?: string
) {
  if (!input?.trim()) return [];

  const { data } = await client.placeAutocomplete({
    params: {
      input,
      key: process.env.GOOGLE_API_KEY!,
      sessiontoken: sessionToken, // keeps pricing low & improves quality
      types: "address" as any, // <-- only addresses, not POIs or postal codes
      components: country ? [`country:${country}`] : undefined, // optional restriction
    },
  });

  const predictions = data?.predictions ?? [];
  // Filter out postal-code only suggestions (belt-and-suspenders)
  return predictions.filter((p) => !p.types?.includes("postal_code" as any));
}

export async function placeDetails(placeId: string, sessionToken: string) {
  if (!placeId) return null;

  const { data } = await client.placeDetails({
    params: {
      place_id: placeId,
      key: process.env.GOOGLE_API_KEY!,
      sessiontoken: sessionToken,
      fields: ["formatted_address", "address_component", "geometry"],
    },
  });

  const r = data?.result;
  if (!r) return null;

  // Extract structured parts
  const find = (type: string) =>
    r.address_components?.find((c) => c.types.includes(type as any))
      ?.long_name ?? "";

  const line1Parts = [find("street_number"), find("route")].filter(Boolean);
  const line1 = line1Parts.join(" ").trim();

  const city =
    find("locality") ||
    find("postal_town") ||
    find("administrative_area_level_2");

  const state = find("administrative_area_level_1");
  const country = find("country");
  const postalCode = find("postal_code"); // available if you need it

  return {
    formattedAddress: r.formatted_address,
    line1,
    city,
    state,
    country,
    postalCode,
    location: {
      lat: r.geometry?.location?.lat,
      lng: r.geometry?.location?.lng,
    },
  };
}
