"use client";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export default function FormIngreso() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [scannerActivo, setScannerActivo] = useState(false);

  // para evitar lecturas múltiples consecutivas del escáner
  const procesandoRef = useRef(false);

  const [data, setData] = useState({
    socioNombreApellido: "",
    socioDni: "",
  });

  // Inicializo el escáner de cámara
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (scannerActivo) {
      const config = {
        fps: 10,
        formatsToSupport: [Html5QrcodeSupportedFormats.PDF_417],
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
      };

      scanner = new Html5QrcodeScanner("reader", config, false);

      scanner.render(
        async (decodedText) => {
          // Si ya hay una lectura procesándose, ignoramos este frame para evitar el doble escaneo
          if (procesandoRef.current) return;
          procesandoRef.current = true;

          // Parseo

          const partes = decodedText.split("@");

          let dniExtraido = "";
          let nombreExtraido = "";

          //  Busco el DNI
          const posiblesDni = partes.find((p) => /^\d{7,8}$/.test(p.trim()));
          if (posiblesDni) {
            dniExtraido = posiblesDni.trim();
          } else {
            dniExtraido = decodedText.trim();
          }
          // Extraigo nombre y apellido
          const palabrasTexto = partes
            .map((p) => p.trim())
            .filter(
              (p) =>
                p.length > 1 &&
                isNaN(p) && // No es un número puro
                !/^\d{2}\/\d{2}\/\d{4}$/.test(p) && // No es una fecha (DD/MM/YYYY)
                !p.includes("ARGENTINA") && // No es la nacionalidad
                p !== "M" && // No es género M
                p !== "F", // No es género F
            );

          if (palabrasTexto.length >= 2) {
            const apellido = palabrasTexto[0];
            const nombres = palabrasTexto[1];
            nombreExtraido = `${apellido} ${nombres}`.trim();
          } else {
            nombreExtraido = partes[1]?.trim() || "DESCONOCIDO";
          }

          // Actualizo los inputs
          setData({
            socioNombreApellido: nombreExtraido,
            socioDni: dniExtraido,
          });

          // Cierro escáner
          try {
            if (scanner) {
              await scanner.clear();
            }
          } catch (error: any) {
            console.error("Error al limpiar escáner:", error);
          } finally {
            setScannerActivo(false);
          }

          // Guardado automático en supabase
          if (dniExtraido && nombreExtraido) {
            await ejecutarGuardadoAsistencia(dniExtraido, nombreExtraido);
          } else {
            toast.error("Error de lectura", {
              description:
                "No se pudieron extraer los datos correctos del DNI.",
            });
            procesandoRef.current = false; // Liberamos el candado si falló la lectura
          }
        },
        (error) => {
          // Silenciar errores continuos de escaneo
        },
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [scannerActivo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Inserción a mano o por escáner
  const ejecutarGuardadoAsistencia = async (
    dniACargar: string,
    nombreACargar: string,
  ) => {
    setLoading(true);
    try {
      const ahora = new Date().toISOString();

      const { error } = await supabase.from("asistencias").insert({
        dni: dniACargar,
        nombre_completo: nombreACargar.toUpperCase(),
        fecha_hora: ahora,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("YA REGISTRADO", {
            description: `El DNI ${dniACargar} ya tiene asistencia registrada hoy.`,
          });
          procesandoRef.current = false; // Liberamos para permitir escanear a otra persona
          return;
        }
        throw error;
      }

      toast.success("¡ASISTENCIA REGISTRADA!", {
        description: `${nombreACargar} (DNI: ${dniACargar}) guardado con éxito.`,
      });

      // Limpiar campos
      setData({ socioNombreApellido: "", socioDni: "" });
    } catch (error: any) {
      toast.error("ERROR AL GUARDAR", {
        description: `Hubo un error: ${error.message}`,
      });
    } finally {
      setLoading(false);
      // Damos un pequeño respiro antes de volver a habilitar el escáner (evita re-lecturas accidentales con el mismo dni)
      setTimeout(() => {
        procesandoRef.current = false;
      }, 1500);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.socioDni || !data.socioNombreApellido) {
      return toast.warning("Campos incompletos", {
        description: "Debe completar el DNI y el Nombre Completo.",
      });
    }
    ejecutarGuardadoAsistencia(data.socioDni, data.socioNombreApellido);
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 bg-white text-gray-900 border border-gray-200 rounded-xl shadow-lg relative transition-colors duration-300">
      <div className="flex flex-col sm:flex-row justify-between bg-transparent items-start sm:items-center border-b-2 border-[#EE8904] pb-3 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Registrar Asistencia
        </h2>
        <Button
          type="button"
          onClick={() => {
            procesandoRef.current = false; // Reseteamos al abrir manualmente
            setScannerActivo(!scannerActivo);
          }}
          className="hover:bg-[#F65B18] bg-[#EE8904] text-white hover:text-black transition-all duration-300 font-bold flex items-center gap-2 shadow-lg"
        >
          <Camera className="w-4 h-4" />
          {scannerActivo ? "Cerrar Escáner" : "Escanear DNI"}
        </Button>
      </div>

      {/* VENTANA DEL ESCÁNER DE CÁMARA */}
      {scannerActivo && (
        <div className="bg-gray-50 border border-gray-300 p-4 rounded-lg relative transition-colors duration-300">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm text-[#EE8904]">
              Apunte la cámara al código de barras trasero del DNI
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScannerActivo(false)}
              className="text-gray-500 hover:bg-gray-200"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          <div id="reader" className="w-full max-w-md mx-auto"></div>
        </div>
      )}

      {/* FORMULARIO Y CAMPOS EDITABLES */}
      <form onSubmit={handleManualSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="space-y-2">
            <Label className="font-semibold text-gray-700">
              Nombre Completo
            </Label>
            <Input
              name="socioNombreApellido"
              value={data.socioNombreApellido}
              onChange={handleChange}
              placeholder="Ej: LOPEZ GARCIA MARCOS LAUTARO"
              className="bg-white border-gray-300 text-gray-900"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-gray-700">
              Documento N° (DNI)
            </Label>
            <Input
              name="socioDni"
              value={data.socioDni}
              onChange={handleChange}
              placeholder="Ej: 46725519"
              className="bg-white border-gray-300 text-gray-900"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="bg-[#EE8904] hover:bg-[#F65B18] text-white hover:text-black transition-all duration-300 font-bold border-none w-full sm:w-auto"
        >
          {loading ? "Registrando ingreso..." : "Marcar ingreso manual"}
        </Button>
      </form>
    </div>
  );
}
