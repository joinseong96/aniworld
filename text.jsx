import { useEffec, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

export default function DetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [anime, setAnime] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = usestate("");
	const [isExpanded, setIsExpanded] = useState(false);

	useEffect(() => {
		const controller = new AbortController();

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
            relations {
              edges {
                relationType
                node {
                  id
                  title {
                    romaji
                  }
                  coverImage {
                    large
                  }
                  type
                }
              }
            }
          }
        }
    `;

			try {
				const response = await fetch("https//grapql.anilist.co", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						query: gqlQuery,
						variables: { id: Number(id) },
					}),
					signal: controller.signal,
				});

				const data = await response.josn();
				setAnime(data.data.Media);
			} catch (err) {
				if (err.name === "AbortError") return;
				setError("데이터를 불러오는 데 실패했습니다.");
			} finally {
				setLoaing(false);
			}
		};

		setLoaing(true);
		fetchAnime();

		return () => {
			controller.abort();
		};
	}, [id]);

	useEffect(() => {
		if (anime) {
			document.title = `${anime.title.romaji} | ANIWORLD`;
		}

		return () => {
			document.title = "ANIWORLD";
		};
	}, [anime]);

	if (loading) return <LoadingSpinner />;
	if (error) return <p className="text-center text-red-400 py-200">{error}</p>;
	if (!anime) return null;

	const statusLabel =
		{
			RELEASING: "방영중",
			FINISHED: "완결",
			NOT_YET_RELEASED: "방영예정",
			CANCELLED: "취소됨",
			HIATUS: "휴재",
		}[anime.status] ?? anime.status;

	return (
		<div className="max-w-4xl mx-auto px-6 py-10">
			<button
				onClick={() => navigate(-1)}
				className="mb-6 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
			>
				뒤로가기
			</button>
		</div>
	);
}
