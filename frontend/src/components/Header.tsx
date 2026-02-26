"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
    const { data: session } = useSession();

    return (
        <header
            style={{
                background: "rgba(23,23,23,0.95)",
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
                    <div>
                        <div style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "var(--accent)" }}>
                            ImgHarvest
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            Image Harvester for Datasets
                        </div>
                    </div>
                </div>

                {/* Session Bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {session ? (
                        <>
                            {session.user?.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={session.user.image}
                                    alt="Avatar"
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        border: "1px solid var(--border)",
                                        objectFit: "cover"
                                    }}
                                />
                            )}
                            <button
                                onClick={() => signOut()}
                                style={{
                                    background: "var(--bg-card)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "7px",
                                    padding: "5px 12px",
                                    color: "var(--text-secondary)",
                                    cursor: "pointer",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                }}
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="btn-brand"
                            style={{
                                padding: "8px 16px",
                                fontSize: "0.85rem",
                                textDecoration: "none",
                                display: "inline-block"
                            }}
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
