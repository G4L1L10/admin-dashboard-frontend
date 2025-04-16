"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";

export default function EditQuestionPage() {
  const { questionId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [questionData, setQuestionData] = useState({
    question_text: "",
    question_type: "multiple_choice",
    explanation: "",
  });
  const [answer, setAnswer] = useState("");
  const [pairs, setPairs] = useState<[string, string][]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const res = await api.get(`/questions/${questionId}`);
        const { question_text, question_type, answer, explanation, tags } =
          res.data;

        setQuestionData({ question_text, question_type, explanation });

        if (question_type === "matching_pairs") {
          try {
            const parsedPairs = JSON.parse(answer);
            setPairs(parsedPairs);
          } catch {
            setPairs([]);
          }
        } else {
          setAnswer(answer);
        }

        setTags(tags ?? []);
      } catch (error) {
        console.error("Failed to fetch question", error);
        toast.error("Failed to load question");
      } finally {
        setLoading(false);
      }
    }

    if (questionId) fetchQuestion();
  }, [questionId]);

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...questionData,
        answer:
          questionData.question_type === "matching_pairs"
            ? JSON.stringify(pairs)
            : answer,
        tags: tags.filter((tag) => tag.trim() !== ""),
      };

      await api.put(`/questions/${questionId}`, payload);
      toast.success("Question updated!");
      router.back();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update question");
    }
  };

  const handlePairChange = (index: number, position: 0 | 1, value: string) => {
    const updated = [...pairs];
    updated[index][position] = value;
    setPairs(updated);
  };

  const addPair = () => {
    setPairs([...pairs, ["", ""]]);
  };

  const removePair = (index: number) => {
    const updated = [...pairs];
    updated.splice(index, 1);
    setPairs(updated);
  };

  const handleTagChange = (index: number, value: string) => {
    const updated = [...tags];
    updated[index] = value;
    setTags(updated);
  };

  const addTagField = () => {
    setTags([...tags, ""]);
  };

  const removeTag = (index: number) => {
    const updated = [...tags];
    updated.splice(index, 1);
    setTags(updated);
  };

  if (loading) {
    return <div className="p-6">Loading question...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Edit Question</h1>

      <form onSubmit={handleUpdateQuestion} className="flex flex-col gap-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Text
          </label>
          <Textarea
            value={questionData.question_text}
            onChange={(e) =>
              setQuestionData({
                ...questionData,
                question_text: e.target.value,
              })
            }
            placeholder="Enter the question here"
            required
          />
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Type
          </label>
          <select
            className="w-full border-gray-300 rounded-md shadow-sm"
            value={questionData.question_type}
            onChange={(e) =>
              setQuestionData({
                ...questionData,
                question_type: e.target.value,
              })
            }
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True/False</option>
            <option value="matching_pairs">Matching Pairs</option>
            <option value="listen_and_match">Listen and Match</option>
          </select>
        </div>

        {/* Correct Answer or Matching Pairs */}
        {questionData.question_type === "matching_pairs" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matching Pairs
            </label>
            {pairs.map((pair, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Input
                  placeholder="Left"
                  value={pair[0]}
                  onChange={(e) => handlePairChange(idx, 0, e.target.value)}
                />
                <Input
                  placeholder="Right"
                  value={pair[1]}
                  onChange={(e) => handlePairChange(idx, 1, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removePair(idx)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <Button type="button" onClick={addPair} className="mt-2">
              Add Pair
            </Button>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correct Answer
            </label>
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Correct Answer"
              required
            />
          </div>
        )}

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Explanation (optional)
          </label>
          <Textarea
            value={questionData.explanation}
            onChange={(e) =>
              setQuestionData({ ...questionData, explanation: e.target.value })
            }
            placeholder="Add an explanation if needed"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <div
                key={idx}
                className="flex items-center bg-gray-100 border rounded px-2 py-1"
              >
                <Input
                  value={tag}
                  onChange={(e) => handleTagChange(idx, e.target.value)}
                  className="w-24 border-none p-0 bg-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeTag(idx)}
                  className="ml-1 text-sm text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <Button type="button" onClick={addTagField} className="mt-2">
            Add Tag
          </Button>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit">Update Question</Button>
        </div>
      </form>
    </div>
  );
}
