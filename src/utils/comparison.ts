import type { Property, EnergyClass } from "../types/property";
import i18n from "../i18n";

export type ComparisonMode =
    | "quality-price"
    | "cheapest"
    | "best-quality"
    | "spacious"
    | "energy-efficient"
    | "most-complete"
    | "custom";

export interface ComparisonResult {
    winner: Property;
    rankings: Property[];
    explanation: string;
    pairwiseDetails: {
        propertyId: string;
        advantages: string[];
        disadvantages: string[];
        priceDifference?: {
            percent: number;
            absolute: number;
        };
    }[];
    metrics: {
        labels: string[];
        datasets: {
            name: string;
            values: number[];
        }[];
    };
}

// Mappa classe energetica → punteggio numerico (più alto = migliore)
const energyScore: Record<EnergyClass, number> = {
    A4: 10,
    A3: 9,
    A2: 8,
    A1: 7,
    B: 6,
    C: 5,
    D: 4,
    E: 3,
    F: 2,
    G: 1,
};

// Normalizzazione min–max per un array di valori
function normalize(values: number[]): number[] {
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (max === min) return values.map(() => 0.5);
    return values.map((v) => (v - min) / (max - min));
}

// Estrae metriche quantitative da un immobile
function extractFeatures(property: Property): Record<string, number> {
    return {
        area: property.metriQuadri,
        rooms: property.locali,
        bedrooms: property.camereDaLetto,
        bathrooms: property.bagni,
        energy: energyScore[property.classeEnergetica] || 1,
        garage: property.boxAuto,
        balconies: property.balconi,
        garden: property.giardino !== "Nessuno" ? 1 : 0,
        elevator: property.ascensore ? 1 : 0,
        furnished: property.arredato ? 1 : 0,
        terrace: property.terrazzi ? 1 : 0,
        cellar: property.cantina ? 1 : 0,
    };
}

// Calcola qualità complessiva (somma dei valori normalizzati)
function calculateQuality(property: Property, allProperties: Property[]): number {
    const features = allProperties.map((p) => extractFeatures(p));
    const current = extractFeatures(property);

    const keys = Object.keys(current);
    let totalQuality = 0;
    for (const key of keys) {
        const values = features.map((f) => f[key]);
        const norm = normalize(values);
        const idx = features.indexOf(current);
        totalQuality += norm[idx] || 0;
    }
    return totalQuality;
}

// Genera spiegazione testuale (tradotta)
function generateExplanation(
    winner: Property,
    others: Property[],
): string {
    const t = i18n.t;
    const lines: string[] = [];
    const winnerPrice = winner.prezzo;
    const winnerArea = winner.metriQuadri;

    lines.push(`🏆 **${t("compare.vincitore")}: ${winner.nome}**`);
    lines.push(
        `   ${t("property.prezzo")}: ${winnerPrice.toLocaleString()} € · ${winnerArea} ${t("property.metri").toLowerCase()}`
    );

    for (const other of others) {
    const diffPrice = other.prezzo - winnerPrice;
    const diffArea = other.metriQuadri - winnerArea;
    const percPrice = ((diffPrice / winnerPrice) * 100).toFixed(1);
    const percPriceNum = Number(percPrice); // <-- CONVERTI A NUMERO

    lines.push(`\n📊 **${t("compare.confronto_con")} ${other.nome}:**`);
    if (diffPrice > 0) {
        lines.push(
            `   ${t("compare.costa_piu")} **${percPrice}%** (${diffPrice.toLocaleString()} €).`
        );
    } else if (diffPrice < 0) {
        lines.push(
            `   ${t("compare.costa_meno")} **${Math.abs(percPriceNum)}%** (${Math.abs(diffPrice).toLocaleString()} €).`
        );
    } else {
        lines.push(`   ${t("compare.stesso_prezzo")}`);
    }

        const advantages: string[] = [];

        // Vantaggi strutturali
        if (diffArea > 0) advantages.push(`+${diffArea} ${t("property.metri").toLowerCase()}`);
        if (other.locali > winner.locali)
            advantages.push(`+${other.locali - winner.locali} ${t("property.locali").toLowerCase()}`);
        if (other.camereDaLetto > winner.camereDaLetto)
            advantages.push(`+${other.camereDaLetto - winner.camereDaLetto} ${t("property.camere").toLowerCase()}`);
        if (other.bagni > winner.bagni)
            advantages.push(`+${other.bagni - winner.bagni} ${t("property.bagni").toLowerCase()}`);
        if (other.boxAuto > winner.boxAuto)
            advantages.push(`+${other.boxAuto} ${t("property.box_auto").toLowerCase()}`);
        if (other.balconi > winner.balconi)
            advantages.push(`+${other.balconi - winner.balconi} ${t("property.balconi").toLowerCase()}`);

        // Altri vantaggi
        if (energyScore[other.classeEnergetica] > energyScore[winner.classeEnergetica]) {
            advantages.push(
                `${t("property.classe_energetica")} ${t("compare.migliore")} (${other.classeEnergetica} vs ${winner.classeEnergetica})`
            );
        }
        if (other.giardino !== "Nessuno" && winner.giardino === "Nessuno") {
            advantages.push(t("property.giardino").toLowerCase() + " " + t("compare.presente"));
        }
        if (other.ascensore && !winner.ascensore) advantages.push(t("property.ascensore").toLowerCase());
        if (other.arredato && !winner.arredato) advantages.push(t("property.arredato").toLowerCase());
        if (other.terrazzi && !winner.terrazzi) advantages.push(t("property.terrazzo").toLowerCase());
        if (other.cantina && !winner.cantina) advantages.push(t("property.cantina").toLowerCase());

        if (advantages.length > 0) {
            lines.push(`   ✅ ${t("compare.vantaggi")}: ${advantages.join(", ")}`);
        } else {
            lines.push(`   ⚠️ ${t("compare.nessun_vantaggio")}`);
        }

        // Giudizio finale
        if (diffPrice > 0 && advantages.length > 0) {
            lines.push(`   💡 ${t("compare.prezzo_giustificato")}`);
        } else if (diffPrice > 0 && advantages.length === 0) {
            lines.push(`   ❌ ${t("compare.prezzo_non_giustificato")}`);
        } else if (diffPrice < 0 && advantages.length > 0) {
            lines.push(`   🔥 ${t("compare.affare")}`);
        } else if (diffPrice < 0 && advantages.length === 0) {
            lines.push(`   👍 ${t("compare.conveniente_senza_vantaggi")}`);
        } else {
            lines.push(`   🟡 ${t("compare.preferenze_personali")}`);
        }
    }

    return lines.join("\n");
}

