import { BrowserRouter, Routes, Route } from "react-router-dom";
import Editor from "./components/editor";
import Profile from "./components/profile";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Layout from "./layouts/layout";

function App() {
  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout/>}>
            <Route path="editor/:id" element={<Editor roomId="69c132eab358289d365fc24b"/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
