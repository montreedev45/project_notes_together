import { useState } from "react";
import api from "../services/api.js";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      alert("login success");
    } catch (error) {
        alert("login failed")
    }
  };
  return (
  <div>
    <input type="text" onChange={(e)=> setEmail(e.target.value)}/>
    <input type="text" onChange={(e)=> setPassword(e.target.value)}/>
    <button onClick={handleLogin}>button</button>
  </div>
  );
}

export default Login;
