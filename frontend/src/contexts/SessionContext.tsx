"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SessionContextType {
    sessionEmail: string;
    setSessionEmail: (email: string) => void;
}

const SessionContext = createContext<SessionContextType>({
    sessionEmail: "",
    setSessionEmail: () => { },
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [sessionEmail, setSessionEmailState] = useState<string>("");

    // Hydrate from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("dataset_dojo_email");
        if (saved) setSessionEmailState(saved);
    }, []);

    const setSessionEmail = (email: string) => {
        setSessionEmailState(email);
        localStorage.setItem("dataset_dojo_email", email);
    };

    return (
        <SessionContext.Provider value={{ sessionEmail, setSessionEmail }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    return useContext(SessionContext);
}
