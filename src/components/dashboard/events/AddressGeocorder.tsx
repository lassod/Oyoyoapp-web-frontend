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
import { formatWithOptions } from "util";

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
  // 🔑 subscribe to just this field; updates on reset/back too
  const address = form?.watch?.("address");
  const [input, setInput] = useState<string>(address ?? "");

  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const skipNextFetch = useRef(false);
  const sessionTokenRef = useRef<string>(uuid());

  // Re-seed when the form instance changes (rare) or first mount
  useEffect(() => {
    if (!form) return;
    const initial = form.getValues?.("address");
    if (typeof initial === "string") {
      skipNextFetch.current = true;
      setInput(initial);
    }
  }, [form]);

  // ✅ keep local state in sync with RHF value always
  useEffect(() => {
    if (address !== undefined && address !== input) {
      skipNextFetch.current = true; // don't trigger autocomplete
      setInput(address ?? "");
    }
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

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
    sessionTokenRef.current = uuid();

    const display = [
      details?.line1,
      details?.city,
      details?.state,
      details?.country,
    ]
      .filter(Boolean)
      .join(", ");

    setInput(display);
    form?.setValue?.("address", display, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form?.setValue?.("state", details?.state || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form?.setValue?.("country", details?.country || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form?.setValue?.("latitude", details?.location?.lat ?? null, {
      shouldDirty: true,
    });
    form?.setValue?.("longitude", details?.location?.lng ?? null, {
      shouldDirty: true,
    });
  };

  return (
    <FormItem className="space-y-2 col-span-2" data-error-anchor="address">
      <FormLabel htmlFor="geo-address">{label}</FormLabel>
      <Command>
        <CommandInput
          id="geo-address"
          name="address" // helps focus/scroll helpers
          placeholder="Start typing your address..."
          value={input}
          autoFocus={autoFocus}
          onValueChange={(v) => {
            skipNextFetch.current = false; // user input -> allow fetch
            setInput(v);
            form?.setValue?.("address", v, { shouldDirty: true });
          }}
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
