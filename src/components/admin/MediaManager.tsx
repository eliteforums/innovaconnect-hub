"use client";

import { useState, useTransition } from "react";
import { Check, Copy, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { deleteMediaAction, uploadMediaAction } from "@/app/admin/actions";

type Upload = { name: string; url: string; size: number; created_at: string };
type LibraryItem = { key: string; label: string; group: string; preview: string };

export function MediaManager({ uploads: initial, library }: { uploads: Upload[]; library: LibraryItem[] }) {
  const [uploads, setUploads] = useState(initial);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function upload(files: FileList | null) {
    if (!files?.length) return;
    start(async () => {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await uploadMediaAction(fd);
        setMessage({ ok: res.ok, text: res.ok ? `Uploaded ${file.name}.` : `${file.name}: ${res.message}` });
        if (res.ok && res.data) {
          const data = res.data;
          setUploads((u) => [{ name: data.name, url: data.url, size: file.size, created_at: new Date().toISOString() }, ...u]);
        }
      }
    });
  }

  function remove(name: string) {
    if (!window.confirm("Delete this image? Content using it will fall back to its illustration.")) return;
    start(async () => {
      const res = await deleteMediaAction(name);
      setMessage({ ok: res.ok, text: res.message });
      if (res.ok) setUploads((u) => u.filter((x) => x.name !== name));
    });
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="mt-8 space-y-10">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-ink bg-paper-white p-8 text-center hover:bg-taxi/20">
        {pending ? <Loader2 aria-hidden className="size-6 animate-spin" /> : <ImagePlus aria-hidden className="size-6" />}
        <span className="font-semibold">Click to upload images</span>
        <span className="text-xs text-muted">JPEG, PNG, WebP, GIF or AVIF · up to 5 MB each</span>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="sr-only"
          onChange={(e) => {
            upload(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {message && (
        <p role={message.ok ? "status" : "alert"} className={`border-2 px-3 py-2 text-sm font-medium ${message.ok ? "border-ink bg-taxi/40" : "border-best bg-best/5"}`}>
          {message.text}
        </p>
      )}

      <section aria-labelledby="uploads-title">
        <h2 id="uploads-title" className="label text-[0.75rem]">
          Uploaded ({uploads.length})
        </h2>
        {uploads.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No uploads yet.</p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {uploads.map((u) => (
              <li key={u.name} className="border-2 border-ink bg-paper-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.url} alt="" className="aspect-[4/3] w-full bg-paper-deep object-contain" />
                <div className="flex items-center justify-between gap-1 border-t-2 border-ink p-2">
                  <span className="truncate font-mono text-[0.625rem]" title={u.name}>
                    {u.name}
                  </span>
                  <span className="flex shrink-0">
                    <button type="button" aria-label="Copy image URL" title="Copy URL" onClick={() => copy(u.url)} className="rounded p-1.5 hover:bg-paper-deep">
                      {copied === u.url ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    </button>
                    <button type="button" aria-label="Delete image" title="Delete" onClick={() => remove(u.name)} className="rounded p-1.5 text-best hover:bg-best/10">
                      <Trash2 className="size-3.5" />
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="library-title">
        <h2 id="library-title" className="label text-[0.75rem]">
          Built-in images ({library.length})
        </h2>
        <p className="mt-1 text-xs text-muted">Part of the site&rsquo;s code. Refer to them by key in the editor.</p>
        <ul className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {library.map((i) => (
            <li key={i.key} className="border border-ink/40 bg-paper-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.preview} alt="" className="aspect-[4/3] w-full bg-paper-deep object-contain" />
              <div className="flex items-center justify-between gap-1 border-t border-ink/30 p-2">
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">{i.label}</span>
                  <span className="block truncate font-mono text-[0.625rem] text-muted">{i.key}</span>
                </span>
                <button type="button" aria-label={`Copy key ${i.key}`} title="Copy key" onClick={() => copy(i.key)} className="shrink-0 rounded p-1.5 hover:bg-paper-deep">
                  {copied === i.key ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
