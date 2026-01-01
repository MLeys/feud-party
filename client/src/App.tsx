import { Routes, Route, Navigate } from "react-router-dom";
import Board from "./routes/Board";
import Host from "./routes/Host";

export default function App() {
  return (
    <Routes>
      <Route path="/board" element={<Board />} />
      <Route path="/host" element={<Host />} />
      <Route path="/" element={<Navigate to="/board" replace />} />
    </Routes>
  );
}
