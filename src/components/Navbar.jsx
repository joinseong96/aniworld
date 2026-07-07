import { Link } from "react-router-dom";

export default function Navbar() {
	return (
		<nav className="border-b border-gray-800 px-6 py-4">
			<div className="max-w-5xl mx-auto flex items-center justify-between">
				<Link
					to="/"
					className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
				>
					ANIWORLD
				</Link>
			</div>
		</nav>
	);
}
