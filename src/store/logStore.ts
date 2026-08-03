import { create } from "zustand";

export interface LogEntry {
    id: string;
    messaggio: string;
    timestamp: number;
}

interface LogStore {
    logs: LogEntry[];
    aggiungiLog: (messaggio: string) => void;
    rimuoviLog: (id: string) => void;
}

export const useLogStore = create<LogStore>((set) => ({
    logs: [],
    aggiungiLog: (messaggio) => {
        const id = Date.now().toString();
        set((state) => ({
            logs: [{ id, messaggio, timestamp: Date.now() }, ...state.logs].slice(0, 5), // massimo 5 log
        }));
        // Rimuovi automaticamente dopo 6 secondi
        setTimeout(() => {
            set((state) => ({
                logs: state.logs.filter((log) => log.id !== id),
            }));
        }, 6000);
    },
    rimuoviLog: (id) => {
        set((state) => ({
            logs: state.logs.filter((log) => log.id !== id),
        }));
    },
}));