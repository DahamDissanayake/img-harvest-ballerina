"use client";

import { Globe, Github } from "lucide-react";

export default function Footer() {
    return (
        <footer
            style={{
                borderTop: "1px solid var(--border)",
                padding: "24px 0",
                background: "var(--bg-primary)",
            }}
        >
            <div
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                }}
            >
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    &copy; {new Date().getFullYear()} Daham Dissanayake. All rights reserved.
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <a
                        href="https://daham.serenedge.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                            textDecoration: "none",
                            transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                    >
                        <Globe size={14} />
                        Website
                    </a>
                    <a
                        href="https://github.com/DahamDissanayake"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                            textDecoration: "none",
                            transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                    >
                        <Github size={14} />
                        GitHub
                    </a>
                </div>
            </div>
        </footer>
    );
}
