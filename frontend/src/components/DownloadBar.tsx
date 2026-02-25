"use client";

import { Download, Package, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import ProgressBar from "./ProgressBar";

export interface DownloadProgress {
    phase: "idle" | "downloading" | "zipping" | "done" | "error";
    current: number;
    total: number;
    message?: string;
}

interface Props {
    selectedCount: number;
    totalCount: number;
    onDownload: () => void;
    downloadProgress: DownloadProgress;
    downloadError: string | null;
}

export default function DownloadBar({
    selectedCount,
    totalCount,
    onDownload,
    downloadProgress,
    downloadError,
}: Props) {
    if (totalCount === 0) return null;

    const { phase, current, total } = downloadProgress;
    const isActive = phase !== "idle" && phase !== "error";
    const isDone = phase === "done";

    // Progress percentage
    let progressPct: number | undefined;
    let label = "";
    let detail = "";

    if (phase === "downloading") {
        progressPct = total > 0 ? (current / total) * 85 : 0; // 0-85%
        label = "Downloading images…";
        detail = `${current} / ${total}`;
    } else if (phase === "zipping") {
        progressPct = 90;
        label = "Creating ZIP archive…";
        detail = "";
    } else if (phase === "done") {
        progressPct = 100;
        label = "Download complete!";
    }

    return (
        <div
            style={{
                position: "sticky",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 40,
                padding: isActive || isDone ? "12px 24px 16px" : "16px 24px",
                background: "rgba(15,15,19,0.95)",
                backdropFilter: "blur(20px)",
                borderTop: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
            }}
        >
            {/* Progress bar when active */}
            <ProgressBar
                visible={isActive || isDone}
                progress={progressPct}
                label={label}
                detail={detail}
            />

            {/* Bottom row: stats + button */}
            <div
                style={{
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
                                maxWidth: "300px",
                            }}
                        >
                            <AlertCircle size={13} style={{ flexShrink: 0 }} />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {downloadError}
                            </span>
                        </div>
                    )}

                    <button
                        className="btn-brand"
                        onClick={onDownload}
                        disabled={isActive || selectedCount === 0}
                        style={{
                            padding: "10px 20px",
                            fontSize: "0.9rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {phase === "downloading" ? (
                            <>
                                <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                                Downloading {current}/{total}…
                            </>
                        ) : phase === "zipping" ? (
                            <>
                                <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                                Zipping…
                            </>
                        ) : isDone ? (
                            <>
                                <CheckCircle size={15} />
                                Done!
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
        </div>
    );
}
