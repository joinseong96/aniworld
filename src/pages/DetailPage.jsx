import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

export default function DetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [anime, setAnime] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchAnime = async () => {
			const gqlQuery = `
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            id
            title {
              romaji
              native
            }
            coverImage {
              large
            }
            bannerImage
            averageScore
            episodes
            status
            description
            genres
            startDate {
              year
            }
          }
        }
      `;

			try {
				const response = await fetch("https://graphql.anilist.co", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						query: gqlQuery,
						variables: { id: Number(id) },
					}),
				});

				const data = await response.json();
				setAnime(data.data.Media);
			} catch (err) {
				setError("데이터를 불러오는 데 실패했습니다.");
			} finally {
				setLoading(false);
			}
		};

		fetchAnime();
	}, [id]);

	if (loading) return <LoadingSpinner />;
	if (error) return <p className="text-center text-red-400 py-20">{error}</p>;
	if (!anime) return null;

	return (
		<div className="max-w-4xl mx-auto px-6 py-10">
			<button
				onClick={() => navigate(-1)}
				className="mb-6 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
			>
				← 뒤로가기
			</button>

			<div className="flex gap-8">
				<img
					src={anime.coverImage.large}
					alt={anime.title.romaji}
					className="w-48 h-72 object-cover rounded-lg flex-shrink-0"
				/>

				<div className="flex flex-col gap-3">
					<h1 className="text-2xl font-bold text-white">
						{anime.title.romaji}
					</h1>
					{anime.title.native && (
						<p className="text-gray-400 text-sm">{anime.title.native}</p>
					)}

					<div className="flex gap-4 text-sm text-gray-300">
						<span>⭐ {anime.averageScore ?? "N/A"}</span>
						<span>📺 {anime.episodes ?? "?"}화</span>
						<span>📅 {anime.startDate.year ?? "?"}년</span>
					</div>

					<div className="flex gap-2 flex-wrap">
						{anime.genres.map((genre) => (
							<span
								key={genre}
								className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
							>
								{genre}
							</span>
						))}
					</div>

					{anime.description && (
						<p
							className="text-sm text-gray-400 leading-relaxed line-clamp-6"
							dangerouslySetInnerHTML={{
								__html: anime.description,
							}}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
