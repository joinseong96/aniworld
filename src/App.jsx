import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";

export default function App() {
	const location = useLocation();

	return (
		<div className="min-h-screen bg-gray-950 text-gray-100">
			<Navbar />
			<Routes>
				<Route path="/" element={<HomePage key={location.key} />} />
				<Route path="/anime/:id" element={<DetailPage />} />
			</Routes>
		</div>
	);
}
