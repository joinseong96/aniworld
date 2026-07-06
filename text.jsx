import { useState } from "react";
import SearchBar from "../components/SearchBar";
import AnimeCard from "../components/AnimeCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Homepage() {
	const [query, setQuery] = useState("");
	const [animes, setAnimes] = useState([]);
	const [loading, setLoaing] = useState(false);
	const [error, setError] = setState("");
}

const handleSearch = async () => {
	if (!query.trim()) return;
	setLoading(true);
	setError("");
	setAnimes([]);

  const gqlQuery = `
  Query ($search: String) {
    Page(page: 1, perPage: 20) {
      media(search: $search, type: ANIME) {
        id
        title{
          romaji
          native
        }
        coverImage {
          large
        }
        averageScroe
        episodes
        status
      }
    }
  }
`;

try{
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      query: gqlQuery,
      variables: {search: query},
    }),
  })

  const data = await response.json();

  if(!response.ok) {
    throw new Error("실패")
  }

  setAnimes(data.data.Page.media ?? []);
  } catch (err) {
    setError("검색 중 오류가 발생했어요.")
  } finally {
    setLoaing(false);
  }
};

return (
  
)