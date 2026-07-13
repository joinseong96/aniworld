import { useState, useEffect } from "react";
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
	const [popularAnimes, setPopularAnimes] = useState([]);
	// 초기 화면에 보여줄 인기 애니 목록
	const [popularLoading, setPopularLoading] = useState(true);
	// 인기 애니 로딩 중인지 여부 (첫 진입 시 true로 시작)
	const [page, setPage] = useState(1);
	// 현재 검색 결과가 몇 페이지째인지
	const [hasNextPage, setHasNextPage] = useState(false);
	// 다음 페이지가 더 있는지 여부
	const [loadingMore, setLoadingMore] = useState(false);
	// 더보기 버튼 클릭으로 추가 로딩 중인지 구분

	useEffect(() => {
		// 왜 useEffect 안에 async 함수를 따로 정의해서 즉시 실행하는지(async 콜백 불가 이슈)
		const fetchPopularAnimes = async () => {
			const gqlQuery = `
      query {
        Page(page: 1, perPage: 15) {
          media(sort: POPULARITY_DESC, type: ANIME) {
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
					method: "POST",
					//GET은 URL에 데이터를 담아 보냄 → 길이 제한, 복잡한 데이터 표현에 부적합
					// POST는 body에 데이터를 담아 보냄 → 길이 제한 없고, 복잡한 구조(JSON) 그대로 전달 가능
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ query: gqlQuery }),
					// JSON.stringify는 자바스크립트 객체를 문자열로 바꿔주는 함수
					// 네트워크로는 문자열만 주고 받을 수 있기 때문에 자바스크립트 객체를 감싸줘서 문자열로 보내기 위함
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error("API 응답 실패");
				}

				setPopularAnimes(data.data.Page.media ?? []);
				// 쿼리를 담은 변수 data 안에 쿼리를 감싸고 있는 data 안에 Page 안에 media
				// ?? [] 데이터가 없을 경우 빈 배열이라도 넣어서 undefined가 나와서 에러가 안 나게끔 하기 위함
			} catch {
				setPopularAnimes([]);
			} finally {
				setPopularLoading(false);
			}
		};

		fetchPopularAnimes();
	}, []);

	const fetchSearchResults = async (searchQuery, pageNum, isLoadMore) => {
		// async : 이 함수 안에서 await를 쓸 거다 라는 선언.
		const gqlQuery = `
      query ($search: String, $page: Int) {
        Page(page: $page, perPage: 20) {
          pageInfo {
            hasNextPage
          }
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
					variables: { search: searchQuery, page: pageNum },
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error("API 응답 실패");
			}

			const newAnimes = data.data.Page.media ?? [];

			if (isLoadMore) {
				setAnimes((prev) => [...prev, ...newAnimes]);
				// 기존 목록 뒤에 새로 받아온 목록을 이어붙임
				// ...는 배열 안에 배열이 생기는 걸 방지하고 껍데기를 벗기고 안에 내용물들이 합쳐 질 수 있게 해주는 스프레드 문법
			} else {
				setAnimes(newAnimes);
				// 새 검색이면 기존 목록을 통째로 교체
			}

			setHasNextPage(data.data.Page.pageInfo.hasNextPage);
		} catch {
			setError("검색 중 오류가 발생했어요. 다시 시도해주세요.");
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	const handleSearch = async () => {
		if (!query.trim()) return;
		// trim : 앞 뒤 공백을 잘라주는 함수
		setLoading(true);
		// 검색 시작 시 로딩 스피너 활성화
		setError("");
		// 이전 에러 메시지 초기화
		setAnimes([]);
		// 이전 검색 결과 초기화
		setPage(1);
		// 새 검색이니 페이지를 1로 초기화

		await fetchSearchResults(query, 1, false);
	};

	const handleLoadMore = async () => {
		const nextPage = page + 1;
		setLoadingMore(true);
		setPage(nextPage);

		await fetchSearchResults(query, nextPage, true);
	};

	const isSearchMode = query.trim().length > 0;
	// 현재 검색어가 있는 상태인지 true / false로 담아낸 변수

	return (
		<div className="max-w-5xl mx-auto px-6 py-10">
			<div className="text-center mb-10">
				{/* <h1 className="text-4xl font-bold text-white mb-3">ANIWORLD</h1> */}
				{/* <p className="text-gray-400">좋아하는 애니를 검색해보세요</p> */}
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

			{!loading && !error && isSearchMode && animes.length === 0 && (
				<p className="text-center text-gray-500">검색 결과가 없어요.</p>
				// 로딩도 아니고 에러도 없는데 검색어는 있고 애니 결과도 없다면
			)}

			{!loading && isSearchMode && animes.length > 0 && (
				// 로딩 상태는 아니고 검색어는 있고 애니 결과가 있다면
				<>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
						{animes.map((anime) => (
							<AnimeCard key={anime.id} anime={anime} />
						))}
					</div>
					{hasNextPage && (
						<div className="flex justify-center mt-8">
							<button
								onClick={handleLoadMore}
								disabled={loadingMore}
								className="px-6 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
							>
								{loadingMore ? "불러오는 중..." : "더보기"}
							</button>
						</div>
					)}
				</>
			)}

			{!isSearchMode && (
				<div>
					<h2 className="text-xl font-bold text-white mb-4">인기 애니메이션</h2>

					{popularLoading && <LoadingSpinner />}

					{!popularLoading && (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
							{popularAnimes.map((anime) => (
								<AnimeCard key={anime.id} anime={anime} />
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
