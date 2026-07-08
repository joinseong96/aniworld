import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import AnimeCard from "../components/AnimeCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function HomePage() {
	const [query, setQuery] = useState("");
	const [animes, setAnimes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [popularAnimes, setPopularAnimes] = useState([]);
	const [popularLoading, setPopularLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);

	useEffect(() => {
		const fetchPopularAnimes = async () => {
			const gqlQuery = `
      query {
        Page(page:1, perPage: 15) {
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
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ query: gqlQuery }),
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error("API 응답 실패");
				}

				setPopularAnimes(data.data.Page.media ?? []);
			} catch (err) {
				setPopularAnimes([]);
			} finally {
				setPopularLoading(false);
			}
		};

		fetchPopularAnimes();
	}, []);

	const fetchSearchResults = async (searchQuery, pageNum, isLoadMore) => {
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
			} else {
				setAnimes(newAnimes);
			}

			setHasNextPage(data.data.Page.pageInfo.hasNextPage);
		} catch (err) {
			setError("검색 중 오류가 발생했어요. 다시 시도해주세요.");
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	const handleSearch = async () => {
		if (!query.trim()) return;
		setLoading(true);
		setError("");
		setAnimes([]);
		setPage(1);

		await fetchSearchResults(query, 1, false);
	};

	const handleLoadMore = async () => {
		const nextPage = page + 1;
		setLoadingMore(true);
		setPage(nextPage);

		await fetchSearchResults(query, nextPage, true);
	};

	const isSearchMode = query.trim().length > 0;

	return (
		<div className="max-w-5xl mx-auto px-6 py-10">
			<div className="text-center mb-10"></div>

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
								className="px-6 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg"
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
						<div className="grid gird-cols-2 sm:grid-cols-3 md:gird-cols-4 lg:grid-cols-5 gap-4">
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
