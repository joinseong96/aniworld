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

	useEffect(() => {
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

	const handleSearch = async () => {
		if (!query.trim()) return;
		setLoading(true);
		setError("");
		setAnimes([]);

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

  const isSearchMode = query.trim().length > 0;

  return (
    <div className="mx-w-5xl mx-auto px-6 py-10">
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

      {loading && <LoadingSpinner/>}

      {error && <p className="text-center text-red-400">{error}</p>}

      {!loading && !error && isSearchMode && animes.length === 0 && (
        <p className="text-center text-gray-500">검색 결과가 없어요.</p>
      )}

      {!loading && isSearchMode && animes.length > 0 && (
        <div className="grid gird-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {animes.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime=
            />
          ))}
        </div>
      )}
    </div>
  )
}
