// ฟังก์ชันแปลง ISO String ให้เป็นเวลาตาม Timezone ของผู้ใช้งาน (ไทย = +7 อัตโนมัติ)
export const formatChatTime = (isoString) => {
  if (!isoString) return "";
  
  const date = new Date(isoString);
  
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // ใช้ระบบ 24 ชั่วโมง (ถ้าอยากได้ AM/PM ให้เปลี่ยนเป็น true)
  }).format(date);
};