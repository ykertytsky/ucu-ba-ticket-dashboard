"use client";

import { useCallback, useState } from "react";

import { UploadCloud } from "lucide-react";
import { mutate } from "swr";
import { useDropzone } from "react-dropzone";

import type { UploadResult } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function UploadZone() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFile(acceptedFiles[0] ?? null);
    setError(null);
    setResult(null);
  }, []);

  const dropzone = useDropzone({
    onDrop,
    accept: {
      "application/xml": [".xml"],
      "text/xml": [".xml"],
    },
    multiple: false,
  });

  async function uploadFile() {
    if (!selectedFile) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as UploadResult | { error: string };

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Не вдалося імпортувати файл.");
      }

      setResult(payload as UploadResult);
      await mutate((key) => typeof key === "string" && key.startsWith("/api/"));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Не вдалося імпортувати файл.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div
        {...dropzone.getRootProps()}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dropzone.isDragActive ? "border-violet-500 bg-violet-50" : "border-zinc-300 bg-zinc-50"
        }`}
      >
        <input {...dropzone.getInputProps()} />
        <UploadCloud className="mx-auto h-10 w-10 text-violet-600" />
        <p className="mt-3 text-base font-medium text-zinc-900">Перетягніть XML-файл HESK сюди</p>
        <p className="mt-2 text-sm text-zinc-500">або натисніть, щоб обрати файл із диска</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">Обраний файл</p>
          <p className="font-medium text-zinc-900">{selectedFile?.name ?? "Файл ще не обрано"}</p>
        </div>
        <button
          type="button"
          onClick={uploadFile}
          disabled={!selectedFile || uploading}
          className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {uploading ? "Імпортуємо..." : "Імпортувати XML"}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      {result ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="font-medium">Імпорт завершено успішно.</p>
          <p className="mt-2">
            Знайдено {result.ticketCount} тікетів за період {formatDate(result.periodStart)} - {formatDate(result.periodEnd)}.
          </p>
          <p className="mt-1">Оновлено дублікатів: {result.duplicatesUpdated}.</p>
        </div>
      ) : null}
    </div>
  );
}
