import { useState } from "react";
import api from "../services/api.js";
import Editor from "../components/editor.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState()

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user)
      console.log(res.data.user)
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

    {user ? (<Editor roomId="69c13499b358289d365fc24f" user={user}/>): ""}
  </div>
  );
}

export default Login;
