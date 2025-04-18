"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
    lesson_id: "",
  });

  const [lessonTitle, setLessonTitle] = useState("");
  const [courseTitle, setCourseTitle] = useState("");

  const [answer, setAnswer] = useState("");
  const [pairs, setPairs] = useState<[string, string][]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    async function fetchQuestionContext() {
      try {
        const qRes = await api.get(`/questions/${questionId}`);
        const {
          question_text,
          question_type,
          answer,
          explanation,
          tags,
          lesson_id,
        } = qRes.data;

        setQuestionData({
          question_text,
          question_type,
          explanation,
          lesson_id,
        });

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

        const lessonRes = await api.get(`/lessons/detail/${lesson_id}`);
        setLessonTitle(lessonRes.data.title);

        const courseRes = await api.get(`/courses/${lessonRes.data.course_id}`);
        setCourseTitle(courseRes.data.title);
      } catch (error) {
        console.error("Failed to fetch question context", error);
        toast.error("Failed to load question details");
      } finally {
        setLoading(false);
      }
    }

    if (questionId) fetchQuestionContext();
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

  const addPair = () => setPairs([...pairs, ["", ""]]);

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

  const addTagField = () => setTags([...tags, ""]);

  const removeTag = (index: number) => {
    const updated = [...tags];
    updated.splice(index, 1);
    setTags(updated);
  };

  if (loading) {
    return <div className="p-6">Loading question...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header in Card format */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-2xl">Edit Question</CardTitle>
            <p className="text-gray-600 mt-1">
              <span className="font-semibold">Course:</span> {courseTitle}
              <br />
              <span className="font-semibold">Lesson:</span> {lessonTitle}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Edit Form */}
      <form
        onSubmit={handleUpdateQuestion}
        className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-md"
      >
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

        {/* Answer or Matching Pairs */}
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
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <div
                key={idx}
                className="flex items-center border border-gray-300 rounded-md px-2 py-1 bg-white focus-within:ring-2 focus-within:ring-ring focus-within:border-black"
              >
                <input
                  value={tag}
                  onChange={(e) => handleTagChange(idx, e.target.value)}
                  className="bg-transparent text-sm text-gray-800 outline-none px-1 w-auto"
                  style={{ width: `${Math.max(50, tag.length * 9)}px` }}
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
          <Button
            type="button"
            onClick={addTagField}
            className="mt-2"
            variant="outline"
          >
            Add Tag
          </Button>
        </div>

        {/* Submit + Cancel */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Update Question</Button>
        </div>
      </form>
    </div>
  );
}
