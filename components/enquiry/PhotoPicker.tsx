"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { PHOTO_MIN_LONG, PHOTO_MIN_SHORT, PHOTO_SLOTS, type PhotoSlot } from "@/lib/photos";
import { PhotoError, preparePhoto } from "./preparePhoto";

type Photo = { status: "preparing" } | { status: "ready"; blob: Blob; url: string };
type Slot = (typeof PHOTO_SLOTS)[number];

const omit = <T extends object>(obj: T, key: keyof T): T => {
  const next = { ...obj };
  delete next[key];
  return next;
};

// Business photo state for the enquiry form. Each photo is shrunk as soon as it's picked, so any
// problem shows up before the visitor submits and the upload stays small.
export function usePhotos() {
  const [photos, setPhotos] = useState<Partial<Record<PhotoSlot, Photo>>>({});
  const [errors, setErrors] = useState<Partial<Record<PhotoSlot, string>>>({});
  const jobs = useRef<Partial<Record<PhotoSlot, number>>>({});
  const urls = useRef<Partial<Record<PhotoSlot, string>>>({});

  useEffect(() => {
    const previews = urls.current;
    return () => Object.values(previews).forEach((url) => url && URL.revokeObjectURL(url));
  }, []);

  // Empties a slot and abandons any photo still being prepared for it.
  const clear = useCallback((slot: PhotoSlot) => {
    jobs.current[slot] = (jobs.current[slot] ?? 0) + 1;
    const url = urls.current[slot];
    if (url) URL.revokeObjectURL(url);
    delete urls.current[slot];
    setPhotos((p) => omit(p, slot));
  }, []);

  const pick = useCallback(
    async (slot: PhotoSlot, file: File) => {
      clear(slot);
      const job = jobs.current[slot];
      setErrors((e) => omit(e, slot));
      setPhotos((p) => ({ ...p, [slot]: { status: "preparing" } }));
      try {
        const { blob } = await preparePhoto(file);
        if (jobs.current[slot] !== job) return;
        const url = URL.createObjectURL(blob);
        urls.current[slot] = url;
        setPhotos((p) => ({ ...p, [slot]: { status: "ready", blob, url } }));
      } catch (err) {
        if (jobs.current[slot] !== job) return;
        setPhotos((p) => omit(p, slot));
        setErrors((e) => ({
          ...e,
          [slot]: err instanceof PhotoError ? err.message : "We couldn't open this photo. Please choose another one.",
        }));
      }
    },
    [clear],
  );

  const remove = useCallback(
    (slot: PhotoSlot) => {
      clear(slot);
      setErrors((e) => omit(e, slot));
    },
    [clear],
  );

  // The server turned these photos down: empty their slots and say why.
  const reject = useCallback(
    (problems: Partial<Record<string, string>>) => {
      const next: Partial<Record<PhotoSlot, string>> = {};
      for (const { id } of PHOTO_SLOTS) {
        const problem = problems[id];
        if (typeof problem !== "string") continue;
        clear(id);
        next[id] = problem;
      }
      setErrors((e) => ({ ...e, ...next }));
    },
    [clear],
  );

  const ready = PHOTO_SLOTS.flatMap(({ id }) => {
    const photo = photos[id];
    return photo?.status === "ready" ? [{ slot: id, blob: photo.blob }] : [];
  });
  const preparing = Object.values(photos).some((p) => p?.status === "preparing");

  return { photos, errors, pick, remove, reject, ready, preparing };
}

export default function PhotoPicker({
  photos,
  errors,
  onPick,
  onRemove,
}: {
  photos: Partial<Record<PhotoSlot, Photo>>;
  errors: Partial<Record<PhotoSlot, string>>;
  onPick: (slot: PhotoSlot, file: File) => void;
  onRemove: (slot: PhotoSlot) => void;
}) {
  return (
    <fieldset className="eq-photos" aria-describedby="eq-photos-rules">
      <legend className="eq-label">
        Add 1 photo of the outside and 3 of the inside of your business
        <span className="eq-opt">Optional</span>
      </legend>
      <p id="eq-photos-rules" className="eq-photos__rules">
        Phone photos are perfect · at least {PHOTO_MIN_LONG} × {PHOTO_MIN_SHORT} px · up to 30 MB each
      </p>
      <div className="eq-photos__grid">
        {PHOTO_SLOTS.map((slot) => (
          <PhotoTile
            key={slot.id}
            slot={slot}
            photo={photos[slot.id]}
            error={errors[slot.id]}
            onPick={onPick}
            onRemove={onRemove}
          />
        ))}
      </div>
    </fieldset>
  );
}

function PhotoTile({
  slot,
  photo,
  error,
  onPick,
  onRemove,
}: {
  slot: Slot;
  photo?: Photo;
  error?: string;
  onPick: (slot: PhotoSlot, file: File) => void;
  onRemove: (slot: PhotoSlot) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const ready = photo?.status === "ready";
  const preparing = photo?.status === "preparing";
  const inputId = `f-photo-${slot.id}`;
  const name = slot.label.toLowerCase();

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && !preparing) onPick(slot.id, file);
  };

  return (
    <div className="eq-photo-wrap">
      <div
        className={`eq-photo${ready ? " is-filled" : ""}${preparing ? " is-busy" : ""}${dragging ? " is-dragging" : ""}${error ? " has-error" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragging) setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={onDrop}
      >
        {ready && <img className="eq-photo__img" src={photo.url} alt={`Your ${name} photo`} />}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="eq-photo__input"
          disabled={preparing}
          aria-describedby={`e-photo-${slot.id}`}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = ""; // so picking the same file again still counts as a change
            if (file) onPick(slot.id, file);
          }}
        />
        <label htmlFor={inputId} className="eq-photo__pick">
          <span className="eq-photo__icon" aria-hidden="true">
            {preparing ? <span className="eq-spinner eq-spinner--gold" /> : "+"}
          </span>
          <span className="eq-photo__label">
            {slot.label}
            <span className="sr-only"> photo</span>
          </span>
          {!ready && <span className="eq-photo__hint">{slot.hint}</span>}
          <span className="eq-photo__action">{preparing ? "Preparing…" : ready ? "Replace" : "Add photo"}</span>
        </label>
        {ready && (
          <button
            type="button"
            className="eq-photo__remove"
            onClick={() => onRemove(slot.id)}
            aria-label={`Remove ${name} photo`}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
      <p className="eq-error" id={`e-photo-${slot.id}`} aria-live="polite">
        {error}
      </p>
    </div>
  );
}
