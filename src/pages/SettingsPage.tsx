import { useState } from "react";
import { useTranslation } from "react-i18next";
import { db } from "../database/db";
import { Download, Upload, AlertTriangle, FileSpreadsheet, Globe } from "lucide-react";
import { useLogStore } from "../store/logStore";

export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [messaggio, setMessaggio] = useState<{
        testo: string;
        tipo: "success" | "error";
    } | null>(null);
    const { aggiungiLog } = useLogStore();

    // Funzione per tradurre la tipologia
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

    // Funzione per tradurre i valori booleani
    const translateBoolean = (value: boolean): string => {
        return value ? t("common.si") : t("common.no");
    };

    // Funzione per tradurre il giardino
    const translateGarden = (value: string): string => {
        if (value === "Nessuno") return t("common.nessuno");
        if (value === "Privato") return t("common.privato");
        if (value === "Comune") return t("common.comune");
        return value;
    };

    // Funzione per tradurre un array di stringhe
    const translateArray = (arr: string[]): string => {
        return arr.map((item) => t(item)).join(", ");
    };

    // Cambia lingua
    const cambiaLingua = (lang: string) => {
        i18n.changeLanguage(lang);
        const nomeLingua = lang === "it" ? t("settings.italiano") : t("settings.inglese");
        aggiungiLog(t("logs.lingua_cambiata", { lingua: nomeLingua }));
    };

    // Esporta JSON
    const esportaJSON = async () => {
        try {
            setLoading(true);
            const immobili = await db.immobili.toArray();
            const storico = await db.storico.toArray();

            const data = {
                versione: "1.0",
                dataEsportazione: new Date().toISOString(),
                immobili,
                storico,
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `backup_confronto_immobili_${new Date().toISOString().split("T")[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);

            aggiungiLog(t("logs.backup_esportato"));
            setMessaggio({
                testo: t("logs.backup_esportato_successo"),
                tipo: "success",
            });
        } catch (error) {
            console.error(error);
            setMessaggio({
                testo: t("logs.backup_esportato_errore"),
                tipo: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // Esporta CSV con traduzioni
    const esportaCSV = async () => {
        try {
            setLoading(true);
            const immobili = await db.immobili.toArray();

            if (immobili.length === 0) {
                setMessaggio({
                    testo: t("logs.csv_nessun_immobile"),
                    tipo: "error",
                });
                setLoading(false);
                return;
            }

            // Definisce le colonne del CSV (tradotte)
            const colonne = [
                t("csv.id"),
                t("csv.nome"),
                t("csv.prezzo"),
                t("csv.metri_quadri"),
                t("csv.tipologia"),
                t("csv.locali"),
                t("csv.camere"),
                t("csv.bagni"),
                t("csv.box_auto"),
                t("csv.balconi"),
                t("csv.terrazzo"),
                t("csv.cantina"),
                t("csv.giardino"),
                t("csv.classe_energetica"),
                t("csv.piano"),
                t("csv.piani_edificio"),
                t("csv.ascensore"),
                t("csv.arredato"),
                t("csv.riscaldamento"),
                t("csv.climatizzazione"),
                t("csv.altre_caratteristiche"),
                t("csv.url"),
                t("csv.note"),
                t("csv.data_acquisizione"),
                t("csv.data_creazione"),
                t("csv.data_aggiornamento"),
            ];

            // Funzione per gestire i campi che possono contenere virgole
            const escapeCsv = (val: any): string => {
                if (val === null || val === undefined) return "";
                const stringVal = String(val);
                if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n")) {
                    return `"${stringVal.replace(/"/g, '""')}"`;
                }
                return stringVal;
            };

            // Crea le righe del CSV con valori tradotti
            const righe = immobili.map((p) => {
                const row = [
                    escapeCsv(p.id),
                    escapeCsv(p.nome),
                    escapeCsv(p.prezzo),
                    escapeCsv(p.metriQuadri),
                    escapeCsv(translateTipologia(p.tipologia)),
                    escapeCsv(p.locali),
                    escapeCsv(p.camereDaLetto),
                    escapeCsv(p.bagni),
                    escapeCsv(p.boxAuto),
                    escapeCsv(p.balconi),
                    escapeCsv(translateBoolean(p.terrazzi)),
                    escapeCsv(translateBoolean(p.cantina)),
                    escapeCsv(translateGarden(p.giardino)),
                    escapeCsv(p.classeEnergetica),
                    escapeCsv(p.piano),
                    escapeCsv(p.pianiEdificio),
                    escapeCsv(translateBoolean(p.ascensore)),
                    escapeCsv(translateBoolean(p.arredato)),
                    escapeCsv(translateArray(p.riscaldamento)),
                    escapeCsv(translateArray(p.climatizzazione)),
                    escapeCsv(translateArray(p.altreCaratteristiche)),
                    escapeCsv(p.url),
                    escapeCsv(p.note),
                    escapeCsv(new Date(p.dataAcquisizione).toLocaleDateString("it-IT")),
                    escapeCsv(new Date(p.createdAt).toLocaleDateString("it-IT")),
                    escapeCsv(new Date(p.updatedAt).toLocaleDateString("it-IT")),
                ];
                return row.join(",");
            });

            // Costruisce il contenuto CSV
            const header = colonne.join(",");
            const csvContent = [header, ...righe].join("\n");

            // Aggiunge il BOM per supportare i caratteri speciali in Excel
            const blob = new Blob(["\uFEFF" + csvContent], {
                type: "text/csv;charset=utf-8",
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `immobili_${new Date().toISOString().split("T")[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);

            aggiungiLog(t("logs.csv_esportato", { count: immobili.length }));
            setMessaggio({
                testo: t("logs.csv_esportato_successo", { count: immobili.length }),
                tipo: "success",
            });
        } catch (error) {
            console.error(error);
            setMessaggio({
                testo: t("logs.csv_esportato_errore"),
                tipo: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // Importa JSON
    const importaJSON = async (file: File) => {
        if (!file) return;

        const conferma = window.confirm(
            "⚠️ ATTENZIONE: Questo eliminerà tutti i dati correnti e li sostituirà con quelli del backup. Sei sicuro di voler continuare?"
        );
        if (!conferma) return;

        try {
            setLoading(true);
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.immobili || !data.storico) {
                throw new Error("File JSON non valido: mancano le proprietà 'immobili' o 'storico'.");
            }

            await db.immobili.clear();
            await db.storico.clear();
            await db.immobili.bulkAdd(data.immobili);
            await db.storico.bulkAdd(data.storico);

            aggiungiLog(t("logs.backup_ripristinato", { count: data.immobili.length }));
            setMessaggio({
                testo: t("logs.ripristino_successo", {
                    count: data.immobili.length,
                    historyCount: data.storico.length,
                }),
                tipo: "success",
            });

            setTimeout(() => window.location.reload(), 1500);
        } catch (error: any) {
            console.error(error);
            setMessaggio({
                testo: t("logs.ripristino_errore", { error: error.message }),
                tipo: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const gestisciUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            importaJSON(file);
        }
        e.target.value = "";
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">{t("settings.title")}</h1>

            {messaggio && (
                <div
                    className={`p-4 rounded-xl border ${
                        messaggio.tipo === "success"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-red-50 border-red-200 text-red-700"
                    }`}
                >
                    {messaggio.testo}
                </div>
            )}

            {/* Selettore lingua */}
            <div className="bg-white rounded-2xl border border-gray-300 p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Globe size={20} />
                    {t("settings.lingua")}
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                    {t("settings.lingua_desc")}
                </p>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => cambiaLingua("it")}
                        className={`px-6 py-2.5 rounded-xl border transition ${
                            i18n.language === "it"
                                ? "bg-orange-600 text-white border-blue-600 hover:bg-orange-700"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                        🇮🇹 {t("settings.italiano")}
                    </button>
                    <button
                        onClick={() => cambiaLingua("en")}
                        className={`px-6 py-2.5 rounded-xl border transition ${
                            i18n.language === "en"
                                ? "bg-orange-600 text-white border-blue-600 hover:bg-orange-700"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                        🇬🇧 {t("settings.inglese")}
                    </button>
                </div>
            </div>

            {/* Backup e ripristino */}
            <div className="bg-white rounded-2xl border border-gray-300 p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">{t("settings.backup")}</h2>
                <p className="text-gray-500 text-sm mb-4">
                    {t("settings.backup_desc")}
                </p>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={esportaJSON}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-800 transition disabled:opacity-50"
                    >
                        <Download size={18} />
                        {loading ? t("common.caricamento") : t("settings.esporta_json")}
                    </button>
                    <label className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-800 transition cursor-pointer">
                        <Upload size={18} />
                        {t("settings.importa_json")}
                        <input
                            type="file"
                            accept=".json"
                            onChange={gestisciUpload}
                            className="hidden"
                        />
                    </label>
                </div>
                <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {t("settings.attenzione_import")}
                </div>
            </div>

            {/* Esporta CSV */}
            <div className="bg-white rounded-2xl border border-gray-300 p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">{t("settings.esporta_csv")}</h2>
                <p className="text-gray-500 text-sm mb-4">
                    {t("settings.csv_desc")}
                </p>
                <button
                    onClick={esportaCSV}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-800 transition disabled:opacity-50"
                >
                    <FileSpreadsheet size={18} />
                    {loading ? t("common.caricamento") : t("settings.esporta_csv")}
                </button>
                <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                    <span>📋 {t("settings.csv_include")}</span>
                </div>
            </div>

            {/* Info database */}
            <div className="bg-dark rounded-2xl border border-gray-300 p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-2">{t("settings.info_db")}</h2>
                <p className="text-sm text-gray-500">
                    {t("settings.dati_locali")}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                    {t("app.version")} 1.0 · {t("settings.versione_db")} 4
                </p>
            </div>
        </div>
    );
}