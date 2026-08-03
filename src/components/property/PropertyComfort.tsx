import { useTranslation } from "react-i18next";
import type { Property, EnergyClass } from "../../types/property";

const ENERGY_CLASSES: EnergyClass[] = ["A4", "A3", "A2", "A1", "B", "C", "D", "E", "F", "G"];

const riscaldamenti = ["Autonomo", "A radiatori", "Alimentato a gas"];
const climatizzazioni = ["Freddo", "Caldo"];

interface Props {
    dati: Property;
    modifica: (campo: keyof Property, valore: any) => void;
}

export default function PropertyComfort({ dati, modifica }: Props) {
    const { t } = useTranslation();

    function toggleArray(campo: "riscaldamento" | "climatizzazione", valore: string) {
        const lista = dati[campo];

        if (lista.includes(valore)) {
            modifica(
                campo,
                lista.filter((item) => item !== valore)
            );
        } else {
            modifica(campo, [...lista, valore]);
        }
    }

    return (
        <div className="space-y-6">
            {/* Riscaldamento */}
            <div>
                <h4 className="font-semibold mb-3 bg-gray-300">
                    🔥 {t("property.riscaldamento")}
                </h4>
                <div className="space-y-2">
                    {riscaldamenti.map((item) => (
                        <label
                            key={item}
                            className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                        >
                            <input
                                type="checkbox"
                                checked={dati.riscaldamento.includes(item)}
                                onChange={() => toggleArray("riscaldamento", item)}
                            />
                            {t(`property.riscaldamento_${item}`)}
                        </label>
                    ))}
                </div>
            </div>

            {/* Climatizzazione */}
            <div>
                <h4 className="font-semibold mb-3 bg-gray-300">
                    ❄ {t("property.climatizzazione")}
                </h4>
                <div className="space-y-2">
                    {climatizzazioni.map((item) => (
                        <label
                            key={item}
                            className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                        >
                            <input
                                type="checkbox"
                                checked={dati.climatizzazione.includes(item)}
                                onChange={() => toggleArray("climatizzazione", item)}
                            />
                            {t(`property.climatizzazione_${item}`)}
                        </label>
                    ))}
                </div>
            </div>

            {/* Dettagli edificio */}
            <div className="border-t border-gray-200 pt-3 mt-2 space-y-3">
                <h4 className="text-sm font-medium text-gray-700 bg-gray-200">
                    {t("property.dettagli_edificio")}
                </h4>

                <div>
                    <label className="text-sm text-gray-500">
                        {t("property.anno_costruzione")}
                    </label>
                    <input
                        type="number"
                        min="1800"
                        max={new Date().getFullYear()}
                        value={dati.annoCostruzione || ""}
                        onChange={(e) =>
                            modifica(
                                "annoCostruzione",
                                e.target.value ? Number(e.target.value) : undefined
                            )
                        }
                        className="w-full border rounded-lg p-2"
                        placeholder={t("property.placeholder_anno")}
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-500">
                        {t("property.classe_energetica")}
                    </label>
                    <select
                        value={dati.classeEnergetica}
                        onChange={(e) =>
                            modifica("classeEnergetica", e.target.value as EnergyClass)
                        }
                        className="w-full border rounded-lg p-2"
                    >
                        {ENERGY_CLASSES.map((classe) => (
                            <option key={classe} value={classe}>
                                {classe}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-sm text-gray-500">
                        {t("property.spese_condominiali")}
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={dati.speseCondominiali || ""}
                        onChange={(e) =>
                            modifica(
                                "speseCondominiali",
                                e.target.value ? Number(e.target.value) : undefined
                            )
                        }
                        className="w-full border rounded-lg p-2"
                        placeholder={t("property.placeholder_spese")}
                    />
                    <span className="text-xs text-black-400">
                        {t("property.spese_desc")}
                    </span>
                </div>
            </div>
        </div>
    );
}