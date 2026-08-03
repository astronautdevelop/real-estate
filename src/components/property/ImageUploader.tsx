import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
    immagine: string;
    modifica: (valore: string) => void;
}

// Dimensione massima dell'immagine (ridimensiona a questo lato più lungo)
const MAX_IMAGE_SIZE = 800;
// Qualità di compressione JPEG (0.7 = 70%)
const COMPRESSION_QUALITY = 0.7;

export default function ImageUploader({ immagine, modifica }: Props) {
    const [trascinando, setTrascinando] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Ridimensiona e comprime l'immagine usando Canvas
    const processImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Calcola nuove dimensioni mantenendo proporzioni
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > MAX_IMAGE_SIZE) {
                            height = (height * MAX_IMAGE_SIZE) / width;
                            width = MAX_IMAGE_SIZE;
                        }
                    } else {
                        if (height > MAX_IMAGE_SIZE) {
                            width = (width * MAX_IMAGE_SIZE) / height;
                            height = MAX_IMAGE_SIZE;
                        }
                    }

                    // Crea canvas e disegna l'immagine ridimensionata
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        reject(new Error("Impossibile ottenere il contesto canvas"));
                        return;
                    }

                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";
                    ctx.drawImage(img, 0, 0, width, height);

                    // Esporta come JPEG con qualità ridotta
                    const dataUrl = canvas.toDataURL("image/jpeg", COMPRESSION_QUALITY);
                    resolve(dataUrl);
                };
                img.onerror = () => reject(new Error("Errore nel caricamento dell'immagine"));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error("Errore nella lettura del file"));
            reader.readAsDataURL(file);
        });
    };

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            alert("Il file deve essere un'immagine.");
            return;
        }

        try {
            const compressed = await processImage(file);
            modifica(compressed);
        } catch (error) {
            console.error("Errore compressione immagine:", error);
            alert("Errore durante la compressione dell'immagine. Riprova.");
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setTrascinando(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setTrascinando(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setTrascinando(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = "";
    };

    const rimuoviImmagine = () => {
        modifica("");
    };

    return (
        <div
            className={`
                relative w-full aspect-video bg-gray-100 flex items-center justify-center
                border-2 border-dashed rounded-t-2xl transition
                ${trascinando ? "border-blue-500 bg-blue-50" : "border-gray-300"}
                ${immagine ? "border-solid border-gray-200" : ""}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            {immagine ? (
                <>
                    <img
                        src={immagine}
                        alt="Anteprima immobile"
                        className="w-full h-full object-cover rounded-t-2xl"
                    />
                    <button
                        onClick={rimuoviImmagine}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition shadow-md"
                        aria-label="Rimuovi immagine"
                    >
                        <X size={16} />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-black/80 transition shadow-md"
                    >
                        Cambia
                    </button>
                </>
            ) : (
                <div className="text-center text-gray-500 p-4">
                    <ImageIcon size={40} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Trascina un'immagine qui</p>
                    <p className="text-xs mt-1">o clicca per selezionare</p>
                    <p className="text-xs text-gray-400 mt-2">
                        JPEG · PNG · Max 800px
                    </p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                        <Upload size={14} className="inline mr-1" />
                        Carica
                    </button>
                </div>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
            />
        </div>
    );
}