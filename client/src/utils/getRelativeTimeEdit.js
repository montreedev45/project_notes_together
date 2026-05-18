export const getRelativeTimeEdit = (dateString) => {
  // 🚩 เพิ่มเงื่อนไขตรวจสอบให้เข้มงวดขึ้น ป้องกัน Unix Epoch Bug 1970
  if (!dateString || dateString === "no time" || new Date(dateString).getTime() === 0) {
    return "Never edited"; // หรือเปลี่ยนเป็น "No recent edits" ตามต้องการ
  }
  
  const now = new Date();
  const past = new Date(dateString);
  
  // ตรวจสอบว่าแปลงเป็นเวลาสมบูรณ์ได้ไหม (กันระบบพัง)
  if (isNaN(past.getTime())) return "Never edited";

  const diffInSeconds = Math.floor((now - past) / 1000);
  
  // ... โค้ด Loop เช็ค units และวินาที ตัวเดิมของคุณ ...
  const units = [
    { name: 'y', seconds: 31536000 },
    { name: 'mon', seconds: 2592000 },
    { name: 'd', seconds: 86400 },
    { name: 'h', seconds: 3600 },
    { name: 'min', seconds: 60 }
  ];

  for (const unit of units) {
    if (diffInSeconds >= unit.seconds) {
      const value = Math.floor(diffInSeconds / unit.seconds);
      
      // คืนค่ารูปแบบตัวย่อสวยๆ เช่น "edited 5m ago" หรือ "edited 2d ago"
      return `edited ${value}${unit.name} ago`; 
    }
  }
  
  return 'edited just now';
};