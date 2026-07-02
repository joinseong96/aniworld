import { Link } from "react-router-dom";

export default function AnimeCard({ anime }) {
	return (
		<Link to={`/anime/${anime.id}`}>
			<div className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer">
				<img
					src={anime.coverImage.large}
					alt={anime.title.native}
					className="w-full h-56 object-cover"
				/>
				<div className="p-3 flex flex-col justify-evenly h-22">
					<h3 className="text-sm font-semibold text-gray-100 line-clamp-2">
						{anime.title.native}
					</h3>
					<p className="text-xs text-gray-400 mt-1">
						⭐ {anime.averageScore ?? "undefined"}
					</p>
				</div>
			</div>
		</Link>
	);
}
