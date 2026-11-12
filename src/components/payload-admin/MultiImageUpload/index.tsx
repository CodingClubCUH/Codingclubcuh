'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useField } from '@payloadcms/ui';
import { upload as vercelBlobUpload } from '@vercel/blob/client';
import {
  Upload,
  Image as ImageIcon,
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Library,
  Star,
  Plus,
  Trash2,
} from 'lucide-react';

interface MultiImageUploadProps {
  field?: {
    label?: string;
    description?: string;
    name?: string;
    maxRows?: number;
  };
  path?: string;
  readOnly?: boolean;
}

interface MediaItem {
  id: number;
  filename?: string | null;
  url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  field,
  path = 'images',
  readOnly,
}) => {
  const maxImages = field?.maxRows || 10;
  const fieldLabel = field?.label || 'Post Images (Multi-Image Carousel)';
  const fieldDescription =
    field?.description ||
    'Select or upload up to 10 images at once. Visitors will swipe and see multiple images. The 1st image is used as the cover.';

  const { value = [], setValue } = useField<any[]>({ path });

  const [selectedDocs, setSelectedDocs] = useState<MediaItem[]>(() => {
    if (!Array.isArray(value)) return [];
    const initialItems: MediaItem[] = [];
    for (const item of value) {
      if (typeof item === 'object' && item !== null) {
        const doc =
          'value' in item && typeof item.value === 'object' && item.value !== null
            ? (item.value as Record<string, any>)
            : (item as Record<string, any>);
        if (doc && doc.id && doc.url) {
          initialItems.push({
            id: Number(doc.id),
            filename: typeof doc.filename === 'string' ? doc.filename : null,
            url: typeof doc.url === 'string' ? doc.url : null,
            alt: typeof doc.alt === 'string' ? doc.alt : null,
            width: typeof doc.width === 'number' ? doc.width : null,
            height: typeof doc.height === 'number' ? doc.height : null,
          });
        }
      }
    }
    return initialItems;
  });
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    filename: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Media Library Drawer Modal state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryDocs, setLibraryDocs] = useState<MediaItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [librarySelection, setLibrarySelection] = useState<number[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const loadedIdsRef = useRef<string>('');

  // Extract raw IDs from value
  const currentIds: number[] = React.useMemo(() => {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => {
        if (typeof item === 'object' && item !== null && 'id' in item) {
          return Number(item.id);
        }
        if (typeof item === 'object' && item !== null && 'value' in item) {
          return typeof item.value === 'object' ? Number(item.value?.id) : Number(item.value);
        }
        return Number(item);
      })
      .filter((id) => !isNaN(id) && id > 0);
  }, [value]);

  const currentIdsKey = currentIds.join(',');

  // Load details for current attached image IDs
  useEffect(() => {
    // If the IDs haven't changed since last load, do nothing
    if (loadedIdsRef.current === currentIdsKey) {
      return;
    }

    if (!currentIdsKey) {
      loadedIdsRef.current = '';
      setSelectedDocs((prev) => (prev.length > 0 ? [] : prev));
      return;
    }

    const ids = currentIdsKey.split(',').map(Number).filter((id) => !isNaN(id) && id > 0);

    // If selectedDocs already contains all documents for currentIds, avoid redundant network request
    if (
      selectedDocs.length === ids.length &&
      ids.every((id, i) => selectedDocs[i]?.id === id && selectedDocs[i]?.url)
    ) {
      loadedIdsRef.current = currentIdsKey;
      return;
    }

    loadedIdsRef.current = currentIdsKey;

    let isMounted = true;
    setLoadingInitial(true);

    const fetchDocs = async () => {
      try {
        const query = ids.map((id, index) => `where[id][in][${index}]=${id}`).join('&');
        const res = await fetch(`/api/media?${query}&limit=50&depth=0`);
        if (!res.ok) throw new Error('Failed to fetch media');
        const data = await res.json();
        const docs: MediaItem[] = data.docs || [];

        const docsMap = new Map<number, MediaItem>();
        docs.forEach((d) => docsMap.set(d.id, d));

        const ordered = ids
          .map((id) => docsMap.get(id))
          .filter((d): d is MediaItem => Boolean(d && d.url));

        if (isMounted) {
          setSelectedDocs(ordered);
        }
      } catch (err) {
        console.warn('Error fetching attached media details:', err);
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    };

    fetchDocs();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdsKey]);

  // Update value helper
  const updateMediaSelection = useCallback(
    (newDocs: MediaItem[]) => {
      const newIds = newDocs.map((d) => d.id);
      loadedIdsRef.current = newIds.join(',');
      setSelectedDocs(newDocs);
      setValue(newIds);
    },
    [setValue]
  );

  // Reorder: Move Left
  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...selectedDocs];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    updateMediaSelection(updated);
  };

  // Reorder: Move Right
  const handleMoveRight = (index: number) => {
    if (index >= selectedDocs.length - 1) return;
    const updated = [...selectedDocs];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    updateMediaSelection(updated);
  };

  // Remove one image
  const handleRemove = (idToRemove: number) => {
    const updated = selectedDocs.filter((d) => d.id !== idToRemove);
    updateMediaSelection(updated);
  };

  // Clear all images
  const handleClearAll = () => {
    updateMediaSelection([]);
  };

  // Process batch of files directly from input or dropzone
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      setErrorMessage('Please select image files (JPEG, PNG, WebP, etc.)');
      return;
    }

    const availableSlots = maxImages - selectedDocs.length;
    if (availableSlots <= 0) {
      setErrorMessage(`Maximum limit of ${maxImages} images already reached.`);
      return;
    }

    const filesToUpload = fileArray.slice(0, availableSlots);
    if (fileArray.length > availableSlots) {
      setErrorMessage(
        `Selected ${fileArray.length} images, but only ${availableSlots} more could be added (max ${maxImages}).`
      );
    } else {
      setErrorMessage(null);
    }

    setIsUploading(true);
    setUploadProgress({
      current: 1,
      total: filesToUpload.length,
      filename: `Uploading ${filesToUpload.length} ${filesToUpload.length === 1 ? 'image' : 'images'}...`,
    });

    const newlyUploadedDocs: MediaItem[] = [];
    const uploadErrors: string[] = [];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        setUploadProgress({
          current: i + 1,
          total: filesToUpload.length,
          filename: file.name,
        });

        try {
          let uploadedItem: MediaItem | null = null;

          // If file exceeds 4.5MB (within 10MB limit), use direct client upload to Vercel Blob
          // to bypass Vercel serverless request body size limits
          if (file.size > 4.5 * 1024 * 1024) {
            try {
              const blob = await vercelBlobUpload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/vercel-blob-client-upload-route',
                clientPayload: 'media',
              });

              const res = await fetch('/api/media/upload-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  doc: {
                    filename: file.name,
                    url: blob.url,
                    size: file.size,
                    type: file.type,
                  },
                }),
              });

              const data = await res.json().catch(() => null);
              if (res.ok && data?.success && data?.docs?.[0]) {
                uploadedItem = data.docs[0];
              }
            } catch (blobErr) {
              console.warn(`Direct blob client upload for ${file.name} failed or unavailable:`, blobErr);
            }
          }

          // If not uploaded via client upload (or for files <= 4.5MB)
          if (!uploadedItem) {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/media/upload-batch', {
              method: 'POST',
              body: formData,
            });

            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.success || !data?.docs?.[0]) {
              throw new Error(data?.error || `Upload failed with status ${res.status}`);
            }
            uploadedItem = data.docs[0];
          }

          if (uploadedItem) {
            newlyUploadedDocs.push(uploadedItem);
          }
        } catch (fileErr: any) {
          console.error(`Error uploading ${file.name}:`, fileErr);
          uploadErrors.push(`${file.name}: ${fileErr.message || 'Upload error'}`);
        }
      }

      if (newlyUploadedDocs.length > 0) {
        const combined = [...selectedDocs, ...newlyUploadedDocs];
        updateMediaSelection(combined);
      }

      if (uploadErrors.length > 0) {
        setErrorMessage(
          `Some files failed to upload (${uploadErrors.length} of ${filesToUpload.length}):\n${uploadErrors.join('; ')}`
        );
      }
    } catch (err: any) {
      console.error('Batch upload error:', err);
      setErrorMessage(`Upload error: ${err.message || 'Network error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // File input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!readOnly) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (readOnly) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Open Media Library Modal to select existing photos
  const openMediaLibrary = async () => {
    setIsLibraryOpen(true);
    setLoadingLibrary(true);
    setLibrarySelection(selectedDocs.map((d) => d.id));

    try {
      const res = await fetch('/api/media?limit=80&sort=-createdAt&depth=0');
      if (!res.ok) throw new Error('Failed to load library');
      const data = await res.json();
      setLibraryDocs(data.docs || []);
    } catch (err) {
      console.error('Failed to load media library:', err);
    } finally {
      setLoadingLibrary(false);
    }
  };

  // Toggle selection inside library modal
  const toggleLibraryItem = (item: MediaItem) => {
    if (librarySelection.includes(item.id)) {
      setLibrarySelection((prev) => prev.filter((id) => id !== item.id));
    } else {
      if (librarySelection.length >= maxImages) {
        alert(`You can select a maximum of ${maxImages} images for a post.`);
        return;
      }
      setLibrarySelection((prev) => [...prev, item.id]);
    }
  };

  // Confirm selection from library modal
  const confirmLibrarySelection = () => {
    const docsMap = new Map<number, MediaItem>();
    libraryDocs.forEach((d) => docsMap.set(d.id, d));
    selectedDocs.forEach((d) => docsMap.set(d.id, d));

    const updated = librarySelection
      .map((id) => docsMap.get(id))
      .filter((d): d is MediaItem => Boolean(d && d.url));

    updateMediaSelection(updated);
    setIsLibraryOpen(false);
  };

  return (
    <div
      style={{
        margin: '24px 0',
        padding: '24px',
        background: '#0d1017',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        color: '#f1f5f9',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
      }}
    >
      {/* Native file input ALWAYS completely hidden */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
        disabled={readOnly || isUploading}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '16px',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <ImageIcon size={18} />
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.01em',
              }}
            >
              {fieldLabel}
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
            {fieldDescription}
          </p>
        </div>

        {/* Counter Badge */}
        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontFamily: 'monospace',
              fontWeight: 700,
              background:
                selectedDocs.length > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              border:
                selectedDocs.length > 0
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
              color: selectedDocs.length > 0 ? '#34d399' : '#94a3b8',
            }}
          >
            {selectedDocs.length} / {maxImages} Images Selected
          </span>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fca5a5',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Uploading Status Banner */}
      {isUploading && uploadProgress && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              fontWeight: 600,
              color: '#c7d2fe',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={16} className="animate-spin" color="#818cf8" />
              Uploading photos ({uploadProgress.current} of {uploadProgress.total})...
            </span>
            <span style={{ fontFamily: 'monospace', color: '#a5b4fc' }}>
              {uploadProgress.filename}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                height: '100%',
                background: '#6366f1',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Selected Cards Grid */}
      {selectedDocs.length > 0 ? (
        <div style={{ marginTop: '20px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: '14px',
            }}
          >
            {selectedDocs.map((item, index) => {
              const isCover = index === 0;

              return (
                <div
                  key={item.id}
                  style={{
                    position: 'relative',
                    background: '#141824',
                    borderRadius: '12px',
                    border: isCover
                      ? '2px solid #10b981'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isCover ? '0 4px 16px rgba(16, 185, 129, 0.2)' : 'none',
                  }}
                >
                  {/* Thumbnail Image */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '140px',
                      background: '#0a0c10',
                      overflow: 'hidden',
                    }}
                  >
                    {item.url && (
                      <img
                        src={item.url}
                        alt={item.alt || item.filename || ''}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    )}

                    {/* Top-Left: Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        zIndex: 2,
                      }}
                    >
                      {isCover ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#10b981',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                          }}
                        >
                          <Star size={11} fill="#ffffff" /> Cover
                        </span>
                      ) : (
                        <span
                          style={{
                            background: 'rgba(0, 0, 0, 0.75)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            padding: '3px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          Slide #{index + 1}
                        </span>
                      )}
                    </div>

                    {/* Top-Right: Remove Button */}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(item.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          zIndex: 2,
                          background: 'rgba(0, 0, 0, 0.75)',
                          backdropFilter: 'blur(4px)',
                          border: 'none',
                          color: '#ffffff',
                          borderRadius: '50%',
                          width: '26px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#ef4444')}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.75)')
                        }
                        title="Remove photo"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Card Bottom Bar */}
                  <div
                    style={{
                      padding: '8px 10px',
                      background: '#0f121b',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '6px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        fontFamily: 'monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '90px',
                      }}
                      title={item.filename || ''}
                    >
                      {item.filename || `ID: ${item.id}`}
                    </span>

                    {/* Move Left / Right Arrows */}
                    {!readOnly && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMoveLeft(index);
                          }}
                          style={{
                            background: index === 0 ? 'rgba(255,255,255,0.03)' : '#23293d',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 6px',
                            color: index === 0 ? '#475569' : '#ffffff',
                            cursor: index === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Move earlier (set as cover)"
                        >
                          <ArrowLeft size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={index === selectedDocs.length - 1}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMoveRight(index);
                          }}
                          style={{
                            background:
                              index === selectedDocs.length - 1
                                ? 'rgba(255,255,255,0.03)'
                                : '#23293d',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 6px',
                            color: index === selectedDocs.length - 1 ? '#475569' : '#ffffff',
                            cursor: index === selectedDocs.length - 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Move later"
                        >
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row below cards */}
          {!readOnly && (
            <div
              style={{
                marginTop: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              {selectedDocs.length < maxImages && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: '#4f46e5',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#4338ca')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#4f46e5')}
                >
                  <Plus size={16} /> Add More Photos from Computer
                </button>
              )}

              <button
                type="button"
                onClick={openMediaLibrary}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: '#1a1f2e',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#e2e8f0',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Library size={16} color="#818cf8" /> Choose from Media Library
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#fca5a5',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: 'auto',
                }}
              >
                <Trash2 size={14} /> Clear All
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            marginTop: '20px',
            padding: '36px 24px',
            borderRadius: '14px',
            border: isDragging
              ? '2px dashed #6366f1'
              : '2px dashed rgba(255, 255, 255, 0.15)',
            background: isDragging ? 'rgba(99, 102, 241, 0.08)' : '#11141e',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            transition: 'all 0.2s',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
              marginBottom: '14px',
            }}
          >
            <Upload size={28} />
          </div>

          <h4
            style={{
              margin: '0 0 6px 0',
              fontSize: '17px',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            Upload All Photos at Once
          </h4>
          <p
            style={{
              margin: '0 0 20px 0',
              fontSize: '13px',
              color: '#94a3b8',
              maxWidth: '460px',
              lineHeight: 1.5,
            }}
          >
            Select multiple photos from your computer at once (Ctrl+A or Shift+Click), or drag and
            drop them here directly.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={readOnly || isUploading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                background: '#4f46e5',
                border: 'none',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(79, 70, 229, 0.45)',
                transition: 'transform 0.15s, background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#4338ca')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#4f46e5')}
            >
              <Upload size={17} /> Select Photos from Computer
            </button>

            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>or</span>

            <button
              type="button"
              onClick={openMediaLibrary}
              disabled={readOnly}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '12px',
                background: '#1a1f2e',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Library size={16} color="#818cf8" /> Choose from Existing Library
            </button>
          </div>
        </div>
      )}

      {/* Media Library Selection Modal */}
      {isLibraryOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsLibraryOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '880px',
              maxHeight: '85vh',
              background: '#12141c',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '18px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              color: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '17px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#ffffff',
                  }}
                >
                  <Library size={20} color="#818cf8" /> Select Photos from Media Library
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                  Click photos to select or unselect. Selected: {librarySelection.length} /{' '}
                  {maxImages}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Gallery Grid */}
            <div
              style={{
                padding: '24px',
                overflowY: 'auto',
                flex: 1,
                minHeight: '340px',
              }}
            >
              {loadingLibrary ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 0',
                    gap: '10px',
                    color: '#94a3b8',
                  }}
                >
                  <Loader2 size={32} className="animate-spin" color="#818cf8" />
                  <span style={{ fontSize: '14px' }}>Loading media library...</span>
                </div>
              ) : libraryDocs.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '60px 0',
                    color: '#94a3b8',
                    fontSize: '14px',
                  }}
                >
                  No images found in Media Library. Upload some from your computer!
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {libraryDocs.map((item) => {
                    const isSelected = librarySelection.includes(item.id);
                    const selectionIndex = librarySelection.indexOf(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleLibraryItem(item)}
                        style={{
                          position: 'relative',
                          aspectRatio: '1 / 1',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: isSelected
                            ? '3px solid #6366f1'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          transform: isSelected ? 'scale(0.97)' : 'scale(1)',
                          transition: 'all 0.15s ease',
                          background: '#0a0c12',
                        }}
                      >
                        {item.url && (
                          <img
                            src={item.url}
                            alt={item.alt || item.filename || ''}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        )}

                        {/* Selected Indicator Badge */}
                        {isSelected && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(99, 102, 241, 0.45)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <span
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: '#4f46e5',
                                color: '#ffffff',
                                fontWeight: 800,
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #ffffff',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                              }}
                            >
                              {selectionIndex + 1}
                            </span>
                          </div>
                        )}

                        {/* Filename Tag at Bottom */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '3px 6px',
                            background: 'rgba(0, 0, 0, 0.75)',
                            color: '#e2e8f0',
                            fontSize: '10px',
                            fontFamily: 'monospace',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={item.filename || ''}
                        >
                          {item.filename}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                background: '#0c0e14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace' }}>
                {librarySelection.length} of {maxImages} images selected
              </span>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsLibraryOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#e2e8f0',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmLibrarySelection}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: '#4f46e5',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(79, 70, 229, 0.4)',
                  }}
                >
                  Apply Selection ({librarySelection.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;
