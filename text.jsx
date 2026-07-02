import { Link } from "reat-router-dom";

export default function AnimeCard({ anime }) {
	return (
		<Link to={`/anime/${anime.id}`}>
			<div className="bg-grary">
				<img
					src={anime.coverImage.large}
					alt={anime.title.romaji}
					className="w-full h-56 object-cover"
				/>
				<div className="p-3 flex flex-col justify-evenly h-22">
					<h3 className="text-sm font-semibold text-gray-100 line-camp-2">
						{anime.title.romaji}
					</h3>
					<p className="text-xs text-gray-400 mt-1">sTar</p>
				</div>
			</div>
		</Link>
	);
}
