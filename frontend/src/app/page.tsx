"use client";

import { Layers, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <div 
            className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center animate-fade-in"
            style={{ paddingTop: "60px", paddingBottom: "60px" }}
        >
            {/* Badge */}
            <div
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "var(--accent-glow)",
                    border: "1px solid rgba(227,197,134,0.2)",
                    borderRadius: "20px",
                    padding: "5px 14px",
                    marginBottom: "24px",
                    fontSize: "0.85rem",
                    color: "var(--accent)",
                    fontWeight: 600,
                }}
            >
                <Layers size={14} />
                Coming Soon
            </div>

            {/* Main Heading */}
            <h1
                style={{
                    fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    color: "var(--accent)",
                    margin: "0 0 20px",
                }}
            >
                ImgHarvest
            </h1>

            {/* Subheading */}
            <p 
                style={{ 
                    color: "var(--text-secondary)", 
                    fontSize: "clamp(1.1rem, 2vw, 1.25rem)", 
                    maxWidth: "600px", 
                    margin: "0 auto 40px",
                    lineHeight: 1.6
                }}
            >
                The ultimate image harvesting and ML data preparation tool is currently under heavy development. 
                We're building something that will revolutionize how you create datasets.
            </p>

            {/* Portfolio Link */}
            <div className="flex flex-col items-center gap-4">
                <a
                    href="https://daham.serenedge.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-brand"
                    style={{
                        padding: "12px 32px",
                        fontSize: "1rem",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}
                >
                    Visit My Portfolio
                    <ExternalLink size={18} />
                </a>
                
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Stay tuned for the official launch.
                </p>
            </div>

            {/* Decorative background element */}
            <div 
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "100%",
                    height: "100%",
                    maxHeight: "600px",
                    maxWidth: "800px",
                    background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
                    zIndex: -1,
                    opacity: 0.5,
                    pointerEvents: "none"
                }}
            />
        </div>
    );
}
