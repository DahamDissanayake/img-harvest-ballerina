"use client";

import { useState } from "react";
import { CheckSquare, Square, AlertTriangle, ExternalLink } from "lucide-react";

export interface ImageResult {
    id: string;
    url: string;
    thumbnail: string;
    title: string;
    width?: number;
    height?: number;
}

interface Props {
    images: ImageResult[];
    selectedIds: Set<string>;
    onToggle: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
}

function ImageCard({
    image,
    selected,
    onToggle,
}: {
    image: ImageResult;
    selected: boolean;
    onToggle: () => void;
}) {
    const [imgError, setImgError] = useState(false);
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            onClick={onToggle}
            style={{
                position: "relative",
                borderRadius: "12px",
                overflow: "hidden",
                border: `2px solid ${selected ? "var(--brand)" : "var(--border)"}`,
                background: "var(--bg-card)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: selected ? "0 0 16px rgba(99,102,241,0.3)" : "none",
                transform: selected ? "scale(1.01)" : "scale(1)",
            }}
        >
            {/* Skeleton while loading */}
            {!loaded && !imgError && (
                <div className="skeleton" style={{ width: "100%", height: "180px" }} />
            )}

            {/* Image */}
            {!imgError ? (
                <div style={{ position: "relative", width: "100%", height: "180px" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={image.thumbnail || image.url}
                        alt={image.title}
                        referrerPolicy="no-referrer"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: loaded ? "block" : "none",
                        }}
                        onLoad={() => setLoaded(true)}
                        onError={() => setImgError(true)}
                    />
                </div>
            ) : (
                <div
                    style={{
                        width: "100%",
                        height: "180px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        background: "var(--bg-elevated)",
                        color: "var(--text-muted)",
                        fontSize: "0.75rem",
                    }}
                >
                    <AlertTriangle size={20} />
                    <span>Image unavailable</span>
                </div>
            )}

            {/* Checkbox overlay */}
            <div
                style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    background: selected ? "var(--brand)" : "rgba(0,0,0,0.55)",
                    borderRadius: "6px",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.15s",
                }}
            >
                {selected ? (
                    <CheckSquare size={16} color="white" />
                ) : (
                    <Square size={16} color="rgba(255,255,255,0.7)" />
                )}
            </div>

            {/* External link */}
            <a
                href={image.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(0,0,0,0.55)",
                    borderRadius: "6px",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    color: "white",
                    opacity: 0.7,
                    transition: "opacity 0.15s",
                }}
            >
                <ExternalLink size={12} />
            </a>

            {/* Caption */}
            <div
                style={{
                    padding: "8px 10px",
                    background: "var(--bg-card)",
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                    title={image.title}
                >
                    {image.title || "Untitled"}
                </p>
            </div>
        </div>
    );
}

export default function ImageGallery({
    images,
    selectedIds,
    onToggle,
    onSelectAll,
    onDeselectAll,
}: Props) {
    const allSelected = images.length > 0 && selectedIds.size === images.length;

    return (
        <div>
            {/* Gallery toolbar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        Results
                    </span>
                    <span
                        style={{
                            background: "rgba(99,102,241,0.15)",
                            color: "var(--brand)",
                            borderRadius: "6px",
                            padding: "2px 8px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                        }}
                    >
                        {images.length}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                        · {selectedIds.size} selected
                    </span>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        onClick={allSelected ? onDeselectAll : onSelectAll}
                        style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--border)",
                            borderRadius: "7px",
                            padding: "5px 12px",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                        }}
                    >
                        {allSelected ? <Square size={12} /> : <CheckSquare size={12} />}
                        {allSelected ? "Deselect All" : "Select All"}
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "12px",
                }}
            >
                {images.map((img) => (
                    <ImageCard
                        key={img.id}
                        image={img}
                        selected={selectedIds.has(img.id)}
                        onToggle={() => onToggle(img.id)}
                    />
                ))}
            </div>
        </div>
    );
}
