import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import HeroUI from "@/components/HeroUI"; // Ajusta la ruta según dónde guardes el componente cliente

export default async function IngresoPage() {
  const supabase = await createClient();

  // Obtengo el usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }
  // si pasa se renderizae el main
  return <HeroUI />;
}
