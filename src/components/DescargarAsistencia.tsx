"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { descargarListadoAsistencias } from "@/lib/generarPdf";
import { descargarListadoAsistenciasExcel } from "@/lib/generarExcel";

export default function DescargaAsistencia({ usuario }) {
  const supabase = createClient();

  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split("T")[0],
  );

  const obtenerDatos = async (tipo: string) => {
    try {
      const { data, error } = await supabase
        .from("asistencias")
        .select("*")
        .eq("fecha_solo", fechaSeleccionada)
        .order("fecha_hora", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        if (tipo.toUpperCase() === "PDF") {
          descargarListadoAsistencias(data, fechaSeleccionada);
        } else {
          descargarListadoAsistenciasExcel(data, fechaSeleccionada);
        }
      } else {
        alert("No hay registros de asistencia para la fecha seleccionada.");
      }
    } catch (error: any) {
      console.error("Error al consultar Supabase:", error.message);
      alert("Hubo un error al obtener las asistencias.");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 bg-white text-black border border-gray-200 rounded-xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#EE8904] pb-3">
        Descargar planilla de asistencia por fecha
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="space-y-4 bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200">
          <div className="space-y-2 w-full">
            <Label className="font-bold text-gray-600">Seleccionar Fecha</Label>
            <Input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="bg-gray-50 focus-visible:ring-[#EE8904]"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={() => obtenerDatos("PDF")}
              className="bg-[#EE8904] text-white w-full hover:bg-[#F65B18] font-bold transition-all"
            >
              Descargar PDF
            </Button>
            <Button
              onClick={() => obtenerDatos("EXCEL")}
              className="bg-[#EE8904] text-white w-full hover:bg-[#F65B18] font-bold transition-all"
            >
              Descargar Excel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
