import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import About from "./pages/About";
import Analyzer from "./pages/Analyzer";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Landing from "./pages/Landing";

export default function App() {
  return <Routes><Route path="/" element={<Landing />} /><Route element={<Layout />}><Route path="/dashboard" element={<Dashboard />} /><Route path="/analyze" element={<Analyzer />} /><Route path="/history" element={<History />} /><Route path="/about" element={<About />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}
