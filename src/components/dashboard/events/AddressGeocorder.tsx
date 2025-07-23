"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Path } from "react-hook-form"; // ⬅️ add at top with other imports

/* ------------------------------------------------------------------ */
/*                              TYPES                                 */
/* ------------------------------------------------------------------ */

interface RawNominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  importance?: number;
  type?: string;
  class?: string;
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    street?: string;
    neighbourhood?: string;
    suburb?: string;
    hamlet?: string;
    city_district?: string;
    state_district?: string;
    region?: string;
    county?: string;
    state?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox?: [string, string, string, string];
  _score?: number;
}

export interface StructuredAddress {
  houseNumber?: string;
  street?: string;
  settlement?: string;
  region?: string;
  state?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
  line1: string;
  line2: string;
  full: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  displayName: string;
  raw: RawNominatimResult;
  address: StructuredAddress;
  bbox?: { south: number; north: number; west: number; east: number };
}

export interface GeocoderInputProps<FormShape extends FieldValues = any> {
  /** Pass RHF `useForm()` object if you want auto‑commit into the form. */
  form?: UseFormReturn<FormShape>;
  /** Where inside the form geodata lives (default "sellerProfile"). */
  autoCommit?: boolean;
  /** Fires every time a location is chosen/refined. */
  onLocationSelected?: (loc: LocationData) => void;
  /** Label shown above input. */
  label?: ReactNode;
  /** Autofocus input on mount? */
  autoFocus?: boolean;
}

/* ------------------------------------------------------------------ */
/*                             CONSTANTS                              */
/* ------------------------------------------------------------------ */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

/* ------------------------------------------------------------------ */
/*                       MAIN COMPONENT                               */
/* ------------------------------------------------------------------ */

