"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoItem {
  id: string | number;
  caption?: string | null;
  category?: string | null;
  image?: {
    url?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
}

export default function GalleryClient({ photos }: { photos: PhotoItem[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<PhotoItem | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Record<string | number, boolean>>({});

  const categories = [
    { id: "all", label: "All Photos" },
    { id: "events", label: "Events & Hackathons" },
    { id: "workshops", label: "Workshops" },
    { id: "classes", label: "Coding Classes" },
    { id: "team", label: "Team & Community" },
  ];

  // Filter out any photos whose images fail to load or were deleted remotely
  const validPhotos = photos.filter((p) => !failedImageIds[p.id]);

  const filteredPhotos =
    activeCategory === "all"
      ? validPhotos
      : validPhotos.filter((p) => p.category === activeCategory);

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                : "glass-pill text-muted-foreground hover:text-foreground hover:scale-105"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No photos found in this category.
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="glass-card glass-card-hover relative group rounded-2xl overflow-hidden cursor-pointer break-inside-avoid shadow-lg"
              onClick={() => setSelectedImage(photo)}
            >
              {photo.image && typeof photo.image === "object" && photo.image.url && (
                <Image
                  src={photo.image.url}
                  alt={photo.caption || "Gallery image"}
                  width={photo.image.width || 800}
                  height={photo.image.height || 600}
                  onError={() => {
                    setFailedImageIds((prev) => ({ ...prev, [photo.id]: true }));
                  }}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <div className="text-center p-4">
                  <Maximize2 className="w-8 h-8 text-white mx-auto mb-2 opacity-80" />
                  <p className="text-white text-sm font-medium">{photo.caption}</p>
                  {photo.category && (
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-white capitalize">
                      {photo.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </Button>

          <div
            className="max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedImage.image && typeof selectedImage.image === "object" && selectedImage.image.url && (
              <Image
                src={selectedImage.image.url}
                alt={selectedImage.caption || "Gallery image"}
                width={1200}
                height={800}
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            )}
            {selectedImage.caption && (
              <div className="mt-4 text-center">
                <p className="text-white text-base font-medium">{selectedImage.caption}</p>
                {selectedImage.category && (
                  <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary/80 text-white capitalize">
                    {selectedImage.category}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