// Funzione principale di confronto (con messaggi di errore tradotti)
export function compareProperties(
    properties: Property[],
    mode: ComparisonMode,
    customWeights?: Record<string, number>
): ComparisonResult {
    const t = i18n.t;

    if (properties.length < 2) {
        throw new Error(t("compare.errore_almeno_2"));
    }

    const sorted = [...properties];

    // Calcola metriche per ogni immobile
    const metrics = properties.map((p) => ({
        property: p,
        quality: calculateQuality(p, properties),
        price: p.prezzo,
        area: p.metriQuadri,
        rooms: p.locali,
        energy: energyScore[p.classeEnergetica],
        completeness: Object.values(extractFeatures(p)).filter((v) => v > 0).length,
    }));

    let winner: Property;
    let rankings: Property[];

    switch (mode) {
        case "cheapest":
            rankings = sorted.sort((a, b) => a.prezzo - b.prezzo);
            winner = rankings[0];
            break;

        case "best-quality":
            rankings = sorted.sort(
                (a, b) =>
                    calculateQuality(b, properties) - calculateQuality(a, properties)
            );
            winner = rankings[0];
            break;

        case "spacious":
            rankings = sorted.sort(
                (a, b) => b.metriQuadri - a.metriQuadri || b.locali - a.locali
            );
            winner = rankings[0];
            break;

        case "energy-efficient":
            rankings = sorted.sort(
                (a, b) => energyScore[b.classeEnergetica] - energyScore[a.classeEnergetica]
            );
            winner = rankings[0];
            break;

        case "most-complete": {
            const completeness = properties.map((p) => ({
                property: p,
                count: Object.values(extractFeatures(p)).filter((v) => v > 0).length,
            }));
            rankings = completeness
                .sort((a, b) => b.count - a.count)
                .map((item) => item.property);
            winner = rankings[0];
            break;
        }

        case "custom": {
            if (!customWeights) {
                throw new Error(t("compare.errore_pesi_mancanti"));
            }
            // Calcola punteggio personalizzato
            const scored = properties.map((p) => {
                const f = extractFeatures(p);
                let score = 0;
                for (const key in customWeights) {
                    if (f[key] !== undefined) {
                        score += (f[key] / 10) * customWeights[key];
                    }
                }
                return { property: p, score };
            });
            rankings = scored.sort((a, b) => b.score - a.score).map((item) => item.property);
            winner = rankings[0];
            break;
        }

        case "quality-price":
        default: {
            // Rapporto qualità/prezzo: normalizziamo qualità e prezzo
            const qValues = metrics.map((m) => m.quality);
            const pValues = metrics.map((m) => m.price);
            const qNorm = normalize(qValues);
            const pNorm = normalize(pValues);
            // Il valore = qualità normalizzata / (prezzo normalizzato + 0.01 per evitare divisione per zero)
            const scored = metrics.map((m, i) => ({
                property: m.property,
                value: (qNorm[i] + 0.1) / (pNorm[i] + 0.1),
            }));
            rankings = scored.sort((a, b) => b.value - a.value).map((item) => item.property);
            winner = rankings[0];
            break;
        }
    }

    // Dettagli pairwise
    const others = rankings.filter((p) => p.id !== winner.id);
    const pairwiseDetails = rankings.map((p) => {
        const details: any = { propertyId: p.id, advantages: [], disadvantages: [] };
        if (p.id !== winner.id) {
            const diffPrice = p.prezzo - winner.prezzo;
            details.priceDifference = {
                absolute: diffPrice,
                percent: (diffPrice / winner.prezzo) * 100,
            };
            // Vantaggi e svantaggi rispetto al vincitore
            const fWinner = extractFeatures(winner);
            const fCurrent = extractFeatures(p);
            for (const key in fCurrent) {
                const diff = fCurrent[key] - fWinner[key];
                if (diff > 0) details.advantages.push(`${key} (+${diff})`);
                else if (diff < 0) details.disadvantages.push(`${key} (${diff})`);
            }
        }
        return details;
    });

    const explanation = generateExplanation(winner, others);

    // Preparazione dati per grafici (Radar)
    const labels = Object.keys(extractFeatures(winner));
    const datasets = rankings.map((p) => {
        const f = extractFeatures(p);
        return {
            name: p.nome,
            values: labels.map((l) => f[l] || 0),
        };
    });

    return {
        winner,
        rankings,
        explanation,
        pairwiseDetails,
        metrics: {
            labels,
            datasets,
        },
    };
}