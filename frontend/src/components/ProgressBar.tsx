"use client";

interface Props {
    /** 0-100 for determinate, undefined for indeterminate */
    progress?: number;
    /** Label shown above the bar */
    label?: string;
    /** Detail text like "12 / 50 images" */
    detail?: string;
    /** Show or hide the component */
    visible: boolean;
}

export default function ProgressBar({ progress, label, detail, visible }: Props) {
    if (!visible) return null;

    const indeterminate = progress === undefined;

    return (
        <div
            style={{
                width: "100%",
                padding: "0",
                animation: "fadeIn 0.2s ease",
            }}
        >
            {/* Labels row */}
            {(label || detail) && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                    }}
                >
                    {label && (
                        <span
                            style={{
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                color: "var(--text-secondary)",
                            }}
                        >
                            {label}
                        </span>
                    )}
                    {detail && (
                        <span
                            style={{
                                fontSize: "0.78rem",
                                color: "var(--text-muted)",
                                fontVariantNumeric: "tabular-nums",
                            }}
                        >
                            {detail}
                        </span>
                    )}
                </div>
            )}

            {/* Bar track */}
            <div
                style={{
                    width: "100%",
                    height: "6px",
                    borderRadius: "3px",
                    background: "var(--bg-elevated)",
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                {/* Fill */}
                <div
                    style={{
                        height: "100%",
                        borderRadius: "3px",
                        background: "linear-gradient(90deg, #6366f1, #818cf8)",
                        transition: indeterminate ? "none" : "width 0.3s ease",
                        width: indeterminate ? "40%" : `${Math.min(progress, 100)}%`,
                        ...(indeterminate
                            ? {
                                animation: "progressSlide 1.2s ease-in-out infinite",
                            }
                            : {}),
                    }}
                />
            </div>

            {/* Percentage */}
            {!indeterminate && (
                <div
                    style={{
                        textAlign: "right",
                        marginTop: "4px",
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                        fontVariantNumeric: "tabular-nums",
                    }}
                >
                    {Math.round(progress)}%
                </div>
            )}

            <style jsx>{`
                @keyframes progressSlide {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(350%);
                    }
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-4px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
