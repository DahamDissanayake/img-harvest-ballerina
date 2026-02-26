"use client";

import { useState } from "react";
import { Search, Sliders, Loader2, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";

export interface SearchFormValues {
    keyword: string;
    count: number;
}

interface Props {
    onSearch: (values: SearchFormValues) => void;
    loading: boolean;
}

export default function SearchForm({ onSearch, loading }: Props) {
    const { data: session } = useSession();
    const [keyword, setKeyword] = useState("");
    const [count, setCount] = useState(20);
    const [refining, setRefining] = useState(false);
    const [refinedQuery, setRefinedQuery] = useState<string | null>(null);
    const [refineError, setRefineError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;
        onSearch({ keyword: keyword.trim(), count });
    };

    const handleRefine = async () => {
        if (!keyword.trim()) return;
        setRefining(true);
        setRefineError(null);
        setRefinedQuery(null);

        try {
            const res = await fetch("/api/refine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keyword: keyword.trim() }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Refinement failed");

            setRefinedQuery(data.refined);
        } catch (err: unknown) {
            setRefineError(err instanceof Error ? err.message : "Refinement failed");
        } finally {
            setRefining(false);
        }
    };

    const applyRefined = () => {
        if (refinedQuery) {
            setKeyword(refinedQuery);
            setRefinedQuery(null);
        }
    };

    return (
        <div className="glass-card" style={{ padding: "28px 32px" }}>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <Search size={18} color="var(--accent)" />
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                        Search &amp; Harvest Images
                    </h2>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                    {session?.user?.email
                        ? `Logged in as: ${session.user.email}`
                        : "Please log in to harvest and tag your downloads"}
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Keyword */}
                <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                        WHAT YOU WANT TO SEARCH
                    </label>
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            className="input-base"
                            placeholder="e.g. cute cats sleeping, circuit board close up, sunset over mountains..."
                            value={keyword}
                            onChange={(e) => {
                                setKeyword(e.target.value);
                                setRefinedQuery(null);
                                setRefineError(null);
                            }}
                            style={{ width: "100%", padding: "10px 14px", fontSize: "0.95rem" }}
                            disabled={loading}
                        />
                    </div>

                    {/* Refine with AI button */}
                    {keyword.trim().length > 2 && !refinedQuery && (
                        <button
                            type="button"
                            onClick={handleRefine}
                            disabled={refining || loading}
                            style={{
                                marginTop: "10px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "7px 14px",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                color: "var(--accent)",
                                background: "var(--accent-glow)",
                                border: "1px solid rgba(227,197,134,0.25)",
                                borderRadius: "8px",
                                cursor: refining ? "wait" : "pointer",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                if (!refining) {
                                    e.currentTarget.style.background = "rgba(227,197,134,0.18)";
                                    e.currentTarget.style.borderColor = "rgba(227,197,134,0.4)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(227,197,134,0.1)";
                                e.currentTarget.style.borderColor = "rgba(227,197,134,0.25)";
                            }}
                        >
                            {refining ? (
                                <>
                                    <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                                    Refining...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={13} />
                                    Refine with AI
                                </>
                            )}
                        </button>
                    )}

                    {/* Refine error */}
                    {refineError && (
                        <div style={{
                            marginTop: "8px",
                            fontSize: "0.78rem",
                            color: "var(--danger)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                        }}>
                            {refineError}
                        </div>
                    )}

                    {/* Refined query suggestion */}
                    {refinedQuery && (
                        <div
                            style={{
                                marginTop: "10px",
                                padding: "12px 16px",
                                background: "var(--accent-glow)",
                                border: "1px solid rgba(227,197,134,0.2)",
                                borderRadius: "10px",
                                animation: "fadeSlideIn 0.3s ease",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                                <Sparkles size={13} color="var(--accent)" />
                                <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    AI Suggestion
                                </span>
                            </div>
                            <p style={{
                                margin: "0 0 10px",
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                color: "var(--text-primary)",
                            }}>
                                {refinedQuery}
                            </p>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    type="button"
                                    onClick={applyRefined}
                                    style={{
                                        padding: "5px 12px",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        color: "#171717",
                                        background: "var(--accent)",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                    }}
                                >
                                    Use this
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRefinedQuery(null)}
                                    style={{
                                        padding: "5px 12px",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        color: "var(--text-muted)",
                                        background: "transparent",
                                        border: "1px solid var(--border)",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Dismiss
                                </button>
                            </div>

                        </div>
                    )}
                </div>

                {/* Count slider */}
                <div>
                    <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Sliders size={12} /> IMAGE COUNT
                        </span>
                        <span style={{ color: "var(--accent)", fontWeight: 700 }}>{count}</span>
                    </label>
                    <input
                        type="range"
                        min={5}
                        max={500}
                        step={5}
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        disabled={loading}
                        style={{
                            width: "100%",
                            accentColor: "var(--accent)",
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        <span>5</span>
                        <span>500</span>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="btn-brand"
                    disabled={loading || !keyword.trim() || !session}
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