export function AddressGeocoderInput<FormShape extends FieldValues = any>({
  form,
  autoCommit = true,
  onLocationSelected,
  label = "Address",
  autoFocus = false,
}: GeocoderInputProps<FormShape>) {
  /* ---------------- state ---------------- */
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<RawNominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState("");
  const [reverseLoading, setReverseLoading] = useState(false);

  const cacheRef = useRef<Map<string, RawNominatimResult[]>>(new Map());
  const selectingRef = useRef(false);
  const initRef = useRef(false);

  /* ---------------- helpers ---------------- */
  const debounce = (fn: (...a: any[]) => void, wait: number) => {
    let t: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const buildStructuredAddress = (r: RawNominatimResult): StructuredAddress => {
    const a = r.address || {};
    const street = a.road || a.street;
    const settlement =
      a.city || a.town || a.village || a.hamlet || a.city_district;
    const region =
      a.region ||
      a.state_district ||
      a.state ||
      a.county ||
      a.suburb ||
      settlement;
    const line1 = [a.house_number, street].filter(Boolean).join(" ").trim();
    const line2 = [settlement, region, a.postcode].filter(Boolean).join(", ");

    return {
      houseNumber: a.house_number,
      street,
      settlement,
      region,
      state: a.state,
      postcode: a.postcode,
      country: a.country,
      countryCode: a.country_code,
      line1,
      line2,
      full: r.display_name,
    };
  };

  const rankAndFilter = (data: RawNominatimResult[]) =>
    data
      .filter((d) => d.display_name && d.lat && d.lon)
      .map((d) => {
        const hasHouse = d.address?.house_number ? 1 : 0;
        const hasStreet = d.address?.road || d.address?.street ? 1 : 0;
        const hasPostcode = d.address?.postcode ? 1 : 0;
        const score =
          hasHouse * 4 +
          (hasStreet ? 2 : 0) +
          hasPostcode +
          (d.importance || 0);
        return { ...d, _score: score };
      })
      .filter((d) => (d._score as number) > 0.3)
      .sort((a, b) => (b._score as number) - (a._score as number))
      .slice(0, 10);

  /* ---------------- API calls ---------------- */
  const fetchSuggestions = async (text: string) => {
    if (text.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const k = text.trim().toLowerCase();
    if (cacheRef.current.has(k)) {
      setSuggestions(cacheRef.current.get(k)!);
      setShowSuggestions(true);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const url = new URL(`${NOMINATIM_BASE}/search`);
      url.searchParams.set("format", "json");
      url.searchParams.set("q", text);
      url.searchParams.set("limit", "15");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("extratags", "1");
      url.searchParams.set("namedetails", "1");
      url.searchParams.set("dedupe", "1");
      url.searchParams.set("polygon_geojson", "0");
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("search failed");
      const raw: RawNominatimResult[] = await res.json();
      const processed = rankAndFilter(raw);
      cacheRef.current.set(k, processed);
      setSuggestions(processed);
      setShowSuggestions(true);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch suggestions.");
    } finally {
      setLoadingSuggestions(false);
    }
  };
  const debouncedFetch = useCallback(debounce(fetchSuggestions, 250), []);

  const reverseGeocode = async (lat: number, lon: number) => {
    setReverseLoading(true);
    try {
      const url = new URL(`${NOMINATIM_BASE}/reverse`);
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("lat", String(lat));
      url.searchParams.set("lon", String(lon));
      url.searchParams.set("addressdetails", "1");
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("reverse failed");
      return (await res.json()) as RawNominatimResult;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setReverseLoading(false);
    }
  };

  /* ---------------- commit helpers ---------------- */
  const commitToForm = (loc: LocationData) => {
    if (!form || !autoCommit) return;
    const set = <K extends string>(key: K, value: any) =>
      form.setValue(key as unknown as Path<FormShape>, value);

    set("address", loc.address.full || loc.displayName);
    set("country", loc.address.country || "");
    set("state", loc.address.state || "");
    set("latitude", String(loc.latitude));
    set("longitude", String(loc.longitude));
  };

  const applyLocation = (loc: LocationData, skipCommit = false) => {
    setLocation(loc);
    if (!skipCommit) commitToForm(loc);
    onLocationSelected?.(loc);
  };

  const promoteRefined = (refined: RawNominatimResult) => {
    const bbox = refined.boundingbox
      ? {
          south: parseFloat(refined.boundingbox[0]),
          north: parseFloat(refined.boundingbox[1]),
          west: parseFloat(refined.boundingbox[2]),
          east: parseFloat(refined.boundingbox[3]),
        }
      : location?.bbox;
    applyLocation({
      latitude: parseFloat(refined.lat),
      longitude: parseFloat(refined.lon),
      displayName: refined.display_name,
      raw: refined,
      address: buildStructuredAddress(refined),
      bbox,
    });
  };

  /* ---------------- direct coord entry ---------------- */
  const coordRegex = /^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/;
  const tryCoords = async (txt: string) => {
    if (!coordRegex.test(txt)) return false;
    const [latS, lonS] = txt.split(",");
    const lat = parseFloat(latS);
    const lon = parseFloat(lonS);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return false;
    applyLocation(
      {
        latitude: lat,
        longitude: lon,
        displayName: `${lat}, ${lon}`,
        raw: {
          place_id: Date.now(),
          lat: String(lat),
          lon: String(lon),
          display_name: `${lat}, ${lon}`,
        } as RawNominatimResult,
        address: {
          line1: "",
          line2: "",
          full: `${lat}, ${lon}`,
        } as StructuredAddress,
      },
      false
    );
    const rev = await reverseGeocode(lat, lon);
    if (rev) promoteRefined(rev);
    return true;
  };

  /* ---------------- selection ---------------- */
  const selectSuggestion = async (s: RawNominatimResult) => {
    try {
      setQuery(s.display_name);
      setSuggestions([]);
      setShowSuggestions(false);
      applyLocation({
        latitude: parseFloat(s.lat),
        longitude: parseFloat(s.lon),
        displayName: s.display_name,
        raw: s,
        address: buildStructuredAddress(s),
        bbox: s.boundingbox
          ? {
              south: parseFloat(s.boundingbox[0]),
              north: parseFloat(s.boundingbox[1]),
              west: parseFloat(s.boundingbox[2]),
              east: parseFloat(s.boundingbox[3]),
            }
          : undefined,
      });
      const rev = await reverseGeocode(parseFloat(s.lat), parseFloat(s.lon));
      if (rev) promoteRefined(rev);
    } catch (e) {
      setError("Failed to select address.");
    } finally {
      selectingRef.current = false;
    }
  };

  /* ---------------- input handlers ---------------- */
  const handleChange = async (v: string) => {
    setQuery(v);

    if (!form) return;
    const set = <K extends string>(key: K, value: any) =>
      form.setValue(key as unknown as Path<FormShape>, value);

    set("address", v);

    setLocation(null);
    if (v.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (!(await tryCoords(v))) debouncedFetch(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      selectingRef.current = true;
      selectSuggestion(suggestions[0]);
    }
    if (e.key === "Escape") setShowSuggestions(false);
  };

  /* ---------------- init from form (if provided) ---------------- */
  useEffect(() => {
    if (initRef.current || !form) return;
    const get = <K extends string, T = any>(key: K): T =>
      form.getValues(key as unknown as Path<FormShape>) as T;

    const lat = get<string>(`latitude`);
    const lon = get<string>(`longitude`);
    const addr = get<string>(`address`);
    setQuery(addr);
    if (lat && lon) {
      const latN = parseFloat(lat);
      const lonN = parseFloat(lon);
      if (!Number.isNaN(latN) && !Number.isNaN(lonN)) {
        applyLocation(
          {
            latitude: latN,
            longitude: lonN,
            displayName: addr || `${latN}, ${lonN}`,
            raw: {
              place_id: Date.now(),
              lat,
              lon,
              display_name: addr || `${latN}, ${lonN}`,
            } as RawNominatimResult,
            address: {
              line1: "",
              line2: "",
              full: addr || `${latN}, ${lonN}`,
            } as StructuredAddress,
          },
          true
        );
        reverseGeocode(latN, lonN).then((r) => r && promoteRefined(r));
        initRef.current = true;
        return;
      }
    }
    if (addr) {
      fetchSuggestions(addr).then(() => {
        const first = cacheRef.current.get(addr.toLowerCase())?.[0];
        if (first) selectSuggestion(first);
      });
    }
    initRef.current = true;
  }, [form]);

  /* ---------------- render ---------------- */
  return (
    <FormItem className="space-y-2 col-span-2">
      <FormLabel htmlFor="geo-address">{label}</FormLabel>

      <div className="relative">
        <Input
          id="geo-address"
          placeholder="Search address"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!selectingRef.current)
              setTimeout(() => setShowSuggestions(false), 120);
          }}
          autoComplete="off"
        />
        <FormMessage />

        {loadingSuggestions && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-30 w-full mt-1 bg-white border rounded-md shadow-lg max-h-80 overflow-y-auto">
            {suggestions.map((s, idx) => {
              const a = s.address || {};
              const street = a.road || a.street;
              const settle =
                a.city || a.town || a.village || a.hamlet || a.city_district;
              const region =
                a.region ||
                a.state_district ||
                a.state ||
                a.county ||
                a.suburb ||
                settle;
              const top = [a.house_number, street].filter(Boolean).join(" ");
              const tail = [settle, region, a.postcode, a.country]
                .filter(Boolean)
                .join(", ");
              return (
                <div
                  key={s.place_id + "-" + idx}
                  className="px-4 py-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectingRef.current = true;
                    selectSuggestion(s);
                  }}
                >
                  <p className="text-sm font-medium truncate">
                    {top || s.display_name.split(",")[0]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {tail}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {reverseLoading && (
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> refining…
        </p>
      )}
    </FormItem>
  );
}
