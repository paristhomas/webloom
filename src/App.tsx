import { BrowserRouter, Routes, Route } from "react-router-dom";
import Edit from "./pages/Edit";
import Preview from "./pages/Preview";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Edit />} />
        <Route path="/edit" element={<Edit />} />
        <Route path="/preview" element={<Preview />} />
      </Routes>
    </BrowserRouter>
  );
}
