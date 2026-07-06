import { useEffect, useState } from "react";
// 컴포넌트가 처음 뜰 때 api를 호출하기 위한 useEffect, 상태관리를 위한 useState
import { useParams, useNavigate } from "react-router-dom";
// URL에서 :id 값 꺼내기 위한 useParams, 뒤로가기 기능을 위한 useNavigate
import LoadingSpinner from "../components/LoadingSpinner";

export default function DetailPage() {
	const { id } = useParams();
	// URL에서 id를 꺼냄 /anime/20으로 접속했으면 id가 "20"
	const navigate = useNavigate();
	// 페이지 이동 함수를 반환, navigate(-1)은 이전 페이지로 이동
	const [anime, setAnime] = useState(null);
	// API로 받아온 애니 상세 데이터 (처음엔 null)
	const [loading, setLoading] = useState(true);
	// HomePage랑 다르게 처음부터 true, 페이지가 뜨자마자 바로 API 호출하기 때문
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
			// HomePage와 다른 점 두가지
			// $search가 아닌 $id 검색어가 아닌 고유 아이디로 불러옴
			// Page가 아닌 Media 목록이 아니라 1개의 애니 상세 정보를 요청

			try {
				const response = await fetch("https://graphql.anilist.co", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						query: gqlQuery,
						variables: { id: Number(id) },
						// useParams으로 꺼낸 id값은 문자열 "20"
						// AniList는 id 숫자 20을 필요로 해서 Number함수를 사용
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
	// id가 바뀔 때마다 실행
	// []가 비워져 있으면 처음 한번만 실행

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
						// dangerouslySetInnerHTML html 태그 보임 방지
					)}
				</div>
			</div>
		</div>
	);
}
