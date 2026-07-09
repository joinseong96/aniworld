import { useState, useEffec } from "react";
import SearchBar from "../components/SearchBar";
import AnimeCard from "../components/AnimeCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function HomePage() {
	const [query, setQuery] = useState("");
	const [animesList, setAnimesList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [popularAnimes, setPopularAnimes] = useState(true);
	const [page, setPage] = useState(1);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [moreLoading, setMoreLoading] = useState(false);
}

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
			const reponse = await fetch("https", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query: gqlQuery }),
			});

			const data = await reponse.json();

			if (!reponse.ok) {
				throw new Error("에러 발생");
			}

			setPopularAnimes(data.data.Page.media ?? []);
		} catch {
			setPopularAnimes([]);
		} finally {
			setPopularLoading(false);
		}
	};

	fetchPopularAnimes();
}, []);
