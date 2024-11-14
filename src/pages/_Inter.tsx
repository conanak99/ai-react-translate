import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle, Info, BookHeart } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { useCompletion } from "ai/react";

interface InterpretationResult {
  literalMeaning: string;
  underlyingThoughts: string;
  trueMeaning: string;
  confidenceLevel: string;
  confidenceExplanation: string;
}

interface Interpretation {
  process: string;
  result?: InterpretationResult;
}

interface ResultItemProps {
  emoji: string;
  title: string;
  content: string;
  delay: number;
}

function stringToInterpretation(text: string): Interpretation | undefined {
  if (!text) return undefined;

  // Extract process section between interpretation_process tags
  // Match opening tag and capture everything after it
  const processMatch = text.match(
    /<interpretation_process>([\s\S]*?)(?:<\/interpretation_process>|$)/
  );
  const process = processMatch ? processMatch[1].trim() : "";

  // Try to extract and parse JSON after the process section
  try {
    const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[1]);
      return {
        process,
        result: {
          literalMeaning: result.literal_meaning || "",
          underlyingThoughts: result.underlying_thoughts || "",
          trueMeaning: result.true_meaning || "",
          confidenceLevel: result.confidence_level || "",
          confidenceExplanation: result.confidence_explanation || "",
        },
      };
    }
  } catch (e) {
    // If JSON parsing fails or is incomplete, return empty result
    console.error("Failed to parse JSON:", e);
  }

  // Return with empty result if no valid JSON found
  return {
    process,
  };
}

function formatConfidenceLevel(level: string) {
  if (level === "low") return "⬇️ Thấp";
  if (level === "medium") return "➡️ Trung bình";
  if (level === "high") return "⬆️ Cao";
  return `❓ ${level}`;
}

const ResultItem = ({ emoji, title, content, delay }: ResultItemProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex items-start space-x-2 mb-2"
  >
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        <span className="font-semibold mr-1">
          {emoji} {title}
        </span>
        {content}
      </p>
    </div>
  </motion.div>
);

export default function CommunicationInterpreter() {
  const [statement, setStatement] = useState<string>("");
  const [context, setContext] = useState<string>("");

  const { completion, handleSubmit, complete, isLoading } = useCompletion({
    api: "/api/interpret",
    body: {
      context,
      statement,
    },
  });

  const interpretation = stringToInterpretation(completion);

  return (
    <motion.div
      className="mt-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <MessageCircle className="w-6 h-6 text-purple-500" />
            <motion.span
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Thấu hiểu phụ nữ - Hạnh phúc thăng hoa với AI 🤗
            </motion.span>
          </CardTitle>
          <CardDescription className="text-center text-base text-gray-600">
            Đàn ông có thể không hiểu phụ nữ. Nhưng AI của chúng tôi thì có!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label
                htmlFor="context"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Hoàn cảnh dẫn đến câu nói đó?
              </label>
              <Textarea
                id="context"
                placeholder="Kể cho AI nghe chút về  bối cảnh, thời gian, địa điểm, quan hệ 2 bên..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full bg-white dark:bg-gray-700"
                rows={2}
              />
            </div>
            <div>
              <label
                htmlFor="statement"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Cô ấy nói gì?
              </label>
              <Textarea
                id="statement"
                placeholder="Gõ vào đây..."
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                className="w-full bg-white dark:bg-gray-700"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                disabled={isLoading}
                onClick={() => {
                  complete("dummy text");
                }}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang giải mã...
                  </>
                ) : (
                  <>
                    <BookHeart className="w-4 h-4 mr-2" /> Giải mã ngôn ngữ phụ
                    nữ!
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  setStatement("");
                  setContext("");
                }}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
        <AnimatePresence>
          {interpretation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CardFooter className="flex flex-col space-y-4">
                <div className="w-full grid grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow col-span-2"
                  >
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-500" />
                      Phân tích ngữ cảnh
                    </h3>
                    <ReactMarkdown className="prose prose-sm max-w-none">
                      {interpretation.process}
                    </ReactMarkdown>
                  </motion.div>

                  {interpretation.result && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow"
                    >
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BookHeart className="w-5 h-5 text-green-500" />
                        Giải mã
                      </h3>
                      <ResultItem
                        emoji="📝"
                        title="Nghĩa đen:"
                        content={interpretation.result.literalMeaning}
                        delay={0.6}
                      />
                      <ResultItem
                        emoji="💭"
                        title="Suy nghĩ tiềm ẩn:"
                        content={interpretation.result.underlyingThoughts}
                        delay={0.7}
                      />
                      <ResultItem
                        emoji="💡"
                        title="Ý nghĩa thực sự:"
                        content={interpretation.result.trueMeaning}
                        delay={0.8}
                      />

                      <ResultItem
                        emoji="❓"
                        title="Giải thích thêm:"
                        content={interpretation.result.confidenceExplanation}
                        delay={0.9}
                      />
                      <ResultItem
                        emoji="📊"
                        title="Mức độ tin cậy:"
                        content={formatConfidenceLevel(
                          interpretation.result.confidenceLevel
                        )}
                        delay={1}
                      />
                    </motion.div>
                  )}
                </div>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
