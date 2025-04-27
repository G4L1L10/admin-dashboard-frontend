"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function SignedImage({ object }: { object: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    async function fetchSignedUrl() {
      try {
        const res = await api.get("/media/signed-url", {
          params: { object },
        });
        setUrl(res.data.url);
      } catch (err) {
        console.error("Failed to get signed image URL", err);
      }
    }

    if (object) fetchSignedUrl();
  }, [object]);

  if (!url) return null;

  return (
    <img src={url} alt="question" className="max-w-xs rounded-lg border" />
  );
}
