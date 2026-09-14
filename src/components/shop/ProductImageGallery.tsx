"use client";

import React, {useState, useRef, useEffect} from "react";
import {Image as MantineImage, ActionIcon, Text, Group, ScrollArea} from "@mantine/core";
import {IconZoomIn, IconZoomOut, IconMaximize, IconChevronLeft, IconChevronRight} from "@tabler/icons-react";
import {ProductImage} from "@/components/shop/ProductImage";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
}

export function ProductImageGallery({images, alt}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeImage = images[activeIndex] || "/empty.png";
  const total = images.length;

  const next = () => setActiveIndex((prev) => (prev + 1) % total);
  const prev = () => setActiveIndex((prev) => (prev - 1 + total) % total);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFullscreen, total]);

  if (!total) {
    return (
      <div style={{position: "relative", width: "100%", aspectRatio: "1 / 1", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center"}}>
        <Text c="dimmed">تصویری موجود نیست</Text>
      </div>
    );
  }

  return (
    <>
      <div className="product-gallery" style={{position: "relative", width: "100%"}}>
        <div
          ref={containerRef}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            overflow: "hidden",
            background: "#f8f9fa",
            borderRadius: 12,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              transform: `scale(${zoomLevel})`,
              transition: "transform 0.2s",
              cursor: zoomLevel > 1 ? "grab" : "zoom-in",
            }}
            onClick={() => setZoomLevel(zoomLevel > 1 ? 1 : 1.5)}
          >
            <MantineImage
              src={activeImage}
              alt={alt}
              fit="contain"
              w="100%"
              h="100%"
              style={{padding: 8}}
            />
          </div>

          <Group style={{position: "absolute", top: 8, left: 8, zIndex: 5}} gap={4}>
            <ActionIcon variant="filled" color="dark" size="sm" onClick={() => setZoomLevel(zoomLevel > 1 ? 1 : 1.5)}>
              {zoomLevel > 1 ? <IconZoomOut size="1rem"/> : <IconZoomIn size="1rem"/>}
            </ActionIcon>
            <ActionIcon variant="filled" color="dark" size="sm" onClick={() => setIsFullscreen(true)}>
              <IconMaximize size="1rem"/>
            </ActionIcon>
          </Group>

          {total > 1 && (
            <>
              <ActionIcon
                variant="filled"
                color="dark"
                size="lg"
                radius="xl"
                style={{position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", zIndex: 5}}
                onClick={next}
              >
                <IconChevronRight size="1.2rem"/>
              </ActionIcon>
              <ActionIcon
                variant="filled"
                color="dark"
                size="lg"
                radius="xl"
                style={{position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", zIndex: 5}}
                onClick={prev}
              >
                <IconChevronLeft size="1.2rem"/>
              </ActionIcon>
            </>
          )}

          <Text
            size="xs"
            c="white"
            style={{position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.5)", padding: "2px 8px", borderRadius: 4, zIndex: 5}}
          >
            {activeIndex + 1} از {total}
          </Text>
        </div>

        {total > 1 && (
          <ScrollArea mt="sm" w="100%">
            <div style={{display: "flex", gap: 8, paddingBottom: 4}}>
              {images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  style={{
                    flex: "0 0 80px",
                    height: 80,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: i === activeIndex ? "2px solid #168aad" : "2px solid transparent",
                    cursor: "pointer",
                    background: "#f8f9fa",
                  }}
                >
                  <MantineImage src={img} alt={`${alt} ${i + 1}`} fit="contain" w="100%" h="100%" style={{padding: 4}}/>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {isFullscreen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 16,
          }}
          onClick={() => setIsFullscreen(false)}
        >
          <div style={{position: "relative", width: "90vw", height: "80vh"}} onClick={(e) => e.stopPropagation()}>
            <MantineImage src={activeImage} alt={alt} fit="contain" w="100%" h="100%"/>
          </div>
          <Group gap="md" onClick={(e) => e.stopPropagation()}>
            <ActionIcon variant="filled" color="dark" size="lg" radius="xl" onClick={prev}><IconChevronRight size="1.5rem"/></ActionIcon>
            <Text c="white">{activeIndex + 1} از {total}</Text>
            <ActionIcon variant="filled" color="dark" size="lg" radius="xl" onClick={next}><IconChevronLeft size="1.5rem"/></ActionIcon>
          </Group>
        </div>
      )}
    </>
  );
}

export default ProductImageGallery;
