import { Extension } from '@tiptap/core'

export const LimitPageHeight = Extension.create({
  name: 'limitPageHeight',

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        // ดึง DOM Element ของกระดาษ A4
        const dom = editor.view.dom;
        
        // 🎯 ตรวจสอบว่า ScrollHeight (เนื้อหาข้างใน) เริ่มเกิน ClientHeight (ความสูงกระดาษที่จำกัดไว้) หรือยัง
        if (dom.scrollHeight > dom.clientHeight) {
          // บล็อกการกด Enter (ไม่สร้างบรรทัดใหม่)
          return true; 
        }

        // ถ้ายังไม่เต็ม ยอมให้กด Enter สร้างบรรทัดใหม่ได้ตามปกติ
        return false; 
      },
    }
  },
})