"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";

export default function CreateQuestionsPage() {
  const { lessonId } = useParams();
  const [lessonTitle, setLessonTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [tags, setTags] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(1);

  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await api.get(`/lessons/detail/${lessonId}`);
        setLessonTitle(res.data.title);
      } catch (error) {
        console.error("Failed to fetch lesson:", error);
        setLessonTitle("Unknown Lesson");
      } finally {
        setLoading(false);
      }
    }

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleTagChange = (index: number, value: string) => {
    const updatedTags = [...tags];
    updatedTags[index] = value;
    setTags(updatedTags);
  };

  const addTagField = () => setTags([...tags, ""]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/questions", {
        lesson_id: lessonId,
        question_text: questionText,
        question_type: questionType,
        answer,
        explanation,
        options,
        tags,
      });

      alert("Question created successfully!");
      setQuestionCount((prev) => prev + 1);

      // Clear form
      setQuestionText("");
      setQuestionType("multiple_choice");
      setAnswer("");
      setExplanation("");
      setOptions(["", "", "", ""]);
      setTags([]);
    } catch (error) {
      console.error("Failed to create question:", error);
      alert("Failed to create question. Check console for details.");
    }
  };

  if (loading) {
    return <div className="p-6">Loading lesson...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Create Questions for Lesson: "{lessonTitle}"
      </h1>

      <p className="mb-4 text-gray-600">Question {questionCount} of 12</p>

      <form onSubmit={handleCreateQuestion} className="flex flex-col gap-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Question Text
          </label>
          <Textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
          />
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Question Type
          </label>
          <select
            className="w-full border-gray-300 rounded-md shadow-sm"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True/False</option>
          </select>
        </div>

        {/* Correct Answer */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Correct Answer
          </label>
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Explanation (optional)
          </label>
          <Textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium mb-1">Options</label>
          {options.map((option, idx) => (
            <Input
              key={idx}
              value={option}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              required
              className="mb-2"
            />
          ))}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tags (optional)
          </label>
          {tags.map((tag, idx) => (
            <Input
              key={idx}
              value={tag}
              onChange={(e) => handleTagChange(idx, e.target.value)}
              placeholder={`Tag ${idx + 1}`}
              className="mb-2"
            />
          ))}
          <Button type="button" onClick={addTagField} className="mt-2">
            Add Tag
          </Button>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit">Save Question</Button>
        </div>
      </form>
    </div>
  );
}
