"use client";

import { Download, Package, Loader2, AlertCircle } from "lucide-react";

interface Props {
    selectedCount: number;
    totalCount: number;
    onDownload: () => void;
    downloading: boolean;
    downloadError: string | null;
}

export default function DownloadBar({
    selectedCount,
    totalCount,
    onDownload,
    downloading,
    downloadError,
}: Props) {
    if (totalCount === 0) return null;

    return (
        <div
            style={{
                position: "sticky",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 40,
                padding: "16px 24px",
                background: "rgba(15,15,19,0.95)",
                backdropFilter: "blur(20px)",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
            }}
        >
            {/* Left: stats */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={16} color="var(--brand)" />
                <span style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 600 }}>
                    {selectedCount} / {totalCount} images selected
                </span>
            </div>

            {/* Right: download button + error */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {downloadError && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            color: "var(--danger)",
                            fontSize: "0.8rem",
                        }}
                    >
                        <AlertCircle size={13} />
                        {downloadError}
                    </div>
                )}

                <button
                    className="btn-brand"
                    onClick={onDownload}
                    disabled={downloading || selectedCount === 0}
                    style={{
                        padding: "10px 20px",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    {downloading ? (
                        <>
                            <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                            Packaging ZIP...
                        </>
                    ) : (
                        <>
                            <Download size={15} />
                            Download ZIP
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
