"use client";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { autocomplete } from "@/lib/google";
import { PlaceData } from "@googlemaps/google-maps-services-js";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FieldValues, Path } from "react-hook-form";
import { useEffect, useRef, useState } from "react";

interface GeocoderInputProps<FormShape extends FieldValues = any> {
  form?: any;
  label?: string;
  autoFocus?: boolean;
}

export function AddressGeocoderInput<FormShape extends FieldValues = any>({
  form,
  label = "Address",
  autoFocus = false,
}: GeocoderInputProps<FormShape>) {
  /* ──────────────────────────────── state ─────────────────────────────── */
  const [input, setInput] = useState<string>(
    form?.getValues?.("address") ?? "" // <-- initial default
  );
  const [predictions, setPredictions] = useState<PlaceData[]>([]);
  const skipNextFetch = useRef(false);

  /* ─── keep local state in-sync with whatever is in the RHF form ─── */
  useEffect(() => {
    if (!form) return;

    // 1. sync once on mount / when form resets
    const current = form.getValues("address") as string;
    if (current && !input) setInput(current);

    // 2. optional: watch for future changes
    const sub = form.watch((values: { address: any }, { name }: any) => {
      if (name === "address") {
        setInput(values.address ?? "");
      }
    });
    return () => sub.unsubscribe();
  }, [form]); // ← runs again if a new form instance is passed in

  /* ─── autocomplete effect (unchanged) ─── */
  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    if (!input.trim()) {
      setPredictions([]);
      return;
    }
    (async () => {
      const results = await autocomplete(input);
      setPredictions(results as PlaceData[]);
    })();
  }, [input]);

  /* ─── selection handler (unchanged) ─── */
  const handleSelect = (prediction: PlaceData) => {
    setInput(prediction.formatted_address || "");
    skipNextFetch.current = true;
    setPredictions([]);

    if (form) {
      form.setValue("address" as Path<FormShape>, prediction.formatted_address);
      form.setValue(
        "latitude" as Path<FormShape>,
        prediction.geometry?.location?.lat ?? ""
      );
      form.setValue(
        "longitude" as Path<FormShape>,
        prediction.geometry?.location?.lng ?? ""
      );
    }
  };

  /* ─── render (unchanged) ─── */
  return (
    <FormItem className="space-y-2 col-span-2">
      <FormLabel htmlFor="geo-address">{label}</FormLabel>
      <Command>
        <CommandInput
          placeholder="Type an address..."
          value={input}
          autoFocus={autoFocus}
          onValueChange={setInput}
        />
        <CommandList>
          <CommandGroup heading="Suggestions">
            {predictions.map((p) => (
              <CommandItem key={p.place_id} onSelect={() => handleSelect(p)}>
                {p.formatted_address}
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
