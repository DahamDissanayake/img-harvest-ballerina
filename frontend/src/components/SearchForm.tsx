"use client";

import { useState } from "react";
import { Search, Sliders, Loader2 } from "lucide-react";

export interface SearchFormValues {
    keyword: string;
    count: number;
}

interface Props {
    onSearch: (values: SearchFormValues) => void;
    loading: boolean;
    sessionEmail: string;
}

export default function SearchForm({ onSearch, loading, sessionEmail }: Props) {
    const [keyword, setKeyword] = useState("");
    const [count, setCount] = useState(20);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;
        onSearch({ keyword: keyword.trim(), count });
    };

    return (
        <div className="glass-card" style={{ padding: "28px 32px" }}>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <Search size={18} color="var(--brand)" />
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                        Search &amp; Harvest Images
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
