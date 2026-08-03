import { useTranslation } from "react-i18next";
import type { Property } from "../../types/property";

interface Props {
    dati: Property;
    modifica: (campo: keyof Property, valore: any) => void;
}

export default function PropertyFeatures({ dati, modifica }: Props) {
    const { t } = useTranslation();

    return (
        <div
            style={{
                borderTop: "1px solid #ddd",
                paddingTop: 4,
                display: "flex",
                flexDirection: "column",
                gap: 3,
            }}
        >
            {/* Box Auto */}
            <label>🚗 {t("property.box_auto")}</label>
            <select
                value={dati.boxAuto}
                onChange={(e) => modifica("boxAuto", Number(e.target.value))}
            >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3+</option>
            </select>

            {/* Balconi */}
            <label>🌅 {t("property.balconi")}</label>
            <select
                value={dati.balconi}
                onChange={(e) => modifica("balconi", Number(e.target.value))}
            >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3+</option>
            </select>

            {/* Terrazzo */}
            <label>🌇 {t("property.terrazzo")}</label>
            <select
                value={dati.terrazzi ? "SI" : "NO"}
                onChange={(e) => modifica("terrazzi", e.target.value === "SI")}
            >
                <option value="NO">{t("common.no")}</option>
                <option value="SI">{t("common.si")}</option>
            </select>

            {/* Cantina */}
            <label>🗄 {t("property.cantina")}</label>
            <select
                value={dati.cantina ? "SI" : "NO"}
                onChange={(e) => modifica("cantina", e.target.value === "SI")}
            >
                <option value="NO">{t("common.no")}</option>
                <option value="SI">{t("common.si")}</option>
            </select>

            {/* Giardino */}
            <label>🌳 {t("property.giardino")}</label>
            <select
                value={dati.giardino}
                onChange={(e) => modifica("giardino", e.target.value)}
            >
                <option value="Nessuno">{t("common.nessuno")}</option>
                <option value="Privato">{t("common.privato")}</option>
                <option value="Comune">{t("common.comune")}</option>
            </select>

            {/* Ascensore */}
            <label>🛗 {t("property.ascensore")}</label>
            <select
                value={dati.ascensore ? "SI" : "NO"}
                onChange={(e) => modifica("ascensore", e.target.value === "SI")}
            >
                <option value="NO">{t("common.no")}</option>
                <option value="SI">{t("common.si")}</option>
            </select>

            {/* Arredato */}
            <label>🪑 {t("property.arredato")}</label>
            <select
                value={dati.arredato ? "SI" : "NO"}
                onChange={(e) => modifica("arredato", e.target.value === "SI")}
            >
                <option value="NO">{t("common.no")}</option>
                <option value="SI">{t("common.si")}</option>
            </select>
        </div>
    );
}