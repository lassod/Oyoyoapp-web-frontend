"use client";
import { Button } from "@/components/ui/button";
import React from "react";

export const MapDisplay = ({ location }: any) => {
  const lat = typeof location.latitude === "string" ? parseFloat(location.latitude) : location.latitude;
  const lon = typeof location.longitude === "string" ? parseFloat(location.longitude) : location.longitude;
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

  const url = location.bbox
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${location.bbox.west},${location.bbox.south},${location.bbox.east},${location.bbox.north}&layer=mapnik&marker=${lat},${lon}`
    : (() => {
        const Δ = 0.01;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - Δ},${lat - Δ},${lon + Δ},${
          lat + Δ
        }&layer=mapnik&marker=${lat},${lon}`;
      })();

  return (
    <div className='col-span-2 space-y-4'>
      <div className='space-y-2'>
        <h6>Map View</h6>
        <div className='aspect-square max-h-[250px] w-full rounded-lg overflow-hidden border relative'>
          <iframe
            key={url}
            src={url}
            width='100%'
            height='100%'
            style={{ border: 0 }}
            loading='lazy'
            referrerPolicy='no-referrer-when-downgrade'
            title='Location Map'
          />
          <div className='pointer-events-none absolute inset-0 ring-1 ring-black/5' aria-hidden='true' />
        </div>
      </div>

      {/* Details */}
      <div className='space-y-2'>
        <h6>Geocode Details</h6>

        <div className='space-y-3'>
          <InfoChip label='Full Address' value={location?.raw?.display_name} />
          <div className='grid grid-cols-3 gap-3'>
            <InfoChip label='State' value={location?.raw?.address?.state} />
            <InfoChip label='Country' value={location?.raw?.address?.country} />
            <InfoChip label='Postcode' value={location?.raw?.address?.postcode} />
          </div>

          <div className='flex gap-2 pt-2'>
            <Button
              variant='secondary'
              onClick={() =>
                window.open(
                  `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}&zoom=17`,
                  "_blank"
                )
              }
              className='w-fit mr-0'
            >
              Open Map
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Presentational Helpers ----------
function InfoChip({ label, value }: { label: string; value?: string }) {
  return (
    <div className='space-y-0.5'>
      <p className='text-xs uppercase tracking-wide text-muted-foreground'>{label}</p>
      <p className='text-sm text-black truncate'>{value || "—"}</p>
    </div>
  );
}
