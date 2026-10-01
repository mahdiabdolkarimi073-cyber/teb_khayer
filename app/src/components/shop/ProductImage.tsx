"use client";

import React, {useState} from "react";
import Image from "next/image";

type AspectRatio = "1/1" | "4/3" | "3/4" | "16/9";
type Size = "thumbnail" | "card" | "detail" | "zoom";

interface ProductImageProps {
  src: string;
  alt: string;
  aspectRatio?: AspectRatio;
  size?: Size;
  priority?: boolean;
  showZoom?: boolean;
}

const aspectMap: Record<AspectRatio, string> = {
  "1/1": "1 / 1",
  "4/3": "4 / 3",
  "3/4": "3 / 4",
  "16/9": "16 / 9",
};

const sizeMap: Record<Size, string> = {
  thumbnail: "150px",
  card: "400px",
  detail: "800px",
  zoom: "1200px",
};

const sizeBreakpoints: Record<Size, string> = {
  thumbnail: "(max-width: 768px) 150px, 150px",
  card: "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
  detail: "(max-width: 768px) 100vw, 800px",
  zoom: "(max-width: 768px) 100vw, 1200px",
};

export function ProductImage({
  src,
  alt,
  aspectRatio = "1/1",
  size = "card",
  priority = false,
  showZoom = false,
}: ProductImageProps) {
  const [error, setError] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const fallbackSrc = "/empty.png";

  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    aspectRatio: aspectMap[aspectRatio],
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
    cursor: showZoom ? "zoom-in" : "default",
  };

  return (
    <>
      <div
        style={wrapperStyle}
        onClick={() => showZoom && setZoomed(true)}
        className="product-image-wrapper"
      >
        <Image
          src={error ? fallbackSrc : src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizeBreakpoints[size]}
          style={{
            objectFit: "contain",
            padding: "8px",
          }}
          onError={() => setError(true)}
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PC9zdmc+"
          placeholder="blur"
        />
      </div>

      {zoomed && showZoom && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
          onClick={() => setZoomed(false)}
        >
          <div style={{position: "relative", width: "90vw", height: "90vh"}}>
            <Image
              src={error ? fallbackSrc : src}
              alt={alt}
              fill
              sizes="90vw"
              style={{objectFit: "contain"}}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ProductImage;
