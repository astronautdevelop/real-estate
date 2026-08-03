import { ComparisonAnalysis } from "../components/ui/ComparisonAnalysis";
import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePropertyStore } from "../store/propertyStore";
import { useLogStore } from "../store/logStore";
import {
    compareProperties,
    type ComparisonMode,
    type ComparisonResult,
} from "../utils/comparison";
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";
import { Check, ArrowRight, Sliders, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ComparePage() {
    const { t } = useTranslation();
    const translateRadarLabel = (label: string): string => {
    const map: Record<string, string> = {
        area: t("property.metri"),
        rooms: t("property.locali"),
        bedrooms: t("property.camere"),
        bathrooms: t("property.bagni"),
        energy: t("property.classe_energetica"),
        garage: t("property.box_auto"),
        balconies: t("property.balconi"),
        garden: t("property.giardino"),
        elevator: t("property.ascensore"),
        furnished: t("property.arredato"),
        terrace: t("property.terrazzo"),
        cellar: t("property.cantina"),
    };
    return map[label] || label;
};
    const translateTipologia = (tipologia: string): string => {
    const map: Record<string, string> = {
        "Monolocale": t("property.tipologia_monolocale"),
        "Bilocale": t("property.tipologia_bilocale"),
        "Trilocale": t("property.tipologia_trilocale"),
        "Quadrilocale": t("property.tipologia_quadrilocale"),
        "Villetta a schiera": t("property.tipologia_villetta"),
        "Villa": t("property.tipologia_villa"),
        "Rustico": t("property.tipologia_rustico"),
    };
    return map[tipologia] || tipologia;
};
    const { immobili, caricaImmobili } = usePropertyStore();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [mode, setMode] = useState<ComparisonMode>("quality-price");
    const [result, setResult] = useState<ComparisonResult | null>(null);
    const [customWeights, setCustomWeights] = useState<Record<string, number>>({
        area: 1,
        rooms: 1,
        bathrooms: 1,
        energy: 1,
        garage: 1,
        garden: 1,
        elevator: 1,
        furnished: 1,
    });
    const [exporting, setExporting] = useState(false);
    const resultRef = useRef<HTMLDivElement>(null);

    const MODES: { id: ComparisonMode; label: string; icon: string }[] = useMemo(
        () => [
            { id: "quality-price", label: t("compare.qualita_prezzo"), icon: "⚖️" },
            { id: "cheapest", label: t("compare.conveniente"), icon: "💰" },
            { id: "best-quality", label: t("compare.migliore_qualita"), icon: "⭐" },
            { id: "spacious", label: t("compare.spaziosa"), icon: "📐" },
            { id: "energy-efficient", label: t("compare.efficiente"), icon: "🌿" },
            { id: "most-complete", label: t("compare.completa"), icon: "📦" },
            { id: "custom", label: t("compare.personalizzata"), icon: "🎛️" },
        ],
        [t]
    );

    useEffect(() => {
        caricaImmobili();
    }, []);

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
        setResult(null);
    };

    const handleCompare = () => {
        if (selectedIds.length < 2) return;
        useLogStore.getState().aggiungiLog(
            t("logs.confronto", { count: selectedIds.length })
        );
        const selectedProps = immobili.filter((p) => selectedIds.includes(p.id));
        try {
            const res = compareProperties(
                selectedProps,
                mode,
                mode === "custom" ? customWeights : undefined
            );
            setResult(res);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const clearSelection = () => {
        setSelectedIds([]);
        setResult(null);
    };

const esportaPDF = async () => {
    if (!result) return;
    setExporting(true);
    try {
        // DEFINIAMO LA FUNZIONE PRIMA DI USARLA
        const cleanAndTranslateText = (text: string): string => {
            let cleaned = text
                .replace(/\*\*/g, "")
                // Sostituisci emoji
                .replace(/✅/g, "✓")
                .replace(/❌/g, "✗")
                .replace(/⚠️/g, t("common.attenzione", "ATTENZIONE"))
                .replace(/🔥/g, t("common.ottimo", "OTTIMO"))
                .replace(/💡/g, t("common.nota", "NOTA"))
                .replace(/🏆/g, t("compare.vincitore").toUpperCase())
                .replace(/📊/g, t("compare.tabella").toUpperCase())
                .replace(/📝/g, t("compare.analisi").toUpperCase())
                .replace(/📡/g, t("compare.radar").toUpperCase())
                .replace(/📈/g, t("compare.prezzo_vs_qualita").toUpperCase())
                .replace(/🎛️/g, t("compare.pesi").toUpperCase())
                .replace(/⚖️/g, t("compare.qualita_prezzo").toUpperCase())
                .replace(/💰/g, t("compare.conveniente").toUpperCase())
                .replace(/⭐/g, t("compare.migliore_qualita").toUpperCase())
                .replace(/📐/g, t("compare.spaziosa").toUpperCase())
                .replace(/🌿/g, t("compare.efficiente").toUpperCase())
                .replace(/📦/g, t("compare.completa").toUpperCase())
                // Sostituisci le chiavi di traduzione residue
                .replace(/property\.giardino/g, t("property.giardino"))
                .replace(/property\.ascensore/g, t("property.ascensore"))
                .replace(/property\.arredato/g, t("property.arredato"))
                .replace(/property\.terrazzo/g, t("property.terrazzo"))
                .replace(/property\.cantina/g, t("property.cantina"))
                .replace(/property\.prezzo/g, t("property.prezzo"))
                .replace(/property\.metri/g, t("property.metri"))
                .replace(/property\.locali/g, t("property.locali"))
                .replace(/property\.camere/g, t("property.camere"))
                .replace(/property\.bagni/g, t("property.bagni"))
                .replace(/property\.box_auto/g, t("property.box_auto"))
                .replace(/property\.balconi/g, t("property.balconi"))
                .replace(/property\.classe_energetica/g, t("property.classe_energetica"))
                .replace(/common\.si/g, t("common.si"))
                .replace(/common\.no/g, t("common.no"))
                .replace(/common\.nessuno/g, t("common.nessuno"))
                .replace(/common\.privato/g, t("common.privato"))
                .replace(/common\.comune/g, t("common.comune"))
                // Rimuovi caratteri non stampabili
                .replace(/[^\x00-\x7F]/g, "")
                // Rimuovi spazi multipli
                .replace(/\s{2,}/g, " ")
                .trim();

            return cleaned;
        };

        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        let yPos = 20;

        const checkPage = (needed: number) => {
            if (yPos + needed > pdf.internal.pageSize.getHeight() - 20) {
                pdf.addPage();
                yPos = 20;
            }
        };

            // 1. Titolo
            pdf.setFontSize(18);
            pdf.setTextColor(0, 51, 102);
            pdf.text(
                `${t("app.title")} - ${new Date().toLocaleDateString("it-IT")}`,
                pageWidth / 2,
                yPos,
                { align: "center" }
            );
            yPos += 10;

            // 2. Vincitore (SENZA duplicazione)
            pdf.setFontSize(14);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`${t("compare.vincitore")}: ${result.winner.nome}`, 14, yPos);
            yPos += 8;
            pdf.setFontSize(12);
            pdf.text(
                `${t("property.prezzo")}: ${result.winner.prezzo.toLocaleString()} € · ${result.winner.metriQuadri} ${t("property.metri").toLowerCase()} · ${result.winner.tipologia}`,
                14,
                yPos
            );
            yPos += 8;
            pdf.text(
                `${t("property.classe_energetica")}: ${result.winner.classeEnergetica} · ${result.winner.locali} ${t("property.locali").toLowerCase()}`,
                14,
                yPos
            );
            yPos += 12;

            // 3. Spiegazione (pulita e tradotta)
            checkPage(20);
            pdf.setFontSize(11);
            const explanationClean = cleanAndTranslateText(result.explanation);
            const lines = pdf.splitTextToSize(explanationClean, pageWidth - 28);
            pdf.text(lines, 14, yPos);
            yPos += lines.length * 5 + 8;

            // 4. Tabella comparativa
            checkPage(30);
            const tableData = [
                [t("compare.caratteristica"), ...result.rankings.map((p) => p.nome)],
            ];

            // Funzione per tradurre i valori della tabella
            const translateValue = (p: any, field: string): string => {
                switch (field) {
                    case "tipologia": 
                        return translateTipologia(p.tipologia);
                    case "prezzo":
                        return `${p.prezzo.toLocaleString()} €`;
                    case "metriQuadri":
                        return String(p.metriQuadri);
                    case "locali":
                        return String(p.locali);
                    case "camereDaLetto":
                        return String(p.camereDaLetto);
                    case "bagni":
                        return String(p.bagni);
                    case "classeEnergetica":
                        return p.classeEnergetica;
                    case "boxAuto":
                        return String(p.boxAuto);
                    case "balconi":
                        return String(p.balconi);
                    case "giardino":
                        if (p.giardino === "Nessuno") return t("common.nessuno");
                        if (p.giardino === "Privato") return t("common.privato");
                        if (p.giardino === "Comune") return t("common.comune");
                        return p.giardino;
                    case "ascensore":
                        return p.ascensore ? t("common.si") : t("common.no");
                    case "arredato":
                        return p.arredato ? t("common.si") : t("common.no");
                    case "terrazzi":
                        return p.terrazzi ? t("common.si") : t("common.no");
                    case "cantina":
                        return p.cantina ? t("common.si") : t("common.no");
                    default:
                        return String(p[field] ?? "—");
                }
        };

        const rows = [
            [t("property.tipologia"), ...result.rankings.map((p) => translateTipologia(p.tipologia))],
            [t("property.prezzo"), ...result.rankings.map((p) => translateValue(p, "prezzo"))],
            [t("property.metri"), ...result.rankings.map((p) => translateValue(p, "metriQuadri"))],
            [t("property.classe_energetica"), ...result.rankings.map((p) => translateValue(p, "classeEnergetica"))],
            [t("property.ascensore"), ...result.rankings.map((p) => translateValue(p, "ascensore"))],
            [t("property.locali"), ...result.rankings.map((p) => translateValue(p, "locali"))],
            [t("property.camere"), ...result.rankings.map((p) => translateValue(p, "camereDaLetto"))],
            [t("property.bagni"), ...result.rankings.map((p) => translateValue(p, "bagni"))],
            [t("property.balconi"), ...result.rankings.map((p) => translateValue(p, "balconi"))],
            [t("property.terrazzo"), ...result.rankings.map((p) => translateValue(p, "terrazzi"))],
            [t("property.arredato"), ...result.rankings.map((p) => translateValue(p, "arredato"))],
            [t("property.giardino"), ...result.rankings.map((p) => translateValue(p, "giardino"))],
            [t("property.cantina"), ...result.rankings.map((p) => translateValue(p, "cantina"))],
            [t("property.box_auto"), ...result.rankings.map((p) => translateValue(p, "boxAuto"))],
        ];

        
        autoTable(pdf, {
            head: [tableData[0]],
            body: rows,
            startY: yPos,
            theme: "striped",
            headStyles: { fillColor: [41, 128, 185] },
            styles: { fontSize: 8 },
            columnStyles: { 0: { cellWidth: 30 } },
        });
        yPos = (pdf as any).lastAutoTable.finalY + 10;

            // 5. Dati grafici
            checkPage(20);
            pdf.setFontSize(12);
            pdf.text(t("compare.dati_grafici"), 14, yPos);
            yPos += 6;
            result.metrics.datasets.forEach((ds) => {
                pdf.setFontSize(10);
                const line = `${ds.name}: ${ds.values.map((v) => v.toFixed(1)).join(" · ")}`;
                const wrapped = pdf.splitTextToSize(line, pageWidth - 28);
                pdf.text(wrapped, 14, yPos);
                yPos += wrapped.length * 4;
            });

            pdf.save(`confronto_${new Date().toISOString().split("T")[0]}.pdf`);
        } catch (error) {
            console.error("Errore esportazione PDF:", error);
            alert(t("compare.errore_pdf"));
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">{t("compare.title")}</h1>

            {/* Selezione immobili */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">
                    {t("compare.seleziona")}
                </h2>
                {immobili.length === 0 ? (
                    <p className="text-gray-500">{t("compare.nessun_immobile")}</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {immobili.map((p) => {
                            const isSelected = selectedIds.includes(p.id);
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => toggleSelection(p.id)}
                                    className={`p-3 border rounded-xl text-left transition ${
                                        isSelected
                                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                            : "border-gray-200 hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {p.immagine && (
                                            <img
                                                src={p.immagine}
                                                alt={p.nome}
                                                className="w-8 h-8 object-cover rounded-full"
                                            />
                                        )}
                                        <span className="font-medium truncate">
                                            {p.nome}
                                        </span>
                                        {isSelected && <Check size={16} className="text-blue-600 ml-auto" />}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {p.prezzo.toLocaleString()} € · {p.metriQuadri} m²
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                    <button
                        onClick={handleCompare}
                        disabled={selectedIds.length < 2}
                        className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                        <ArrowRight size={18} />
                        {t("compare.confronta")}
                    </button>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={clearSelection}
                            className="border px-4 py-2 rounded-xl hover:bg-gray-100 transition"
                        >
                            {t("compare.deseleziona")}
                        </button>
                    )}
                    <span className="text-sm text-gray-500 ml-2">
                        {selectedIds.length} {t("compare.selezionati")}
                    </span>
                </div>
            </div>

            {/* Selezione modalità */}
            <div className="bg-white rounded-2xl border border-gray-400 p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 bg-gray-200">
                    {t("compare.modalita")}
                </h2>
                <div className="flex flex-wrap gap-2">
                    {MODES.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={`px-4 py-2 rounded-xl border transition ${
                                mode === m.id
                                    ? "border-blue-500 bg-blue-50 text-blue-700 font-medium bg-yellow-100"
                                    : "border-blue-200 hover:bg-gray-50 bg-gray-100"
                            }`}
                        >
                            {m.icon} {m.label}
                        </button>
                    ))}
                </div>

                {mode === "custom" && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                            <Sliders size={18} /> {t("compare.pesi")}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(customWeights).map(([key, val]) => (
                                <div key={key}>
                                    <label className="text-sm capitalize block">
                                        {t(`property.${key}`)}
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="5"
                                        step="0.5"
                                        value={val}
                                        onChange={(e) =>
                                            setCustomWeights((prev) => ({
                                                ...prev,
                                                [key]: Number(e.target.value),
                                            }))
                                        }
                                        className="w-full"
                                    />
                                    <span className="text-xs text-gray-500">{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Risultati con esportazione PDF */}
            {result && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={esportaPDF}
                            disabled={exporting}
                            className="flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl hover:bg-red-700 transition disabled:opacity-50"
                        >
                            <FileText size={18} />
                            {exporting ? t("common.caricamento") + "..." : t("compare.esporta_pdf")}
                        </button>
                    </div>

                    <div ref={resultRef} className="space-y-6">
                        {/* Winner card */}
                        <div className="bg-gradient-to-r from-blue-100 to-indigo-50 rounded-2xl border border-blue-800 p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                {result.winner.immagine && (
                                    <img
                                        src={result.winner.immagine}
                                        alt={result.winner.nome}
                                        className="w-20 h-20 object-cover rounded-full border-2 border-blue-500"
                                    />
                                )}
                                <div>
                                    <h2 className="text-2xl font-bold text-blue-800">
                                        🏆 {result.winner.nome}
                                    </h2>
                                    <p className="text-gray-700">
                                        {result.winner.prezzo.toLocaleString()} € ·{" "}
                                        {result.winner.metriQuadri} m² ·{" "}
                                        {translateTipologia(result.winner.tipologia)} 
                                    </p>
                                    <p className="text-sm text-gray-500-bold">
                                        {t("property.classe_energetica")}:{" "}
                                        {result.winner.classeEnergetica} ·{" "}
                                        {result.winner.locali} {t("property.locali").toLowerCase()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Spiegazione */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-3">{t("compare.analisi")}</h2>
                            <div className="bg-blue-50 p-4 rounded-xl border border-gray-200 max-h-[600px] overflow-y-auto">
                                <ComparisonAnalysis explanation={result.explanation} />
                            </div>
                        </div>

                        {/* Tabella comparativa */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm overflow-x-auto">
                            <h2 className="text-lg font-semibold mb-3">{t("compare.tabella")}</h2>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 text-left">{t("compare.caratteristica")}</th>
                                        {result.rankings.map((p) => (
                                            <th key={p.id} className="p-2 text-center font-medium">
                                                {p.nome}
                                                {p.id === result.winner.id && " 🏆"}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        t("property.tipologia"),
                                        t("property.prezzo"),
                                        t("property.metri"),
                                        t("property.locali"),
                                        t("property.camere"),
                                        t("property.bagni"),
                                        t("property.classe_energetica"),
                                        t("property.box_auto"),
                                        t("property.balconi"),
                                        t("property.giardino"),
                                        t("property.ascensore"),
                                        t("property.arredato"),
                                        t("property.terrazzo"),
                                        t("property.cantina"),
                                    ].map((key) => {
                                        // Mappa per determinare quale campo visualizzare
                                        const fieldMap: Record<string, string> = {
                                            [t("property.Tipologia")]: "tipologia",
                                            [t("property.prezzo")]: "prezzo",
                                            [t("property.metri")]: "metriQuadri",
                                            [t("property.locali")]: "locali",
                                            [t("property.camere")]: "camereDaLetto",
                                            [t("property.bagni")]: "bagni",
                                            [t("property.classe_energetica")]: "classeEnergetica",
                                            [t("property.box_auto")]: "boxAuto",
                                            [t("property.balconi")]: "balconi",
                                            [t("property.giardino")]: "giardino",
                                            [t("property.ascensore")]: "ascensore",
                                            [t("property.arredato")]: "arredato",
                                            [t("property.terrazzo")]: "terrazzi",
                                            [t("property.cantina")]: "cantina",
                                        };
                                        const field = fieldMap[key] || key;

                                        return (
                                            <tr key={key} className="border-t border-gray-200">
                                                <td className="p-2 font-medium">{key}</td>
                                                {result.rankings.map((p) => {
                                                    let value: any = "";
                                                    switch (field) {
                                                        case t("property.tipologia"):
                                                            value = translateTipologia(p.tipologia);
                                                            break;
                                                        case "prezzo":
                                                            value = `${p.prezzo.toLocaleString()} €`;
                                                            break;
                                                        case "metriQuadri":
                                                            value = p.metriQuadri;
                                                            break;
                                                        case "locali":
                                                            value = p.locali;
                                                            break;
                                                        case "camereDaLetto":
                                                            value = p.camereDaLetto;
                                                            break;
                                                        case "bagni":
                                                            value = p.bagni;
                                                            break;
                                                        case "classeEnergetica":
                                                            value = p.classeEnergetica;
                                                            break;
                                                        case "boxAuto":
                                                            value = p.boxAuto;
                                                            break;
                                                        case "balconi":
                                                            value = p.balconi;
                                                            break;
                                                        case "giardino":
                                                            if (p.giardino === "Nessuno") value = t("common.nessuno");
                                                            else if (p.giardino === "Privato") value = t("common.privato");
                                                            else if (p.giardino === "Comune") value = t("common.comune");
                                                            else value = p.giardino;
                                                            break;
                                                        case "ascensore":
                                                            value = p.ascensore ? t("common.si") : t("common.no");
                                                            break;
                                                        case "arredato":
                                                            value = p.arredato ? t("common.si") : t("common.no");
                                                            break;
                                                        case "terrazzi":
                                                            value = p.terrazzi ? t("common.si") : t("common.no");
                                                            break;
                                                        case "cantina":
                                                            value = p.cantina ? t("common.si") : t("common.no");
                                                            break;
                                                        default:
                                                            value = "—";
                                                    }
                                                    return (
                                                        <td key={p.id} className="p-2 text-center">
                                                            {value}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

{/* Grafico Radar */}
<div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
    <h2 className="text-lg font-semibold mb-3">{t("compare.radar")}</h2>
    <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={result.metrics.labels.map((label, i) => {
            const row: any = { label: translateRadarLabel(label) };
            result.metrics.datasets.forEach((ds) => {
                row[ds.name] = ds.values[i];
            });
            return row;
        })}>
            <PolarGrid />
            <PolarAngleAxis dataKey="label" />
            <PolarRadiusAxis domain={[0, 10]} />
            {result.metrics.datasets.map((ds) => (
                <Radar
                    key={ds.name}
                    name={ds.name}
                    dataKey={ds.name}
                    stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                    fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                    fillOpacity={0.3}
                />
            ))}
            <Legend />
            <Tooltip />
        </RadarChart>
    </ResponsiveContainer>
</div>

                        {/* Grafico a barre */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-3">{t("compare.prezzo_vs_qualita")}</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={result.rankings.map((p) => ({
                                        nome: p.nome,
                                        [t("compare.prezzo_label")]: p.prezzo / 1000,
                                        [t("compare.qualita_label")]: Number(
                                            (calculateQuality(p, result.rankings) * 10).toFixed(1)
                                        ),
                                    }))}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <XAxis dataKey="nome" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        yAxisId="left"
                                        dataKey={t("compare.prezzo_label")}
                                        fill="#3B82F6"
                                        name={t("compare.prezzo_label") + " (k€)"}
                                    />
                                    <Bar
                                        yAxisId="right"
                                        dataKey={t("compare.qualita_label")}
                                        fill="#10B981"
                                        name={t("compare.qualita_label") + " (0-10)"}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper per il calcolo della qualità (invariato)
function calculateQuality(property: any, allProperties: any[]): number {
    const energyScore: Record<string, number> = {
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
    const features: Record<string, number>[] = allProperties.map((p) => ({
        area: p.metriQuadri,
        rooms: p.locali,
        bathrooms: p.bagni,
        energy: energyScore[p.classeEnergetica] || 1,
        garage: p.boxAuto,
        garden: p.giardino !== "Nessuno" ? 1 : 0,
        elevator: p.ascensore ? 1 : 0,
        furnished: p.arredato ? 1 : 0,
        terrace: p.terrazzi ? 1 : 0,
        cellar: p.cantina ? 1 : 0,
    }));
    const current = features.find((_, i) => allProperties[i].id === property.id);
    if (!current) return 0;
    const total = Object.keys(current).reduce((sum, key) => {
        const vals = features.map((f) => f[key] as number);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const norm = max === min ? 0.5 : (current[key] - min) / (max - min);
        return sum + norm;
    }, 0);
    return total / Object.keys(current).length;
}