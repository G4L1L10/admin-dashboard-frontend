"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
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
  const [pairs, setPairs] = useState<[string, string][]>([]);
  const [questionCount, setQuestionCount] = useState(1);

  const [imageUrl, setImageUrl] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");

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

  const handlePairChange = (index: number, position: 0 | 1, value: string) => {
    const updatedPairs = [...pairs];
    updatedPairs[index][position] = value;
    setPairs(updatedPairs);
  };

  const addPairField = () => {
    if (pairs.length >= 8) {
      alert("You can only add up to 8 matching pairs.");
      return;
    }
    setPairs([...pairs, ["", ""]]);
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let payload: any = {
        lesson_id: lessonId,
        question_text: questionText,
        question_type: questionType,
        image_url: imageUrl || undefined,
        audio_url: audioUrl || undefined,
        explanation,
        tags,
      };

      if (
        questionType === "multiple_choice" ||
        questionType === "listen_and_match"
      ) {
        payload.options = options;
        payload.answer = answer;
      }

      if (questionType === "true_false") {
        payload.options = ["True", "False"];
        payload.answer = answer;
      }

      if (questionType === "matching_pairs") {
        payload.pairs = pairs;
        payload.answer = ""; // ✅ Important for matching pairs
      }

      await api.post("/questions", payload);

      toast.success("Question created successfully!");
      setQuestionCount((prev) => prev + 1);

      // Clear form
      setQuestionText("");
      setQuestionType("multiple_choice");
      setAnswer("");
      setExplanation("");
      setOptions(["", "", "", ""]);
      setTags([]);
      setPairs([]);
      setImageUrl("");
      setAudioUrl("");
    } catch (error) {
      console.error("Failed to create question:", error);
      toast.error("Failed to create question. Check console for details.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setImageUrl(tempUrl);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setAudioUrl(tempUrl);
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
            <option value="matching_pairs">Matching Pairs</option>
            <option value="listen_and_match">Listen and Match</option>{" "}
            {/* ✅ New type */}
          </select>
        </div>

        {/* Dynamic Section based on Question Type */}
        {(questionType === "multiple_choice" ||
          questionType === "listen_and_match") && (
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
        )}

        {questionType === "true_false" && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm">Options are fixed: True and False</p>
          </div>
        )}

        {questionType === "matching_pairs" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Matching Pairs
            </label>
            {pairs.map((pair, idx) => (
              <div key={idx} className="flex gap-4 mb-2">
                <Input
                  placeholder="Left side (e.g., 1 2 3 4)"
                  value={pair[0]}
                  onChange={(e) => handlePairChange(idx, 0, e.target.value)}
                  required
                />
                <Input
                  placeholder="Right side (e.g., q_q_q_q.png)"
                  value={pair[1]}
                  onChange={(e) => handlePairChange(idx, 1, e.target.value)}
                  required
                />
              </div>
            ))}
            <Button type="button" onClick={addPairField} className="mt-2">
              Add Pair
            </Button>
          </div>
        )}

        {/* Correct Answer */}
        {questionType !== "matching_pairs" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Correct Answer
            </label>
            {questionType === "true_false" ? (
              <select
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm"
                required
              >
                <option value="">Select Answer</option>
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            ) : (
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
              />
            )}
          </div>
        )}

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

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Image (optional)
          </label>
          <Input type="file" accept="image/*" onChange={handleImageChange} />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="mt-4 max-h-48 rounded-lg"
            />
          )}
        </div>

        {/* Audio Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Audio (optional)
          </label>
          <Input type="file" accept="audio/*" onChange={handleAudioChange} />
          {audioUrl && (
            <audio controls className="mt-4">
              <source src={audioUrl} />
              Your browser does not support the audio element.
            </audio>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit">Save Question</Button>
        </div>
      </form>
    </div>
  );
}
