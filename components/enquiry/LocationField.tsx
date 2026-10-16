"use client";

import { useEffect, useState } from "react";
import { MAX_LENGTH, mapsLink, mapsPreviewQuery } from "@/lib/enquiry";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
};

const PIN =
  "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";

/**
 * The client's business location: a typed address, a pasted Google Maps link, or their current position.
 * A Google Maps preview shows where it points, so a wrong pin is caught before the enquiry is sent.
 */
export default function LocationField({ value, onChange, onBlur, error }: Props) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Wait until typing pauses, so the map doesn't reload on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setPreview(mapsPreviewQuery(value)), 700);
    return () => clearTimeout(timer);
  }, [value]);

  const locate = () => {
    if (!navigator.geolocation) {
      setGeoError("This browser can't share its location. Please type the address instead.");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        onChange(`${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`);
      },
      (err) => {
        setLocating(false);
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was blocked. Allow it in your browser settings, or type the address instead."
            : "We couldn't find your location. Please type the address instead.",
        );
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  };

  const link = mapsLink(value);

  return (
    <div className={`eq-field eq-field--wide eq-location${error ? " has-error" : ""}`}>
      <label className="eq-label" htmlFor="f-business_location">
        Business location on Google Maps <span className="eq-opt">Optional</span>
      </label>
      <p className="eq-location__hint" id="h-business_location">
        Type your shop or office address, paste its Google Maps link, or use your current location if you&apos;re
        there now.
      </p>
      <div className="eq-location__row">
        <input
          id="f-business_location"
          name="business_location"
          type="text"
          autoComplete="street-address"
          placeholder="Address or Google Maps link"
          value={value}
          maxLength={MAX_LENGTH.business_location}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error || undefined}
          aria-describedby="h-business_location e-business_location"
          className="eq-input"
        />
        <button type="button" className="eq-location__locate" onClick={locate} disabled={locating}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d={PIN} />
          </svg>
          {locating ? "Finding you…" : "Use my current location"}
        </button>
      </div>
      {geoError && (
        <p className="eq-error" role="alert">
          {geoError}
        </p>
      )}
      <p className="eq-error" id="e-business_location">
        {error}
      </p>
      {preview && (
        <div className="eq-location__map">
          <iframe
            title="Map preview of your business location"
            src={`https://www.google.com/maps?q=${encodeURIComponent(preview)}&z=15&output=embed`}
            loading="lazy"
          />
        </div>
      )}
      {link && !error && (
        <a href={link} target="_blank" rel="noopener noreferrer" className="eq-location__open">
          Check it on Google Maps <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  );
}
