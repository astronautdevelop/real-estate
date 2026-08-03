import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { db } from "../database/db";
import type { PropertyHistory } from "../types/history";
import { formatPrice } from "../utils/formatters";
import { ExternalLink, Trash2, Trash } from "lucide-react";
import { useLogStore } from "../store/logStore";

export default function HistoryPage() {
    const { t } = useTranslation();
    const [storico, setStorico] = useState<PropertyHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [eliminazioneMassiva, setEliminazioneMassiva] = useState(false);
    const navigate = useNavigate();
    const { aggiungiLog } = useLogStore();

    const caricaStorico = async () => {
        try {
            const records = await db.storico
                .orderBy("data")
                .reverse()
                .toArray();
            setStorico(records);
        } catch (error) {
            console.error("Errore nel caricamento storico:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        caricaStorico();
    }, []);

    const apriImmobile = (id: string) => {
        navigate(`/?id=${id}`);
    };

    const eliminaSingolo = async (id: string, nome: string) => {
        if (window.confirm(t("history.conferma_elimina", { nome }))) {
            await db.storico.delete(id);
            aggiungiLog(t("logs.evento_eliminato", { nome }));
            await caricaStorico();
        }
    };

    const eliminaTutti = async () => {
        if (window.confirm(t("history.conferma_elimina_tutti"))) {
            setEliminazioneMassiva(true);
            await db.storico.clear();
            aggiungiLog(t("logs.cronologia_eliminata"));
            await caricaStorico();
            setEliminazioneMassiva(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-3">
                <h1 className="text-3xl font-bold">{t("history.title")}</h1>
                <p className="text-gray-500">{t("history.caricamento")}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-3xl font-bold">{t("history.title")}</h1>
                {storico.length > 0 && (
                    <button
                        onClick={eliminaTutti}
                        disabled={eliminazioneMassiva}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition disabled:opacity-50"
                    >
                        <Trash size={18} />
                        {eliminazioneMassiva
                            ? t("common.caricamento") + "..."
                            : t("history.elimina_tutti")}
                    </button>
                )}
            </div>

            {storico.length === 0 ? (
                <p className="text-gray-500">{t("history.nessuno")}</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {storico.map((record) => (
                        <div
                            key={record.id}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    {record.immobile.immagine && (
                                        <img
                                            src={record.immobile.immagine}
                                            alt={record.immobile.nome}
                                            className="w-12 h-12 object-cover rounded-full border"
                                        />
                                    )}
                                    <div>
                                        <h3 className="font-bold text-lg">
                                            {record.immobile.nome}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {record.immobile.tipologia} ·{" "}
                                            {record.immobile.metriQuadri} m²
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {t("property.prezzo")}:{" "}
                                            {formatPrice(record.immobile.prezzo)} €
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {t("property.acquisito")}:{" "}
                                            {new Date(
                                                record.immobile.dataAcquisizione
                                            ).toLocaleDateString("it-IT")}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {t("history.salvato_in_cronologia")}:{" "}
                                            {new Date(record.data).toLocaleString("it-IT")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => apriImmobile(record.propertyId)}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                                >
                                    <ExternalLink size={18} />
                                    {t("history.apri")}
                                </button>
                                <button
                                    onClick={() =>
                                        eliminaSingolo(record.id, record.immobile.nome)
                                    }
                                    className="flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition"
                                >
                                    <Trash2 size={18} />
                                    {t("history.elimina")}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}