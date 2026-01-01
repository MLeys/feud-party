import { Routes, Route, Navigate } from "react-router-dom";
import Board from "./routes/Board";
import Host from "./routes/Host";
import BuzzPage from "./buzz/BuzzPage";

export default function App() {
  return (
    <Routes>
      <Route path="/board" element={<Board />} />
      <Route path="/host" element={<Host />} />
      <Route path="/buzz" element={<BuzzPage />} />
      <Route path="/" element={<Navigate to="/board" replace />} />
      <Route path="*" element={<Navigate to="/board" replace />} />
    </Routes>
  );
}
