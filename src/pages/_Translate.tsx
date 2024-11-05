import { useCompletion } from "ai/react";
import { useEffect, useState } from "react";

const Translate: React.FC = () => {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem("translationFontSize");
    return saved ? Number.parseInt(saved) : 3; // Default to text-lg (4)
  });

  useEffect(() => {
    localStorage.setItem("translationFontSize", fontSize.toString());
  }, [fontSize]);

  const {
    completion,
    complete,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useCompletion({
    api: "/api/translate",
  });

  function goToChapter(change: number) {
    // Example input `https://truyenyy.vip/truyen/thinh-cong-tu-tram-yeu/chuong-309.html`

    // Get chapter number from url using regex
    const chapterNumber = input.match(/\d+/)?.[0];

    // Change chapter number by change value
    const newChapterNumber = Number(chapterNumber) + change;

    // Replace chapter number in url
    const newUrl = input.replace(
      String(chapterNumber),
      newChapterNumber.toString()
    );

    setInput(newUrl);
    complete(newUrl);
  }

  const fontSizeClasses = [
    "text-sm leading-5", // 0
    "text-base leading-6", // 1
    "text-lg leading-7", // 2
    "text-xl leading-8", // 3
    "text-2xl leading-8", // 4
    "text-3xl leading-8", // 5
  ];

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 1, fontSizeClasses.length - 1));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="w-full lg:max-w-6xl mx-auto p-4 min-h-screen">
      <div className="bg-white rounded-lg shadow flex flex-col h-full">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Enter URL For Translation"
              className="flex-1 rounded-lg border p-2 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Send
            </button>
          </div>
        </form>

        <div className="flex justify-end gap-2 px-4">
          <button
            onClick={decreaseFontSize}
            type="button"
            className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
          >
            A-
          </button>
          <button
            onClick={increaseFontSize}
            type="button"
            className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
          >
            A+
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto p-4 space-y-4 ${fontSizeClasses[fontSize]}`}
        >
          <div className="w-full break-words whitespace-pre-line rounded-lg">
            {completion}
          </div>
          {isLoading && (
            <div className="flex justify-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-labelledby="loadingTitle"
              >
                <title id="loadingTitle">Loading animation</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex justify-between p-4 border-t">
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            onClick={() => goToChapter(-1)}
          >
            Previous Chapter
          </button>
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            onClick={() => goToChapter(1)}
          >
            Next Chapter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Translate;
