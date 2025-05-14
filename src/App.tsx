import { Route, Routes } from "react-router-dom";
import { Home } from "./components/screens/Home/home";
import { ProductoDetalle } from "./components/screens/ProductoPage/ProductoPage";
import Catalogo from "./components/screens/Catalog/Catalog"; 
import { Register } from "./components/screens/Login/Register";

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/producto/:id" element={<ProductoDetalle />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default App;
