import { useEffect, useState } from "react";
// 컴포넌트가 처음 마운트 될 때 api를 호출하기 위한 useEffect, 상태관리를 위한 useState
import { useParams, useNavigate } from "react-router-dom";
// URL에서 :id 값 꺼내기 위한 useParams, 뒤로가기 기능을 위한 useNavigate
import LoadingSpinner from "../components/LoadingSpinner";

export default function DetailPage() {
	const { id } = useParams();
	// {}는 구조 분해 할당으로 id 속성 값만 따로 가져오는 것
	// URL에서 id를 꺼냄 /anime/20으로 접속했으면 id가 "20"
	const navigate = useNavigate();
	// 페이지 이동 함수를 반환, navigate(-1)은 이전 페이지로 이동
	const [anime, setAnime] = useState(null);
	// API로 받아온 애니 상세 데이터 (처음엔 null)
	const [loading, setLoading] = useState(true);
	// 처음부터 true, 페이지가 뜨자마자 바로 API 호출하기 때문
	const [error, setError] = useState("");
	const [isExpanded, setIsExpanded] = useState(false);
	// 줄거리 더보기 / 접기 상태

	useEffect(() => {
		const controller = new AbortController();
		// 이 요청을 취소할 수 있는 리모컨 같은 객체

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
					signal: controller.signal,
					// 이 요청과 리모컨을 연결
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error("데이터를 불러오는 데 실패했습니다.");
				}

				setAnime(data.data.Media);
			} catch (err) {
				if (err.name === "AbortError") return;
				// 취소된 요청이면 에러 처리 안 하고 조용히 무시
				setError("데이터를 불러오는 데 실패했습니다.");
			} finally {
				setLoading(false);
			}
		};

		setLoading(true);
		// id가 바뀔 때마다 로딩 상태를 다시 켜줌 (fetch 요청을 기다리는 동안 이전 페이지 데이터가 잠깐 남는 것 방지)
		fetchAnime();

		return () => {
			controller.abort();
			// cleanup: id가 또 바뀌기 직전, 또는 컴포넌트가 사라질 때 실행
			// 아직 안 끝난 이전 요청을 여기서 강제 취소
		};
	}, [id]);
	// id가 바뀔 때마다 실행
	// []가 비워져 있으면 처음 한번만 실행

	useEffect(() => {
		if (anime) {
			document.title = `${anime.title.romaji} | ANIWORLD`;
		}

		return () => {
			document.title = "ANIWORLD";
		};
	}, [anime]);

	if (loading) return <LoadingSpinner />;
	if (error) return <p className="text-center text-red-400 py-20">{error}</p>;
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
				← 뒤로가기
			</button>
			{anime.bannerImage && (
				<div
					className="w-full h-48 md:h-64 bg-cover bg-center rounded-lg mb-6"
					style={{ backgroundImage: `url(${anime.bannerImage})` }}
				/>
			)}
			<div className="flex flex-col md:flex-row gap-8">
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
						<span>🎬 {anime.episodes ?? "?"}화</span>
						<span>📅 {anime.startDate.year ?? "?"}년</span>
					</div>

					<span className="w-fit px-2 py-1 bg-blue-900/40 text-blue-300 text-xs rounded">
						{statusLabel}
					</span>

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
						<div>
							<p
								className={`text-sm text-gray-400 leading-relaxed ${
									isExpanded ? "" : "line-clamp-6"
								}`}
								dangerouslySetInnerHTML={{
									__html: anime.description,
								}}
								// dangerouslySetInnerHTML html 태그 보임 방지
							/>
							<button
								onClick={() => setIsExpanded((prev) => !prev)}
								// (prev) => !prev 이전 값을 받아서 그 반대 값으로 반환
								className="mt-2 text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
							>
								{isExpanded ? "접기" : "더보기"}
							</button>
						</div>
					)}
				</div>
			</div>
			{anime.relations?.edges?.length > 0 && (
				<div className="mt-10">
					<h2 className="text-lg font-bold text-white mb-4">관련 작품</h2>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
						{anime.relations.edges
							.filter((edge) => edge.node.type === "ANIME")
							.map((edge) => {
								const relationTypeLabel =
									{
										SEQUEL: "시퀄",
										PREQUEL: "프리퀄",
										SIDE_STORY: "외전",
										ALTERNATIVE: "다른 버전",
										SUMMARY: "요약",
										FULL_STORY: "완전판",
									}[edge.relationType] ?? edge.relationType;
								// ?? : edge.relationType로 매핑 객체를 불러와서 무슨 버전인지를 정하지만 매핑 객체 리스트에 없는 애니 리스일 경우, OTHER로 분리
								return (
									<button
										key={edge.node.id}
										onClick={() => navigate(`/anime/${edge.node.id}`)}
										className="text-left cursor-pointer group"
									>
										<img
											src={edge.node.coverImage.large}
											alt={edge.node.title.romaji}
											className="w-full h-40 object-cover rounded-lg group-hover:opacity-80 transition-opacity"
										/>
										<p className="text-xs text-blue-400 mt-1">
											{relationTypeLabel}
										</p>
										<p className="text-sm text-gray-300 line-clamp-2">
											{edge.node.title.romaji}
										</p>
									</button>
								);
							})}
					</div>
				</div>
			)}
		</div>
	);
}
