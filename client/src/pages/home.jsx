import { useEffect, useState } from "react";
import api from "../services/api";

function Home() {
    const [message, setMessage] = useState("loading...")

    useEffect(() => {
        const fetchHealth = async()=>{
            try {
                const res = await api.get("/health");
                console.log(res.data)
                console.log(res.data.message)
                setMessage(res.data.message)
            } catch (error) {
                setMessage("server can not connect")
            }
        };

        fetchHealth();
    },[]);

    return(
        <div>
            <h1>test</h1>
            <h3>{message}</h3>
        </div>
    )
}

export default Home;