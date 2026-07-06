import { useState } from "react";
import SearchBar from "../components/SearchBar";
import AnimeCard from "../components/AnimeCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function HomePage() {
	const [query, setQuery] = useState("");
	// 검색창에 입력된 텍스트
	const [animes, setAnimes] = useState([]);
	// API로 받아온 애니 목록
	const [loading, setLoading] = useState(false);
	// 로딩 중인지 여부
	const [error, setError] = useState("");
	// 에러 메시지

	const handleSearch = async () => {
		// async : 이 함수 안에서 await를 쓸 거다 라는 선언.
		if (!query.trim()) return;
		// trim : 앞 뒤 공백을 잘라주는 함수
		setLoading(true);
		// 검색 시작 시 로딩 스피너 활성화
		setError("");
		// 이전 에러 메시지 초기화
		setAnimes([]);
		// 이전 검색 결과 초기화

		const gqlQuery = `
      query ($search: String) {
        Page(page: 1, perPage: 20) {
          media(search: $search, type: ANIME) {
            id
            title {
              romaji
              native
            }
            coverImage {
              large
            }
            averageScore
            episodes
            status
          }
        }
      }
    `;

		try {
			const response = await fetch("https://graphql.anilist.co", {
				// fetch : 요청을 보내고 응답을 받아오는 함수
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					query: gqlQuery,
					variables: { search: query },
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error("API 응답 실패");
			}

			setAnimes(data.data.Page.media ?? []);
		} catch (err) {
			setError("검색 중 오류가 발생했어요. 다시 시도해주세요.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-5xl mx-auto px-6 py-10">
			<div className="text-center mb-10">
				<h1 className="text-4xl font-bold text-white mb-3">ANIWORLD</h1>
				<p className="text-gray-400">좋아하는 애니를 검색해보세요</p>
			</div>

			<div className="flex justify-center mb-10">
				<SearchBar
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onSearch={handleSearch}
				/>
			</div>

			{loading && <LoadingSpinner />}

			{error && <p className="text-center text-red-400">{error}</p>}

			{!loading && !error && animes.length === 0 && query && (
				<p className="text-center text-gray-500">검색 결과가 없어요.</p>
				// 로딩도 아니고 에러도 없고 애니 결과도 없고 쿼리만(검색어만) 있다면
			)}

			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
				{animes.map((anime) => (
					<AnimeCard key={anime.id} anime={anime} />
				))}
			</div>
		</div>
	);
}
