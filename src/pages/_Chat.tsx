import { useCallback, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";

const Chat: React.FC = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      headers: {
        "x-chat-id": "12345",
      },
    });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const throttledScrollToBottom = useCallback(
    (() => {
      let isThrottled = false;
      return () => {
        if (!isThrottled) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          isThrottled = true;
          setTimeout(() => {
            isThrottled = false;
          }, 500);
        }
      };
    })(),
    []
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    throttledScrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="max-w-6xl mx-auto p-4 min-h-screen">
      <div className="bg-white rounded-lg shadow flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] break-words whitespace-pre-line rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");

                      return match ? (
                        <SyntaxHighlighter
                          style={dracula}
                          PreTag="div"
                          language={match[1]}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </Markdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message..."
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
      </div>
    </div>
  );
};

export default Chat;
