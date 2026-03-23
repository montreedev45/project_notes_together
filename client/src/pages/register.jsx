import { useState } from "react";
import api from "../services/api.js";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      alert("register success");
    } catch (error) {
      alert("register failed");
    }
  };

  return (
    <div>
      <input type="text" onChange={(e) => setUsername(e.target.value)} />
      <input type="text" onChange={(e) => setEmail(e.target.value)} />
      <input type="text" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister}>button</button>
    </div>
  );
}


export default Register;