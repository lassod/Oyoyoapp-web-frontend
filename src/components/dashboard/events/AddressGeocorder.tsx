// components/AddressGeocoderInput.tsx
"use client";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect, useMemo, useRef, useState } from "react";
import { placesAutocomplete, placeDetails } from "@/lib/google"; // server actions
import { v4 as uuid } from "uuid";

interface GeocoderInputProps {
  form?: any;
  label?: string;
  autoFocus?: boolean;
  countryRestrict?: string; // e.g. "ng", "us" (optional)
}

export function AddressGeocoderInput<FormShape>({
  form,
  label = "Address",
  autoFocus = false,
  countryRestrict,
}: GeocoderInputProps) {
  const [input, setInput] = useState<string>(
    form?.getValues?.("address") ?? ""
  );
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const skipNextFetch = useRef(false);
  const sessionTokenRef = useRef<string>(uuid()); // persistent per mount

  // Sync when RHF changes outside
  useEffect(() => {
    if (!form) return;
    const current = form.getValues("address");
    if (current && !input) setInput(current);
    const sub = form.watch((values: any, { name }: any) => {
      if (name === "address") setInput(values.address ?? "");
    });
    return () => sub.unsubscribe?.();
  }, [form]);

  // Debounced autocomplete
  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    if (!input.trim()) {
      setPredictions([]);
      return;
    }

    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await placesAutocomplete(
          input,
          sessionTokenRef.current,
          countryRestrict
        );
        if (!cancelled) setPredictions(results);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [input, countryRestrict]);

  // Select -> fetch details -> fill form
  const handleSelect = async (prediction: any) => {
    skipNextFetch.current = true;
    setPredictions([]);

    const details = await placeDetails(
      prediction.place_id,
      sessionTokenRef.current
    );
    // Start a new token after a completed selection (Google best practice)
    sessionTokenRef.current = uuid();

    // Prefer a clean line1 + city/state/country for the input shown
    const display = [
      details?.line1,
      details?.city,
      details?.state,
      details?.country,
    ]
      .filter(Boolean)
      .join(", ");

    setInput(display);
    console.log(details);
    if (form) {
      form.setValue("address", display);
      form.setValue("state", details?.state || "");
      form.setValue("country", details?.country || "");
      form.setValue("latitude", details?.location?.lat ?? "");
      form.setValue("longitude", details?.location?.lng ?? "");
    }
  };

  return (
    <FormItem className="space-y-2 col-span-2">
      <FormLabel htmlFor="geo-address">{label}</FormLabel>
      <Command>
        <CommandInput
          placeholder="Start typing your address..."
          value={input}
          autoFocus={autoFocus}
          onValueChange={setInput}
        />
        <CommandList>
          <CommandGroup heading={loading ? "Searching..." : "Suggestions"}>
            {predictions.length === 0 && !loading && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No suggestions
              </div>
            )}
            {predictions.map((p) => (
              <CommandItem key={p.place_id} onSelect={() => handleSelect(p)}>
                {p.description || p.structured_formatting?.main_text}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </Command>
      <FormMessage />
    </FormItem>
  );
}
