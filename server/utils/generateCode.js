//genearete code for room

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // สุ่มเลข 100000 - 999999
};

export default generateCode;