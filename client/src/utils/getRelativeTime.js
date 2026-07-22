export const getRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  // ใช้ Math.abs เพื่อป้องกันค่าติดลบกรณีเวลาเครื่องผู้ใช้เดินช้ากว่า Server นิดหน่อย
  const diffInSeconds = Math.abs(Math.floor((now - past) / 1000));

  const units = [
    { name: 'year', seconds: 31536000 },
    { name: 'month', seconds: 2592000 },
    { name: 'day', seconds: 86400 },
    { name: 'hour', seconds: 3600 },
    { name: 'min', seconds: 60 },
    { name: 'sec', seconds: 1 }
  ];

  for (const unit of units) {
    if (diffInSeconds >= unit.seconds) {
      const value = Math.floor(diffInSeconds / unit.seconds);
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      //return rtf.format(-value, unit.name);
      return `${value} ${unit.name} ago`;
    }
  }
  
  // ถ้าไม่ถึง 1 วินาที ให้แสดงเป็น "just now"
  return 'just now'; 
};

// วิธีใช้: getRelativeTime(notice.createdAt)