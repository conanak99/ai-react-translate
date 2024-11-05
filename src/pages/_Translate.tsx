import { useCompletion } from "ai/react";
import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { setTranslateUrl } from "../pocket";

const Translate: React.FC<{ initialUrl: string }> = ({ initialUrl }) => {
  const [fontSize, setFontSize] = useLocalStorage("fontSize", 3);
  const [isDarkMode, setIsDarkMode] = useLocalStorage("darkMode", false);

  useEffect(() => {
    // Update dark mode class on html element
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const {
    completion,
    stop,
    complete,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useCompletion({
    api: "/api/translate",
    initialInput: initialUrl,
  });

  useEffect(() => {
    if (input) {
      setTranslateUrl(input);
    }
  }, [input]);

  async function goToChapter(change: number) {
    stop();
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
    "text-2xl leading-9", // 4
    "text-3xl leading-10", // 5
  ];

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 1, fontSizeClasses.length - 1));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 1, 0));
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className="w-full lg:max-w-6xl mx-auto p-4 min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col h-full">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Enter URL For Translation"
              className="flex-1 rounded-lg border p-2 focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
            />
            {isLoading ? (
              <button
                type="button"
                className="bg-gray-200 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-lg hover:bg-opacity-80"
                onClick={stop}
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Send
              </button>
            )}
          </div>
        </form>

        <div className="flex justify-end gap-2 px-4">
          <button
            onClick={decreaseFontSize}
            type="button"
            className="bg-gray-200 dark:bg-gray-700 dark:text-white px-3 py-1 rounded hover:bg-opacity-80"
          >
            A-
          </button>
          <button
            onClick={increaseFontSize}
            type="button"
            className="bg-gray-200 dark:bg-gray-700 dark:text-white px-3 py-1 rounded hover:bg-opacity-80"
          >
            A+
          </button>
          <button
            onClick={toggleTheme}
            type="button"
            className="bg-gray-200 dark:bg-gray-700 dark:text-white px-3 py-1 rounded hover:bg-opacity-80"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto p-4 space-y-4 ${fontSizeClasses[fontSize]} text-gray-900 dark:text-gray-100`}
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

        <div className="flex justify-between p-4 border-t dark:border-gray-700">
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
