// back tio this
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
import { uploadViaSignedUrl } from "@/lib/upload";

export default function EditQuestionPage() {
  const { questionId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [questionData, setQuestionData] = useState({
    question_text: "",
    question_type: "multiple_choice",
    explanation: "",
    course_id: "",
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
  const [correctPairs, setCorrectPairs] = useState<[string, string][]>([]);
  const [leftMediaType, setLeftMediaType] = useState<
    "text" | "image" | "audio"
  >("text");
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

        // 🧠 Step 1: Fetch lesson details (to get course_id)
        const lessonRes = await api.get(`/lessons/detail/${lesson_id}`);
        const courseId = lessonRes.data.course_id;

        // 🧠 Step 2: Fetch course details (optional)
        const courseRes = await api.get(`/courses/${courseId}`);

        // ✅ Step 3: Set state with all required values
        setQuestionData({
          question_text,
          question_type,
          explanation,
          lesson_id,
          image_url: image_url ?? "",
          audio_url: audio_url ?? "",
          position,
          course_id: courseId, // ✅ Add this to be used in uploads
        });

        setLessonTitle(lessonRes.data.title);
        setCourseTitle(courseRes.data.title);

        // Handle answer and pairs
        if (question_type === "matching_pairs") {
          try {
            const parsed = JSON.parse(answer);
            setCorrectPairs(parsed);
          } catch {
            setCorrectPairs([]);
          }
        } else {
          setAnswer(answer ?? "");
        }

        if (question_type === "multiple_choice") {
          setOptions(options ?? ["", "", "", ""]);
        }

        setTags(tags ?? []);

        // Parse options for matching pairs
        const rawOptions = qRes.data.options ?? [];
        const formattedPairs = rawOptions
          .filter((opt: string) => opt.includes("::"))
          .map((opt: string) => {
            const [left, right] = opt.split("::").map((s) => s.trim());
            return [left, right] as [string, string];
          });
        setPairs(formattedPairs);
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
          ? JSON.stringify(correctPairs)
          : answer,
      options:
        questionData.question_type === "multiple_choice"
          ? options
          : pairs.map(([left, right]) => `${left} :: ${right}`),
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

  const handlePairChange = (idx: number, side: 0 | 1, value: string) => {
    const updated = [...pairs];
    updated[idx][side] = value;
    setPairs(updated);

    if (correctPairs[idx]) {
      const correct = [...correctPairs];
      correct[idx][0] = updated[idx][0]; // auto-update left
      setCorrectPairs(correct);
    } else {
      setCorrectPairs([...correctPairs, [updated[idx][0], ""]]);
    }
  };

  const handleCorrectAnswerChange = (idx: number, value: string) => {
    const updated = [...correctPairs];
    if (!updated[idx]) updated[idx] = [pairs[idx]?.[0] ?? "", ""];
    updated[idx][1] = value;
    setCorrectPairs(updated);
  };

  const addPair = () => {
    setPairs([...pairs, ["", ""]]);
    setCorrectPairs([...correctPairs, ["", ""]]);
  };

  const removePair = (idx: number) => {
    const p = [...pairs];
    const a = [...correctPairs];
    p.splice(idx, 1);
    a.splice(idx, 1);
    setPairs(p);
    setCorrectPairs(a);
  };

  const handleTagChange = (idx: number, value: string) => {
    const updated = [...tags];
    updated[idx] = value;
    setTags(updated);
  };

  const addTagField = () => setTags([...tags, ""]);
  const removeTag = (idx: number) => setTags(tags.filter((_, i) => i !== idx));

  const handleOptionChange = (idx: number, value: string) => {
    const updated = [...options];
    updated[idx] = value;
    setOptions(updated);
  };

  const handleAnswerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setAnswer(e.target.value);
  };

  if (loading) return <div className="p-6">Loading question...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Question</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Course:</strong> {courseTitle} <br />
            <strong>Lesson:</strong> {lessonTitle} <br />
            <strong>Question Position:</strong> {questionData.position}
          </p>
        </CardHeader>
      </Card>

      <form
        onSubmit={handleUpdateQuestion}
        className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-md"
      >
        <div>
          <label className="block text-sm mb-1">Question Text</label>
          <Textarea
            value={questionData.question_text}
            onChange={(e) =>
              setQuestionData({
                ...questionData,
                question_text: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Question Type</label>
          <select
            value={questionData.question_type}
            onChange={(e) =>
              setQuestionData({
                ...questionData,
                question_type: e.target.value,
              })
            }
            className="w-64 p-2 border rounded-md"
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True/False</option>
            <option value="matching_pairs">Matching Pairs</option>
          </select>
        </div>

        {/* OPTIONS */}
        {questionData.question_type === "multiple_choice" && (
          <div>
            <label className="block text-sm mb-1">Options</label>
            {options.map((opt, idx) => (
              <Input
                key={idx}
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                className="mb-2 w-96 p-2 border rounded-md"
              />
            ))}
          </div>
        )}

        {/* MATCHING PAIRS */}
        {questionData.question_type === "matching_pairs" && (
          <>
            <div>
              <label className="block text-sm mb-1">
                Media Type (Left Side)
              </label>
              <select
                value={leftMediaType}
                onChange={(e) =>
                  setLeftMediaType(e.target.value as "text" | "image" | "audio")
                }
                className="w-64 p-2 border rounded"
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="audio">Audio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 mt-4">
                Matching Pairs (Options)
              </label>
              {pairs.map((pair, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
                  <Input
                    placeholder="Left"
                    value={pair[0]}
                    onChange={(e) => handlePairChange(idx, 0, e.target.value)}
                    className="w-64"
                  />
                  <Input
                    placeholder="Right"
                    value={pair[1]}
                    onChange={(e) => handlePairChange(idx, 1, e.target.value)}
                    className="w-64"
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

            <div>
              <label className="block text-sm font-medium mb-1 mt-6">
                Correct Matching (Answer)
              </label>
              {correctPairs.map((pair, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input
                    value={pairs[idx]?.[0] || ""}
                    disabled
                    className="w-64 bg-gray-100"
                  />
                  <Input
                    value={pair[1] || ""}
                    onChange={(e) =>
                      handleCorrectAnswerChange(idx, e.target.value)
                    }
                    className="w-64"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* TRUE FALSE */}
        {questionData.question_type === "true_false" && (
          <div>
            <label className="block text-sm mb-1">Correct Answer</label>
            <select
              value={answer}
              onChange={handleAnswerChange}
              className="w-64 p-2 border rounded"
            >
              <option value="">Select</option>
              <option value="True">True</option>
              <option value="False">False</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm mb-1">Explanation</label>
          <Textarea
            value={questionData.explanation}
            onChange={(e) =>
              setQuestionData({ ...questionData, explanation: e.target.value })
            }
          />
        </div>

        {questionData.image_url && (
          <div>
            <label className="block text-sm mb-1">Image</label>
            <SignedImage object={questionData.image_url} />
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuestionData({ ...questionData, image_url: "" });
                }}
              >
                Remove Image
              </Button>
            </div>
          </div>
        )}

        {!questionData.image_url && (
          <div>
            <label className="block text-sm mb-1">Upload New Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                try {
                  const objectPath = await uploadViaSignedUrl(
                    file,
                    questionData.course_id,
                    questionData.lesson_id,
                    questionId as string,
                  );

                  setQuestionData((prev) => ({
                    ...prev,
                    image_url: objectPath,
                  }));
                  toast.success("Image uploaded!");
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to upload image");
                }
              }}
            />
          </div>
        )}

        {questionData.audio_url ? (
          <div>
            <label className="block text-sm mb-1">Audio</label>
            <SignedAudio object={questionData.audio_url} />
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setQuestionData((prev) => ({ ...prev, audio_url: "" }))
                }
              >
                Remove Audio
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm mb-1">Upload New Audio</label>
            <input
              type="file"
              accept="audio/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                try {
                  const objectPath = await uploadViaSignedUrl(
                    file,
                    questionData.course_id,
                    questionData.lesson_id,
                    questionId as string,
                  );

                  setQuestionData((prev) => ({
                    ...prev,
                    audio_url: objectPath,
                  }));
                  toast.success("Audio uploaded!");
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to upload audio");
                }
              }}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Tags (optional)
          </label>

          {tags.map((tag, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <Input
                value={tag}
                onChange={(e) => handleTagChange(idx, e.target.value)}
                placeholder={`Tag ${idx + 1}`}
                className="w-64"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-600"
                onClick={() => removeTag(idx)}
              >
                ✖
              </Button>
            </div>
          ))}

          <Button type="button" onClick={addTagField} className="mt-2">
            Add Tag
          </Button>
        </div>

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
