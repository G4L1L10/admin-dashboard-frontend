"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";
import SignedImage from "@/components/SignedImage";
import SignedAudio from "@/components/SignedAudio";

export default function EditQuestionPage() {
  const { questionId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [questionData, setQuestionData] = useState({
    question_text: "",
    question_type: "multiple_choice",
    explanation: "",
    lesson_id: "",
    image_url: "",
    audio_url: "",
    position: 0,
  });

  const [lessonTitle, setLessonTitle] = useState("");
  const [courseTitle, setCourseTitle] = useState("");

  const [answer, setAnswer] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
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
          image_url,
          audio_url,
          options,
          position,
        } = qRes.data;

        setQuestionData({
          question_text,
          question_type,
          explanation,
          lesson_id,
          image_url: image_url ?? "",
          audio_url: audio_url ?? "",
          position,
        });

        if (question_type === "matching_pairs") {
          try {
            const parsedPairs = JSON.parse(answer);
            setPairs(parsedPairs);
          } catch {
            setPairs([]);
          }
        } else {
          setAnswer(answer ?? "");
        }

        if (question_type === "multiple_choice") {
          setOptions(options ?? ["", "", "", ""]);
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

    const payload = {
      ...questionData,
      answer:
        questionData.question_type === "matching_pairs"
          ? JSON.stringify(pairs)
          : answer,
      options: questionData.question_type === "multiple_choice" ? options : [],
      tags: tags.filter((tag) => tag.trim() !== ""),
    };

    try {
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

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleTagChange = (index: number, value: string) => {
    const updated = [...tags];
    updated[index] = value;
    setTags(updated);
  };

  const addTagField = () => setTags([...tags, ""]);
  const removeTag = (index: number) =>
    setTags(tags.filter((_, i) => i !== index));

  if (loading) {
    return <div className="p-6">Loading question...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-2xl">Edit Question</CardTitle>
            <p className="text-gray-600 mt-1">
              <span className="font-semibold">Course:</span> {courseTitle}
              <br />
              <span className="font-semibold">Lesson:</span> {lessonTitle}
              <br />
              <span className="font-semibold">Question Position:</span>{" "}
              {questionData.position}
            </p>
          </div>
        </CardHeader>
      </Card>

      <form
        onSubmit={handleUpdateQuestion}
        className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-md"
      >
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium mb-1">
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
          <label className="block text-sm font-medium mb-1">
            Question Type
          </label>
          <select
            className="w-64 p-2 border-gray-300 rounded-md border-1 text-sm"
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
          </select>
        </div>

        {/* Multiple Choice Options */}
        {questionData.question_type === "multiple_choice" && (
          <div>
            <label className="block text-sm font-medium mb-1">Options</label>
            {options.map((opt, idx) => (
              <Input
                key={idx}
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                className="w-96 p-2 border-gray-300 rounded-md border-1 text-sm mb-2"
              />
            ))}
          </div>
        )}

        {/* Matching Pairs */}
        {questionData.question_type === "matching_pairs" && (
          <div>
            <label className="block text-sm font-medium mb-1">
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
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removePair(idx)}
                >
                  ✖
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addPair} className="mt-2">
              Add Pair
            </Button>
          </div>
        )}

        {/* Correct Answer */}
        {questionData.question_type !== "matching_pairs" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Correct Answer
            </label>
            {questionData.question_type === "true_false" ? (
              <select
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-64 p-2 border-gray-300 text-sm rounded-md border-1"
              >
                <option value="">Select Answer</option>
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            ) : (
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-96 p-2 border-gray-300 rounded-md border-1 text-sm mb-2"
              />
            )}
          </div>
        )}

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium mb-1">Explanation</label>
          <Textarea
            value={questionData.explanation}
            onChange={(e) =>
              setQuestionData({ ...questionData, explanation: e.target.value })
            }
          />
        </div>

        {/* Image */}
        {questionData.image_url && (
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <SignedImage object={questionData.image_url} />
          </div>
        )}

        {/* Audio */}
        {questionData.audio_url && (
          <div>
            <label className="block text-sm font-medium mb-1">Audio</label>
            <SignedAudio object={questionData.audio_url} />
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <div
                key={idx}
                className="flex items-center border border-gray-300 rounded-md px-2 py-1"
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

        {/* Actions */}
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
