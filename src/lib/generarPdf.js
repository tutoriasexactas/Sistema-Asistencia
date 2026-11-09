import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const descargarListadoAsistencias = (asistencias, fecha) => {
  const doc = new jsPDF();

  const colorPrimario = [246, 91, 24]; // #F65B18
  const colorGris = [245, 245, 245];

  doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
  doc.rect(0, 0, 210, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE DE ASISTENCIAS", 14, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha consultada: ${fecha}`, 14, 36);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CONTROL DE ASISTENCIA", 14, 55);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total de asistentes registrados: ${asistencias.length}`, 14, 62);

  const tableData = asistencias.map((item, index) => {
    const dni = item.dni || "-";
    const nombre = item.nombre_completo || "SIN NOMBRE";
    const hora = new Date(item.fecha_hora).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return [index + 1, dni, nombre, hora];
  });

  autoTable(doc, {
    startY: 75,
    head: [["#", "DNI", "NOMBRE COMPLETO", "HORA DE INGRESO"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [238, 137, 4], // #EE8904
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      1: { halign: "center", cellWidth: 40 },
      2: { halign: "left" },
      3: { halign: "center", cellWidth: 40 },
    },
    alternateRowStyles: {
      fillColor: colorGris,
    },
    margin: { top: 10, left: 14, right: 14 },
  });

  const finalY = doc.lastAutoTable.finalY + 15;

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Documento generado automáticamente por el sistema.", 14, finalY);

  doc.save(`Asistencias_${fecha}.pdf`);
};
