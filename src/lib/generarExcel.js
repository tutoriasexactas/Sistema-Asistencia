import * as XLSX from "xlsx";

export const descargarListadoAsistenciasExcel = (datos, fecha) => {
  if (!datos || datos.length === 0) return;

  const datosFormateados = datos.map((item, index) => {
    const fechaHoraObj = new Date(item.fecha_hora);

    return {
      "N°": index + 1,
      DNI: item.dni,
      "NOMBRE COMPLETO": item.nombre_completo,
      FECHA: fechaHoraObj.toLocaleDateString("es-AR"),
      HORA: fechaHoraObj.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  });

  const hojaDeTrabajo = XLSX.utils.json_to_sheet(datosFormateados);
  const libroDeTrabajo = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Asistencias");

  const nombreArchivo = `Asistencias_${fecha}.xlsx`;
  XLSX.writeFile(libroDeTrabajo, nombreArchivo);
};
