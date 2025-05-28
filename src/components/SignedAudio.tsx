"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function SignedAudio({ object }: { object: string }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUrl() {
      try {
        const res = await api.get("/media/signed-url", {
          params: { object },
        });
        setSignedUrl(res.data.url);
      } catch (err) {
        console.error("Failed to get signed audio URL", err);
      }
    }

    if (object) fetchUrl();
  }, [object]);

  if (!signedUrl) return null;

  return (
    <audio controls className="mt-2 w-full max-w-sm">
      <source src={signedUrl} />
      Your browser does not support the audio element.
    </audio>
  );
}
