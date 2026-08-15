import jsPDF from 'jspdf';

interface AdoptionPdfData {
  adoption: {
    id: number;
    applicant_name: string;
    dni: string;
    phone: string;
    address: string;
    created_at: string;
  };
  animal: {
    name: string;
    species: string;
    estimated_age?: string | null;
    health_status?: string | null;
  };
  shelter: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
}

export function generateAdoptionPdf(data: AdoptionPdfData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 20;
  const contentW = W - margin * 2;

  // ── colores del sistema ──────────────────────────────────────
  const brand   = { r: 180, g: 100, b: 60 };  // naranja marca
  const dark    = { r: 30,  g: 30,  b: 30  };
  const gray    = { r: 100, g: 100, b: 100 };
  const light   = { r: 245, g: 240, b: 235 };

  // ── cabecera con fondo de color ──────────────────────────────
  doc.setFillColor(brand.r, brand.g, brand.b);
  doc.rect(0, 0, W, 45, 'F');

  // nombre del sistema
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Refugio360', margin, 18);

  // subtítulo
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Plataforma de gestión de albergues y adopciones', margin, 26);

  // título del documento
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ACUERDO DE ADOPCIÓN', margin, 38);

  // número de solicitud (derecha)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${String(data.adoption.id).padStart(5, '0')}`, W - margin, 18, { align: 'right' });
  doc.text(new Date(data.adoption.created_at).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  }), W - margin, 25, { align: 'right' });

  // ── línea separadora ─────────────────────────────────────────
  let y = 55;

  // ── texto introductorio ──────────────────────────────────────
  doc.setTextColor(dark.r, dark.g, dark.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const intro = `Mediante el presente acuerdo, se formaliza la adopción responsable del animal descrito a continuación, comprometiéndose el adoptante a brindarle cuidado, afecto y condiciones de vida dignas. El albergue certifica que el animal se entrega en las condiciones indicadas en este documento.`;
  const introLines = doc.splitTextToSize(intro, contentW);
  doc.text(introLines, margin, y);
  y += introLines.length * 5 + 8;

  // ── función para sección ─────────────────────────────────────
  function section(title: string, rows: [string, string][]) {
    // fondo de cabecera de sección
    doc.setFillColor(light.r, light.g, light.b);
    doc.roundedRect(margin, y, contentW, 8, 2, 2, 'F');

    doc.setTextColor(brand.r, brand.g, brand.b);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 4, y + 5.5);
    y += 12;

    rows.forEach(([label, value]) => {
      doc.setTextColor(gray.r, gray.g, gray.b);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(label, margin + 2, y);

      doc.setTextColor(dark.r, dark.g, dark.b);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '—', margin + 55, y);
      y += 6;
    });
    y += 4;
  }

  // ── secciones ────────────────────────────────────────────────
  section('Datos del adoptante', [
    ['Nombre completo',  data.adoption.applicant_name],
    ['DNI',             data.adoption.dni],
    ['Teléfono',        data.adoption.phone],
    ['Dirección',       data.adoption.address],
  ]);

  section('Datos del animal adoptado', [
    ['Nombre',          data.animal.name],
    ['Especie',         data.animal.species],
    ['Edad estimada',   data.animal.estimated_age ?? 'No especificada'],
    ['Estado de salud', data.animal.health_status ?? 'No especificado'],
  ]);

  section('Datos del albergue', [
    ['Albergue',        data.shelter.name],
    ['Teléfono',        data.shelter.phone ?? 'No especificado'],
    ['Correo',          data.shelter.email ?? 'No especificado'],
    ['Dirección',       data.shelter.address ?? 'No especificada'],
  ]);

  // ── compromisos ───────────────────────────────────────────────
  doc.setFillColor(light.r, light.g, light.b);
  doc.roundedRect(margin, y, contentW, 8, 2, 2, 'F');
  doc.setTextColor(brand.r, brand.g, brand.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPROMISOS DEL ADOPTANTE', margin + 4, y + 5.5);
  y += 12;

  const compromisos = [
    'Proveer alimentación adecuada, agua fresca y atención veterinaria.',
    'No abandonar ni maltratar al animal bajo ninguna circunstancia.',
    'Permitir visitas de seguimiento por parte del albergue si se requieren.',
    'Notificar al albergue en caso de no poder continuar con la adopción.',
  ];

  doc.setTextColor(dark.r, dark.g, dark.b);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  compromisos.forEach(c => {
    doc.text(`•  ${c}`, margin + 4, y);
    y += 6;
  });

  y += 10;

  // ── firmas ────────────────────────────────────────────────────
  const col1 = margin;
  const col2 = W / 2 + 5;
  const lineW = (contentW / 2) - 10;

  doc.setDrawColor(brand.r, brand.g, brand.b);
  doc.setLineWidth(0.4);
  doc.line(col1, y, col1 + lineW, y);
  doc.line(col2, y, col2 + lineW, y);

  y += 5;
  doc.setTextColor(dark.r, dark.g, dark.b);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Firma del adoptante', col1, y);
  doc.text('Firma del albergue', col2, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text(data.adoption.applicant_name, col1, y);
  doc.text(data.shelter.name, col2, y);

  // ── pie de página ─────────────────────────────────────────────
  doc.setFillColor(brand.r, brand.g, brand.b);
  doc.rect(0, 282, W, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Refugio360 — Plataforma de gestión de albergues y adopciones', W / 2, 290, { align: 'center' });
  doc.text(`Documento generado el ${new Date().toLocaleDateString('es-PE')}`, W / 2, 294, { align: 'center' });

  // ── descargar ─────────────────────────────────────────────────
  doc.save(`acuerdo-adopcion-${data.adoption.id}.pdf`);
}