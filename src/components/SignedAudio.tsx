"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function SignedAudio({ object }: { object: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    async function fetchSignedUrl() {
      try {
        const res = await api.get("/media/signed-url", {
          params: { object },
        });
        setUrl(res.data.url);
      } catch (err) {
        console.error("Failed to get signed audio URL", err);
      }
    }

    if (object) fetchSignedUrl();
  }, [object]);

  if (!url) return null;

  return (
    <div className="rounded-sm mx-auto">
      <audio controls className="w-full">
        <source src={url} />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
