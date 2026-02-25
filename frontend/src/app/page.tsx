"use client";

import { useState, useCallback, useRef } from "react";
import JSZip from "jszip";
import SearchForm, { SearchFormValues } from "@/components/SearchForm";
import ImageGallery, { ImageResult } from "@/components/ImageGallery";
import DownloadBar, { DownloadProgress } from "@/components/DownloadBar";
import ProgressBar from "@/components/ProgressBar";
import { useSession } from "@/contexts/SessionContext";
import { Layers, ArrowDown } from "lucide-react";

// ── Concurrency helper ──────────────────────────────────────────────────────
async function parallelMap<T, R>(
    items: T[],
    concurrency: number,
    fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let nextIndex = 0;

    async function worker() {
        while (nextIndex < items.length) {
            const i = nextIndex++;
            results[i] = await fn(items[i], i);
        }
    }

    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
    await Promise.all(workers);
    return results;
}

export default function Home() {
    const { sessionEmail } = useSession();

    const [images, setImages] = useState<ImageResult[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const [currentKeyword, setCurrentKeyword] = useState("");

    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
        phase: "idle",
        current: 0,
        total: 0,
    });

    const abortRef = useRef<AbortController | null>(null);

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
                console.log("[Search] Got results:", results.length, "sample:", results[0]);
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

    // ── Download (client-side with real progress) ─────────────────────────────
    const handleDownload = useCallback(async () => {
        const selectedUrls = images
            .filter((img) => selectedIds.has(img.id))
            .map((img) => img.url);

        const total = selectedUrls.length;
        if (total === 0) return;

        setDownloadError(null);
        setDownloadProgress({ phase: "downloading", current: 0, total });

        const abort = new AbortController();
        abortRef.current = abort;

        try {
            // Stream images directly into ZIP to reduce peak memory
            const zip = new JSZip();
            let completed = 0;
            let succeeded = 0;

            await parallelMap(selectedUrls, 6, async (url, index) => {
                if (abort.signal.aborted) throw new Error("Cancelled");

                try {
                    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
                    const res = await fetch(proxyUrl, { signal: abort.signal });

                    if (!res.ok) throw new Error(`HTTP ${res.status}`);

                    // Use arrayBuffer to avoid holding blob + buffer simultaneously
                    const buffer = await res.arrayBuffer();

                    // Derive file extension from content-type
                    const contentType = res.headers.get("content-type") || "";
                    let ext = "jpg";
                    if (contentType.includes("png")) ext = "png";
                    else if (contentType.includes("webp")) ext = "webp";
                    else if (contentType.includes("gif")) ext = "gif";
                    else if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = "jpg";

                    // Add directly to ZIP — no intermediate array
                    zip.file(`image_${index + 1}.${ext}`, buffer);
                    succeeded++;
                } catch {
                    // skip failed images
                }

                completed++;
                setDownloadProgress({ phase: "downloading", current: completed, total });
            });

            if (succeeded === 0) {
                throw new Error("No images could be downloaded");
            }

            // Phase 2: Create ZIP
            setDownloadProgress({ phase: "zipping", current: succeeded, total: succeeded });

            const zipBlob = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: { level: 3 }, // faster compression for large batches
            });

            // Phase 3: Trigger browser download
            const downloadUrl = URL.createObjectURL(zipBlob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `dataset_${currentKeyword.replace(/\s+/g, "_")}.zip`;
            a.click();
            URL.revokeObjectURL(downloadUrl);

            setDownloadProgress({ phase: "done", current: succeeded, total: succeeded });

            // Warn if some failed
            const failed = total - succeeded;
            if (failed > 0) {
                setDownloadError(`${failed} image(s) couldn't be downloaded`);
            }

            // Reset after 3s
            setTimeout(() => {
                setDownloadProgress({ phase: "idle", current: 0, total: 0 });
            }, 3000);
        } catch (err: unknown) {
            if (!abort.signal.aborted) {
                setDownloadError(err instanceof Error ? err.message : "Download failed");
            }
            setDownloadProgress({ phase: "error", current: 0, total: 0 });
        } finally {
            abortRef.current = null;
        }
    }, [images, selectedIds, currentKeyword]);

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
                            background: "var(--accent-glow)",
                            border: "1px solid rgba(227,197,134,0.2)",
                            borderRadius: "20px",
                            padding: "5px 14px",
                            marginBottom: "16px",
                            fontSize: "0.78rem",
                            color: "var(--accent)",
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
                            color: "var(--accent)",
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
                            {searchError}
                        </div>
                    )}
                </div>

                {/* Search progress */}
                {searching && (
                    <div style={{ maxWidth: "700px", margin: "-20px auto 30px" }}>
                        <ProgressBar
                            visible={true}
                            label="Searching for images..."
                            detail="Querying SerpApi"
                        />
                    </div>
                )}

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
                        <p style={{ fontSize: "0.82rem", marginTop: "4px" }}>Try searching for anything — cats, landscapes, PCBs...</p>
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
                downloadProgress={downloadProgress}
                downloadError={downloadError}
            />
        </>
    );
}
