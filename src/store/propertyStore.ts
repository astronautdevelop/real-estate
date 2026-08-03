import { v4 as uuid } from "uuid";
import type { Property } from "../types/property";
import { create } from "zustand";
import { db } from "../database/db";
import { useLogStore } from "./logStore";

interface PropertyStore {
    immobili: Property[];
    caricaImmobili: () => Promise<void>;
    aggiungiImmobile: (
        immobile: Omit<Property, "id" | "createdAt" | "updatedAt">
    ) => Promise<string>;
    eliminaImmobile: (id: string) => Promise<void>;
    aggiornaImmobile: (immobile: Property) => Promise<void>;
    duplicaImmobile: (id: string) => Promise<string>;
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
    immobili: [],

    caricaImmobili: async () => {
        const immobili = await db.immobili.toArray();
        // Ordina per ordine (se presente), altrimenti per data di creazione
        immobili.sort((a, b) => {
            const ordA = a.ordine ?? 0;
            const ordB = b.ordine ?? 0;
            return ordA - ordB;
        });
        set({ immobili });
    },

    aggiungiImmobile: async (immobile) => {
        const maxOrdine = get().immobili.reduce(
            (max, p) => Math.max(max, p.ordine ?? 0),
            0
        );
        const nuovoImmobile: Property = {
            ...immobile,
            id: uuid(),
            createdAt: new Date(),
            updatedAt: new Date(),
            dataAcquisizione: immobile.dataAcquisizione ?? new Date().toISOString(),
            ordine: maxOrdine + 1,
        };

        await db.immobili.add(nuovoImmobile);

        set((state) => ({
            immobili: [...state.immobili, nuovoImmobile],
        }));

        // LOG
        useLogStore.getState().aggiungiLog(`✅ Immobile "${nuovoImmobile.nome}" creato`);

        return nuovoImmobile.id;
    },

    eliminaImmobile: async (id) => {
        const immobileDaEliminare = get().immobili.find((p) => p.id === id);
        if (!immobileDaEliminare) {
            console.warn(`Immobile con id ${id} non trovato`);
            return;
        }

        await db.immobili.delete(id);

        set((state) => ({
            immobili: state.immobili.filter((immobile) => immobile.id !== id),
        }));

        // LOG
        useLogStore.getState().aggiungiLog(`🗑️ Immobile "${immobileDaEliminare.nome}" eliminato`);
    },

    aggiornaImmobile: async (immobile) => {
        const aggiornato = {
            ...immobile,
            updatedAt: new Date(),
        };

        await db.immobili.put(aggiornato);

        set((state) => ({
            immobili: state.immobili.map((item) =>
                item.id === immobile.id ? aggiornato : item
            ),
        }));

        // LOG
        useLogStore.getState().aggiungiLog(`✏️ Immobile "${immobile.nome}" aggiornato`);
    },

    duplicaImmobile: async (id) => {
        const originale = await db.immobili.get(id);
        if (!originale) throw new Error("Immobile non trovato");

        const maxOrdine = get().immobili.reduce(
            (max, p) => Math.max(max, p.ordine ?? 0),
            0
        );

        const copia: Property = {
            ...originale,
            id: uuid(),
            nome: originale.nome + " (copia)",
            createdAt: new Date(),
            updatedAt: new Date(),
            dataAcquisizione: new Date().toISOString(),
            ordine: maxOrdine + 1,
        };

        await db.immobili.add(copia);

        set((state) => ({
            immobili: [...state.immobili, copia],
        }));

        // LOG
        useLogStore.getState().aggiungiLog(`📋 Immobile "${originale.nome}" duplicato`);

        return copia.id;
    },
}));