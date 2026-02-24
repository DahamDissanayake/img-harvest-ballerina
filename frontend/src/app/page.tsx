"use client";

import { useState, useCallback } from "react";
import SearchForm, { SearchFormValues } from "@/components/SearchForm";
import ImageGallery, { ImageResult } from "@/components/ImageGallery";
import DownloadBar from "@/components/DownloadBar";
import { useSession } from "@/contexts/SessionContext";
import { Layers, ArrowDown } from "lucide-react";

export default function Home() {
    const { sessionEmail } = useSession();

    const [images, setImages] = useState<ImageResult[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const [currentKeyword, setCurrentKeyword] = useState("");

    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const [downloading, setDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    // ── Search ────────────────────────────────────────────────────────────────
    const handleSearch = useCallback(
        async ({ keyword, count }: SearchFormValues) => {
            if (!sessionEmail) {
                setSearchError("Please set a session email in the header first.");
                return;
            }
            setSearching(true);
            setSearchError(null);
            setImages([]);
            setSelectedIds(new Set());
            setCurrentKeyword(keyword);

            try {
                const res = await fetch("/api/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ keyword, count, sessionEmail }),
                });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Search failed");

                const results: ImageResult[] = data.images ?? [];
                setImages(results);
                // Select all by default
                setSelectedIds(new Set(results.map((r) => r.id)));
            } catch (err: unknown) {
                setSearchError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setSearching(false);
            }
        },
        [sessionEmail]
    );

    // ── Selection ─────────────────────────────────────────────────────────────
    const handleToggle = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelectedIds(new Set(images.map((i) => i.id)));
    }, [images]);

    const handleDeselectAll = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    // ── Download ──────────────────────────────────────────────────────────────
    const handleDownload = useCallback(async () => {
        setDownloading(true);
        setDownloadError(null);

        const selectedUrls = images
            .filter((img) => selectedIds.has(img.id))
            .map((img) => img.url);

        try {
            const res = await fetch("/api/download", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionEmail, imageUrls: selectedUrls }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Download failed");
            }

            // Trigger browser download
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `dataset_${currentKeyword.replace(/\s+/g, "_")}.zip`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err: unknown) {
            setDownloadError(err instanceof Error ? err.message : "Download failed");
        } finally {
            setDownloading(false);
        }
    }, [images, selectedIds, sessionEmail, currentKeyword]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <div
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                style={{ paddingTop: "40px", paddingBottom: "120px" }}
            >
                {/* Hero */}
                <div style={{ textAlign: "center", marginBottom: "40px" }} className="animate-fade-in">
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "rgba(99,102,241,0.1)",
                            border: "1px solid rgba(99,102,241,0.2)",
                            borderRadius: "20px",
                            padding: "5px 14px",
                            marginBottom: "16px",
                            fontSize: "0.78rem",
                            color: "var(--brand)",
                            fontWeight: 600,
                        }}
                    >
                        <Layers size={12} />
                        ML-Ready Image Datasets in seconds
                    </div>
                    <h1
                        style={{
                            fontSize: "clamp(2rem, 5vw, 3.5rem)",
                            fontWeight: 800,
                            lineHeight: 1.1,
                            letterSpacing: "-0.03em",
                            background: "linear-gradient(135deg, #f0f0f5 30%, #6366f1)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            margin: "0 0 12px",
                        }}
                    >
                        Harvest. Review. Download.
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "500px", margin: "0 auto" }}>
                        Search the web for images, handpick what you want, and get a perfectly
                        formatted dataset ZIP — ready for training.
                    </p>
                </div>

                {/* Search Form */}
                <div style={{ maxWidth: "700px", margin: "0 auto 40px" }} className="animate-slide-up">
                    <SearchForm
                        onSearch={handleSearch}
                        loading={searching}
                        sessionEmail={sessionEmail}
                    />
                    {searchError && (
                        <div
                            style={{
                                marginTop: "12px",
                                padding: "10px 16px",
                                background: "rgba(239,68,68,0.1)",
                                border: "1px solid rgba(239,68,68,0.25)",
                                borderRadius: "8px",
                                color: "#ef4444",
                                fontSize: "0.85rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            ⚠️ {searchError}
                        </div>
                    )}
                </div>

                {/* Empty state */}
                {images.length === 0 && !searching && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "var(--text-muted)",
                        }}
                    >
                        <ArrowDown size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                        <p style={{ fontSize: "1rem" }}>Your image gallery will appear here</p>
                        <p style={{ fontSize: "0.82rem", marginTop: "4px" }}>Try searching for anything — cats, landscapes, PCBs…</p>
                    </div>
                )}

                {/* Searching skeleton */}
                {searching && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                            gap: "12px",
                        }}
                    >
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={i}
                                className="skeleton"
                                style={{ borderRadius: "12px", height: "210px" }}
                            />
                        ))}
                    </div>
                )}

                {/* Gallery */}
                {images.length > 0 && (
                    <ImageGallery
                        images={images}
                        selectedIds={selectedIds}
                        onToggle={handleToggle}
                        onSelectAll={handleSelectAll}
                        onDeselectAll={handleDeselectAll}
                    />
                )}
            </div>

            {/* Sticky Download Bar */}
            <DownloadBar
                selectedCount={selectedIds.size}
                totalCount={images.length}
                onDownload={handleDownload}
                downloading={downloading}
                downloadError={downloadError}
            />
        </>
    );
}
