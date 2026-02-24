"use client";

import { useState } from "react";
import { Search, Sliders, Image as ImageIcon, Loader2 } from "lucide-react";

export type ImageFormat = "png" | "jpg" | "webp";

export interface SearchFormValues {
    keyword: string;
    count: number;
    format: ImageFormat;
}

interface Props {
    onSearch: (values: SearchFormValues) => void;
    loading: boolean;
    sessionEmail: string;
}

const FORMAT_OPTIONS: { label: string; value: ImageFormat; desc: string }[] = [
    { label: "PNG", value: "png", desc: "Lossless" },
    { label: "JPG", value: "jpg", desc: "Compressed" },
    { label: "WebP", value: "webp", desc: "Modern" },
];

export default function SearchForm({ onSearch, loading, sessionEmail }: Props) {
    const [keyword, setKeyword] = useState("");
    const [count, setCount] = useState(20);
    const [format, setFormat] = useState<ImageFormat>("png");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;
        onSearch({ keyword: keyword.trim(), count, format });
    };

    return (
        <div className="glass-card" style={{ padding: "28px 32px" }}>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <Search size={18} color="var(--brand)" />
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                        Search & Harvest Images
                    </h2>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                    {sessionEmail
                        ? `Session: ${sessionEmail}`
                        : "⚠️ Set a session email in the header to tag your downloads"}
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Keyword */}
                <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                        KEYWORD
                    </label>
                    <input
                        type="text"
                        className="input-base"
                        placeholder="e.g. cats, cherry blossoms, circuit boards..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", fontSize: "0.95rem" }}
                        disabled={loading}
                    />
                </div>

                {/* Count + Format row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    {/* Count slider */}
                    <div>
                        <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Sliders size={12} /> IMAGE COUNT
                            </span>
                            <span style={{ color: "var(--brand)", fontWeight: 700 }}>{count}</span>
                        </label>
                        <input
                            type="range"
                            min={5}
                            max={100}
                            step={5}
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            disabled={loading}
                            style={{
                                width: "100%",
                                accentColor: "var(--brand)",
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                            <span>5</span>
                            <span>100</span>
                        </div>
                    </div>

                    {/* Format */}
                    <div>
                        <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                            <ImageIcon size={12} /> OUTPUT FORMAT
                        </label>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {FORMAT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setFormat(opt.value)}
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: "8px 6px",
                                        borderRadius: "8px",
                                        border: `1px solid ${format === opt.value ? "var(--brand)" : "var(--border)"}`,
                                        background: format === opt.value ? "rgba(99,102,241,0.15)" : "var(--bg-card)",
                                        color: format === opt.value ? "var(--brand)" : "var(--text-secondary)",
                                        cursor: loading ? "not-allowed" : "pointer",
                                        fontSize: "0.78rem",
                                        fontWeight: 700,
                                        transition: "all 0.15s",
                                        textAlign: "center",
                                    }}
                                >
                                    <div>{opt.label}</div>
                                    <div style={{ fontSize: "0.65rem", opacity: 0.7, fontWeight: 400 }}>{opt.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="btn-brand"
                    disabled={loading || !keyword.trim()}
                    style={{ padding: "12px 24px", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                            Harvesting images...
                        </>
                    ) : (
                        <>
                            <Search size={16} />
                            Search Images
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
