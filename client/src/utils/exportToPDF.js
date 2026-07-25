import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export const exportToPDF = async (elementId, fileName = "note.pdf") => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`element with id ${elementId} not found.`);
    return;
  }

  try {
    // html2canvas-pro จะรองรับ oklch และ Tailwind v4 ได้ในตัวทันที
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.75);
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    pdf.addImage(
      imgData,
      "JPEG",
      0, 
      0,          
      pdfWidth,   
      pdfHeight,  
      undefined,
      "FAST"
    );

    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
