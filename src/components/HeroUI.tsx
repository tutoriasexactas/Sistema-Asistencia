"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import logoTutorias from "../../public/logo.png";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import BuscarSocio from "@/components/sistemaIngreso/BuscarSocio";
import Link from "next/link";
import { FileText } from "lucide-react";
import Asistencia from "@/components/TomarAsistencia";
import Excel from "@/components/DescargarAsistencia";
export default function HeroUI() {
  const [activeTab, setActiveTab] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4 sm:p-8 transition-colors duration-600">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        <header className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-6 border-b-4 border-[#F65B18] pb-6 bg-white p-4 sm:p-6 rounded-lg shadow-sm transition-colors duration-600">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
            <Image
              src={logoTutorias}
              alt="logo de tutorias"
              priority
              className="h-16 sm:h-20 w-auto object-contain rounded"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                Sistema Asistencias{" "}
                <span className="text-3xl font-display font-black tracking-[0.25em] text-[#EE8904] drop-shadow-md">
                  TUTORIAS
                </span>
              </h1>
              <p className="text-gray-600 mt-1 font-medium text-sm sm:text-base">
                Seleccione la acción a realizar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-gray-300 bg-white text-black hover:bg-red-50 hover:text-red-600"
            >
              Cerrar sesión
            </Button>
          </div>
        </header>

        <nav className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          <Button
            className={
              activeTab === "Asistencia"
                ? "bg-[#F65B18] px-4 py-4 border-2 border-[#F65B18] text-white font-bold shadow-md w-full text-base sm:w-auto hover:bg-[#F65B18] transition-all duration-600"
                : "bg-white px-4 py-4 text-base text-gray-700 border-2 border-gray-300 hover:border-black hover:text-black hover:bg-[#EE8904] hover:shadow-xl w-full sm:w-auto transition-all duration-600"
            }
            onClick={() => setActiveTab("Asistencia")}
          >
            Tomar asistencia
          </Button>
          <Button
            className={
              activeTab === "Excel"
                ? "bg-[#F65B18] px-4 py-4 border-2 border-[#F65B18] text-white font-bold shadow-md w-full text-base sm:w-auto hover:bg-[#F65B18] transition-all duration-600"
                : "bg-white px-4 py-4 text-base text-gray-700 border-2 border-gray-300 hover:border-black hover:text-black hover:bg-[#EE8904] hover:shadow-xl w-full sm:w-auto transition-all duration-600"
            }
            onClick={() => setActiveTab("Excel")}
          >
            Descargar Asistencia
          </Button>
        </nav>

        <main>
          {activeTab === "Asistencia" && <Asistencia />}

          {activeTab === "Excel" && <Excel />}
        </main>
      </div>
    </div>
  );
}
