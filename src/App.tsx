import { Route, Routes, Navigate } from "react-router-dom";
import { Home } from "./components/screens/Home/home";
import { ProductoDetalle } from "./components/screens/ProductoPage/ProductoPage";
import Catalogo from "./components/screens/Catalog/Catalog";
import { Register } from "./components/screens/Login/Register";
import Layout from "./components/Layout/Layout";

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/home" />} />
        <Route path="home" element={<Home />} />
        <Route path="producto/:id" element={<ProductoDetalle />} />
         {/* RUTA DINÁMICA para /catalogo/mujer, /catalogo/hombre, etc. */}
        <Route path="catalogo/:genero" element={<Catalogo />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Route>
    </Routes>
  );
};

export default App;

