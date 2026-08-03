import i18n from "../i18n";
import type { Property } from "../types/property";

export type ProfileType =
    | "family"
    | "couple"
    | "investment"
    | "elderly"
    | "smart"
    | "pets"
    | "standard";

export interface ProfileResult {
    type: ProfileType;
    label: string;
    emoji: string;
    color: string;
    description: string;
}

export function generateProfile(property: Property): ProfileResult {
    const t = i18n.t;
    const { prezzo, metriQuadri, locali, camereDaLetto, bagni, piano, ascensore, giardino, terrazzi, arredato } = property;
    const prezzoMq = prezzo / metriQuadri;

    // Inizializza punteggi per ogni profilo
    const scores: Record<ProfileType, number> = {
        family: 0,
        couple: 0,
        investment: 0,
        elderly: 0,
        smart: 0,
        pets: 0,
        standard: 1, // profilo di default
    };

    // Famiglie: camere >=3, bagni >=2, giardino, metratura >80
    if (camereDaLetto >= 3 && bagni >= 2 && metriQuadri > 80) {
        scores.family += 3;
        if (giardino !== "Nessuno") scores.family += 2;
        if (locali >= 4) scores.family += 1;
    }

    // Giovani coppie: 1-2 camere, metratura <100, prezzo non troppo alto (prezzoMq < 4000)
    if (camereDaLetto <= 2 && metriQuadri < 100 && prezzoMq < 4000) {
        scores.couple += 3;
        if (arredato) scores.couple += 1;
        if (terrazzi) scores.couple += 1;
    }

    // Investimento: prezzo/mq basso (meno di 2000 €/mq) e/o prezzo totale basso
    if (prezzoMq < 2000) {
        scores.investment += 3;
        if (metriQuadri > 60) scores.investment += 1;
    } else if (prezzo < 150000 && metriQuadri > 50) {
        scores.investment += 2;
    }

    // Anziani: piano <=1, ascensore, bagno almeno 1, metratura non enorme
    if (piano <= 1 && ascensore && metriQuadri < 120) {
        scores.elderly += 3;
        if (bagni >= 1) scores.elderly += 1;
        if (piano === 0) scores.elderly += 1;
    }

    // Smart working: locali >=3, metratura >70, camere >=2 (possibile studio)
    if (locali >= 3 && metriQuadri > 70 && camereDaLetto >= 2) {
        scores.smart += 3;
        if (metriQuadri > 90) scores.smart += 1;
    }

    // Animali: giardino o terrazzo
    if (giardino !== "Nessuno" || terrazzi) {
        scores.pets += 4;
        if (giardino === "Privato") scores.pets += 1;
    }

    // Trova il profilo con punteggio più alto
    let bestProfile: ProfileType = "standard";
    let bestScore = scores.standard;
    for (const [type, score] of Object.entries(scores)) {
        if (score > bestScore) {
            bestScore = score;
            bestProfile = type as ProfileType;
        }
    }

    // Mappa risultato (tradotto con i18n)
    const profileMap: Record<ProfileType, { labelKey: string; descKey: string; emoji: string; color: string }> = {
        family: {
            labelKey: "profile.famiglia_label",
            descKey: "profile.famiglia_desc",
            emoji: "👨‍👩‍👧‍👦",
            color: "bg-green-100 text-green-800 border-green-300",
        },
        couple: {
            labelKey: "profile.coppie_label",
            descKey: "profile.coppie_desc",
            emoji: "💑",
            color: "bg-pink-100 text-pink-800 border-pink-300",
        },
        investment: {
            labelKey: "profile.investimento_label",
            descKey: "profile.investimento_desc",
            emoji: "📈",
            color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        },
        elderly: {
            labelKey: "profile.anziani_label",
            descKey: "profile.anziani_desc",
            emoji: "🧓",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        smart: {
            labelKey: "profile.smart_label",
            descKey: "profile.smart_desc",
            emoji: "💻",
            color: "bg-purple-100 text-purple-800 border-purple-300",
        },
        pets: {
            labelKey: "profile.animali_label",
            descKey: "profile.animali_desc",
            emoji: "🐾",
            color: "bg-orange-100 text-orange-800 border-orange-300",
        },
        standard: {
            labelKey: "profile.default_label",
            descKey: "profile.default_desc",
            emoji: "🏠",
            color: "bg-gray-100 text-gray-800 border-gray-300",
        },
    };

    const selected = profileMap[bestProfile];
    return {
        type: bestProfile,
        label: t(selected.labelKey),
        emoji: selected.emoji,
        color: selected.color,
        description: t(selected.descKey),
    };
}