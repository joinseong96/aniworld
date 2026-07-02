export default function SearchBar({ value, onChange, onSearch }) {
	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			onSearch();
		}
	};

	return (
		<div className="flex gap-2 w-full max-w-xl">
			<input
				type="text"
				value={value}
				onChange={onChange}
				onKeyDown={handleKeyDown}
				placeholder="애니 제목을 검색하세요."
				className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
			/>
			<button
				onClick={onSearch}
				className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
			>
				검색
			</button>
		</div>
	);
}

//  사용자 타이핑
//  → onChange 실행
//  → HomePage의 setQuery로 query 상태 업데이트
//  → query가 value로 다시 SearchBar에 전달되어 화면에 보임

//  사용자가 Enter 또는 검색 버튼 클릭
//  → onSearch(= HomePage의 handleSearch) 실행
//  → API 호출 시작
