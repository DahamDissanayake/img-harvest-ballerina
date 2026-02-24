"use client";

import { useState, useRef, useEffect } from "react";
import { Database, Mail, CheckCircle, X, Zap } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";

export default function Header() {
    const { sessionEmail, setSessionEmail } = useSession();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing]);

    const handleSave = () => {
        const trimmed = draft.trim();
        if (trimmed && trimmed.includes("@")) {
            setSessionEmail(trimmed);
        }
        setEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") setEditing(false);
    };

    return (
        <header
            style={{
                background: "rgba(15,15,19,0.9)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid var(--border)",
                position: "sticky",
                top: 0,
                zIndex: 50,
            }}
        >
            <div
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                style={{ height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 0 16px rgba(99,102,241,0.4)",
                        }}
                    >
                        <Database size={18} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
                            ImgHarvest
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            ML Image Harvester
                        </div>
                    </div>
                </div>

                {/* Session Bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {!sessionEmail ? (
                        editing ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <input
                                    ref={inputRef}
                                    type="email"
                                    className="input-base"
                                    placeholder="your@email.com"
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    style={{ padding: "6px 12px", fontSize: "0.85rem", width: "200px" }}
                                />
                                <button
                                    onClick={handleSave}
                                    style={{
                                        background: "var(--brand)",
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "6px 12px",
                                        color: "white",
                                        cursor: "pointer",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { setEditing(true); setDraft(""); }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    background: "var(--bg-card)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "8px",
                                    padding: "6px 12px",
                                    color: "var(--text-secondary)",
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                    transition: "all 0.2s",
                                }}
                            >
                                <Mail size={14} />
                                Set session email
                            </button>
                        )
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "rgba(99,102,241,0.1)",
                                border: "1px solid rgba(99,102,241,0.3)",
                                borderRadius: "8px",
                                padding: "6px 12px",
                                cursor: "pointer",
                            }}
                            onClick={() => { setEditing(true); setDraft(sessionEmail); }}
                            title="Click to change email"
                        >
                            <CheckCircle size={13} color="var(--brand)" />
                            <span style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 500 }}>
                                {sessionEmail}
                            </span>
                        </div>
                    )}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "rgba(34,197,94,0.1)",
                            border: "1px solid rgba(34,197,94,0.2)",
                            borderRadius: "6px",
                            padding: "4px 8px",
                        }}
                    >
                        <Zap size={11} color="#22c55e" />
                        <span style={{ fontSize: "0.7rem", color: "#22c55e", fontWeight: 600 }}>LIVE</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
