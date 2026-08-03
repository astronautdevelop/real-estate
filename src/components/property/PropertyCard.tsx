import {
    Trash2,
    Save,
    ExternalLink,
    Euro,
    Ruler,
    Calendar,
    Copy,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { Property } from "../../types/property";
import { usePropertyStore } from "../../store/propertyStore";
import { formatPrice, parsePrice } from "../../utils/formatters";
import { salvaStorico } from "../../utils/history";
import { generateProfile } from "../../utils/profiler";
import PropertyRooms from "./PropertyRooms";
import PropertyFeatures from "./PropertyFeatures";
import PropertyComfort from "./PropertyComfort";
import PropertyExtras from "./PropertyExtras";
import ImageUploader from "./ImageUploader";
import AccordionSection from "../ui/AccordionSection";

interface Props {
    immobile: Property;
}

// Componente per il lazy loading delle immagini con IntersectionObserver
function LazyImage({ src, alt, className }: { src: string; alt: string; className: string }) {
    const [isVisible, setIsVisible] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <img
            ref={imgRef}
            src={isVisible ? src : undefined}
            alt={alt}
            className={className}
            loading="lazy"
            style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.3s" }}
        />
    );
}

export default function PropertyCard({ immobile }: Props) {
    const { t } = useTranslation();
    const aggiornaImmobile = usePropertyStore(
        (state) => state.aggiornaImmobile
    );
    const eliminaImmobile = usePropertyStore(
        (state) => state.eliminaImmobile
    );
    const duplicaImmobile = usePropertyStore(
        (state) => state.duplicaImmobile
    );
    const navigate = useNavigate();

    const [dati, setDati] = useState<Property>(immobile);

    function modifica(campo: keyof Property, valore: any) {
        setDati({
            ...dati,
            [campo]: valore,
        });
    }

    async function salva() {
        await aggiornaImmobile(dati);
        await salvaStorico(dati);
    }

    async function duplica() {
        const nuovoId = await duplicaImmobile(immobile.id);
        navigate(`/?id=${nuovoId}`);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full max-w-md"
        >
            <ImageUploader
                immagine={dati.immagine}
                modifica={(valore) => modifica("immagine", valore)}
            />

            <div className="p-4 space-y-3">
                {/* INTESTAZIONE CON BADGE */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex items-center gap-2"
                >
                    {dati.immagine && (
                        <LazyImage
                            src={dati.immagine}
                            alt={dati.nome}
                            className="w-10 h-10 object-cover rounded-full border border-gray-300 flex-shrink-0"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold truncate">{dati.nome}</h2>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                <Calendar size={12} />
                                {new Date(dati.dataAcquisizione).toLocaleDateString("it-IT")}
                            </span>
                            {(() => {
                                const profile = generateProfile(dati);
                                return (
                                    <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded-full border ${profile.color} font-medium`}
                                        title={profile.description}
                                    >
                                        {profile.emoji} {profile.label}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>
                </motion.div>

                {/* NOME IMMOBILE */}
                <div>
                    <label className="text-xs text-gray-500">{t("property.nome")}</label>
                    <input
                        className="mt-0.5 w-full border rounded-lg p-2.5 bg-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        value={dati.nome}
                        onChange={(e) => modifica("nome", e.target.value)}
                    />
                </div>

                {/* LINK ANNUNCIO */}
                <div>
                    <label className="text-xs text-gray-500">{t("property.link")}</label>
                    <div className="flex gap-2 mt-0.5">
                        <input
                            className="flex-1 border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            value={dati.url}
                            onChange={(e) => modifica("url", e.target.value)}
                        />
                        {dati.url && (
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href={dati.url}
                                target="_blank"
                                rel="noreferrer"
                                className="border rounded-lg p-2.5 bg-blue-200 flex items-center justify-center transition hover:shadow-md"
                            >
                                <ExternalLink size={16} />
                            </motion.a>
                        )}
                    </div>
                </div>

                {/* PREZZO & METRI QUADRI */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500">{t("property.prezzo")}</label>
                        <div className="flex items-center text-black-500 gap-1 border rounded-lg px-2 bg-green-100 mt-0.5">
                            <Euro size={16} />
                            <input
                                className="w-full p-2.5 outline-none text-sm bg-transparent"
                                type="text"
                                value={formatPrice(dati.prezzo)}
                                onChange={(e) =>
                                    modifica("prezzo", parsePrice(e.target.value))
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500">{t("property.metri")}</label>
                        <div className="flex items-center gap-1 border rounded-lg px-2 bg-orange-200 mt-0.5">
                            <Ruler size={16} />
                            <input
                                className="w-full p-2.5 outline-none text-sm bg-transparent"
                                type="number"
                                value={dati.metriQuadri}
                                onChange={(e) =>
                                    modifica("metriQuadri", Number(e.target.value))
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* TIPOLOGIA */}
                <div>
                    <label className="text-xs text-gray-500">{t("property.tipologia")}</label>
                    <select
                        className="mt-0.5 w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        value={dati.tipologia}
                        onChange={(e) => modifica("tipologia", e.target.value)}
                    >
                        <option value="Monolocale">{t("property.tipologia_monolocale")}</option>
                        <option value="Bilocale">{t("property.tipologia_bilocale")}</option>
                        <option value="Trilocale">{t("property.tipologia_trilocale")}</option>
                        <option value="Quadrilocale">{t("property.tipologia_quadrilocale")}</option>
                        <option value="Villetta a schiera">{t("property.tipologia_villetta")}</option>
                        <option value="Villa">{t("property.tipologia_villa")}</option>
                        <option value="Rustico">{t("property.tipologia_rustico")}</option>
                    </select>
                </div>

                {/* ACCORDION */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <AccordionSection titolo={`🏠 ${t("property.ambienti")}`} colore="#38B0DF">
                        <PropertyRooms dati={dati} modifica={modifica} />
                    </AccordionSection>

                    <AccordionSection titolo={`✨ ${t("property.caratteristiche")}`} colore="#80C56B">
                        <PropertyFeatures dati={dati} modifica={modifica} />
                    </AccordionSection>

                    <AccordionSection titolo={`🔥 ${t("property.impianti")}`} colore="#48B888">
                        <PropertyComfort dati={dati} modifica={modifica} />
                    </AccordionSection>

                    <AccordionSection titolo={`⭐ ${t("property.altre")}`} colore="#5F89C2">
                        <PropertyExtras dati={dati} modifica={modifica} />
                    </AccordionSection>
                </motion.div>

                {/* PULSANTI */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="flex flex-wrap gap-2 pt-3 border-t"
                >
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={salva}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm flex-1 min-w-[80px] justify-center transition"
                    >
                        <Save size={16} />
                        {t("property.salva")}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={duplica}
                        className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 text-sm flex-1 min-w-[80px] justify-center transition"
                    >
                        <Copy size={16} />
                        {t("property.duplica")}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(255,0,0,0.2)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => eliminaImmobile(dati.id)}
                        className="flex items-center gap-2 border px-4 py-2.5 rounded-xl hover:bg-gray-100 bg-red-400 text-sm flex-1 min-w-[80px] justify-center transition"
                    >
                        <Trash2 size={16} />
                        {t("property.elimina")}
                    </motion.button>
                </motion.div>
            </div>
        </motion.div>
    );
}