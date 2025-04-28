"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { uploadMedia } from "@/lib/upload";

export default function CreateQuestionsPage() {
  const { courseId, lessonId } = useParams();
  const router = useRouter();

  const [lessonTitle, setLessonTitle] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [pairs, setPairs] = useState<[string, string][]>([]);
  const [correctPairs, setCorrectPairs] = useState<[string, string][]>([]);
  const [questionCount, setQuestionCount] = useState(1);

  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [imageOptions, setImageOptions] = useState<string[]>(["", "", "", ""]);

  const [imageUrlPreview, setImageUrlPreview] = useState<string>("");
  const [audioUrlPreview, setAudioUrlPreview] = useState<string>("");

  const [imageUrl, setImageUrl] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");

  const [fileResetKey, setFileResetKey] = useState(0);

  useEffect(() => {
    async function fetchLessonAndCourse() {
      try {
        const lessonRes = await api.get(`/lessons/detail/${lessonId}`);
        setLessonTitle(lessonRes.data.title);

        const courseRes = await api.get(`/courses/${lessonRes.data.course_id}`);
        setCourseTitle(courseRes.data.title);

        const questionsRes = await api.get(`/lessons/${lessonId}/questions`);
        setQuestionCount((questionsRes.data?.length || 0) + 1);
      } catch (error) {
        console.error("Failed to fetch lesson or course", error);
        toast.error("Failed to load lesson and course info");
      } finally {
        setLoading(false);
      }
    }

    if (lessonId) fetchLessonAndCourse();
  }, [lessonId]);

  const handleTextOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleImageOptionChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadMedia(file);
        const updated = [...imageOptions];
        updated[index] = url;
        setImageOptions(updated);
      } catch (err) {
        console.error("Failed to upload image option:", err);
        toast.error("Image option upload failed.");
      }
    }
  };

  const handleTagChange = (index: number, value: string) => {
    const updated = [...tags];
    updated[index] = value;
    setTags(updated);
  };

  const addTagField = () => setTags([...tags, ""]);

  const handlePairChange = (index: number, pos: 0 | 1, value: string) => {
    const updated = [...pairs];
    updated[index][pos] = value;
    setPairs(updated);
  };

  const handleCorrectPairChange = (
    index: number,
    pos: 0 | 1,
    value: string,
  ) => {
    const updated = [...correctPairs];
    updated[index][pos] = value;
    setCorrectPairs(updated);
  };

  const addPairField = () => {
    if (pairs.length >= 8) {
      alert("You can only add up to 8 matching pairs.");
      return;
    }
    setPairs([...pairs, ["", ""]]);
    setCorrectPairs([...correctPairs, ["", ""]]);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const objectPath = await uploadMedia(file);
        const res = await api.get("/media/signed-url", {
          params: { object: objectPath },
        });
        setImageUrlPreview(res.data.url);
        setImageUrl(objectPath);
      } catch (err) {
        console.error("Failed to upload image:", err);
        toast.error("Image upload failed.");
      }
    }
  };

  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const objectPath = await uploadMedia(file);
        const res = await api.get("/media/signed-url", {
          params: { object: objectPath },
        });
        setAudioUrlPreview(res.data.url);
        setAudioUrl(objectPath);
      } catch (err) {
        console.error("Failed to upload audio:", err);
        toast.error("Audio upload failed.");
      }
    }
  };

  const buildPayload = () => {
    const payload: any = {
      lesson_id: lessonId,
      question_text: questionText,
      question_type: questionType,
      explanation,
      tags,
    };

    if (questionType === "multiple_choice") {
      payload.options = options;
      payload.answer = answer;
      payload.image_url = imageUrl || undefined;
      payload.audio_url = audioUrl || undefined;
    }

    if (questionType === "listen_and_match") {
      payload.options = imageOptions.map((url) => ({ imageUrl: url }));
      payload.answer = answer;
      payload.audio_url = audioUrl || undefined;
    }

    if (questionType === "true_false") {
      payload.options = ["True", "False"];
      payload.answer = answer;
      payload.image_url = imageUrl || undefined;
      payload.audio_url = audioUrl || undefined;
    }

    if (questionType === "matching_pairs") {
      payload.pairs = pairs;
      payload.answer = JSON.stringify(correctPairs);
      payload.image_url = imageUrl || undefined;
      payload.audio_url = audioUrl || undefined;
    }

    return payload;
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (questionCount >= 12) {
      toast.warning("You have already created 12 questions for this lesson.");
      return;
    }

    try {
      const payload = buildPayload();
      await api.post("/questions", payload);
      toast.success("Question created successfully!");
      setQuestionCount((prev) => prev + 1);
      resetForm();
    } catch (error) {
      console.error("Failed to create question:", error);
      toast.error("Failed to create question.");
    }
  };

  const handleSaveAndFinish = async () => {
    try {
      const payload = buildPayload();
      await api.post("/questions", payload);
      toast.success("Question saved and finished!");
      router.push(`/admin/courses/${courseId}/lessons/${lessonId}/questions`);
    } catch (error) {
      console.error("Failed to finish saving question:", error);
      toast.error("Failed to finish and navigate.");
    }
  };

  const resetForm = () => {
    setQuestionText("");
    setQuestionType("multiple_choice");
    setAnswer("");
    setExplanation("");
    setTags([]);
    setPairs([]);
    setCorrectPairs([]);
    setOptions(["", "", "", ""]);
    setImageOptions(["", "", "", ""]);
    setImageUrl("");
    setAudioUrl("");
    setImageUrlPreview("");
    setAudioUrlPreview("");
    setFileResetKey((prev) => prev + 1);
  };

  if (loading) return <div className="p-6">Loading lesson...</div>;

  if (questionCount > 12) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <Card>
          <CardHeader className="flex flex-col items-center gap-4">
            <CardTitle className="text-2xl text-green-600">
              🎉 All Questions Created!
            </CardTitle>
            <p className="text-gray-600 text-center">
              You have completed 12 out of 12 questions for this lesson.
            </p>
            <Button
              onClick={() =>
                router.push(
                  `/admin/courses/${courseId}/lessons/${lessonId}/questions`,
                )
              }
            >
              Back to Questions
            </Button>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isListenAndMatch = questionType === "listen_and_match";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-xl">Create Question</CardTitle>
            <p className="text-gray-600 mt-5">
              <span className="font-semibold">Course:</span> {courseTitle}
              <br />
              <span className="font-semibold">Lesson:</span> {lessonTitle}
            </p>
          </div>
        </CardHeader>
      </Card>

      <p className="text-gray-600">Question {questionCount} of 12</p>

      <form
        onSubmit={handleCreateQuestion}
        className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-md"
      >
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
            <option value="listen_and_match">Listen and Match</option>
          </select>
        </div>

        {questionType === "multiple_choice" && (
          <div>
            <label className="block text-sm font-medium mb-1">Options</label>
            {options.map((option, idx) => (
              <Input
                key={idx}
                value={option}
                onChange={(e) => handleTextOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                required
                className="mb-2"
              />
            ))}
          </div>
        )}

        {isListenAndMatch && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Upload Image Options
            </label>
            {imageOptions.map((option, idx) => (
              <div key={idx} className="flex flex-col gap-2 mb-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageOptionChange(idx, e)}
                  required
                />
                {option && (
                  <img
                    src={option}
                    alt={`Option ${idx + 1}`}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {questionType === "matching_pairs" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Matching Pairs (Options)
              </label>
              {pairs.map((pair, idx) => (
                <div key={idx} className="flex gap-4 mb-2">
                  <Input
                    placeholder="Left side"
                    value={pair[0]}
                    onChange={(e) => handlePairChange(idx, 0, e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Right side"
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

            <div>
              <label className="block text-sm font-medium mb-1 mt-6">
                Correct Matching (Answer)
              </label>
              {correctPairs.map((pair, idx) => (
                <div key={idx} className="flex gap-4 mb-2">
                  <Input
                    placeholder="Left side (Correct)"
                    value={pair[0]}
                    onChange={(e) =>
                      handleCorrectPairChange(idx, 0, e.target.value)
                    }
                    required
                  />
                  <Input
                    placeholder="Right side (Correct)"
                    value={pair[1]}
                    onChange={(e) =>
                      handleCorrectPairChange(idx, 1, e.target.value)
                    }
                    required
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {!questionType.includes("matching_pairs") && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Correct Answer
            </label>
            {isListenAndMatch ? (
              <select
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm"
                required
              >
                <option value="">Select Correct Image</option>
                <option value="0">Option 1</option>
                <option value="1">Option 2</option>
                <option value="2">Option 3</option>
                <option value="3">Option 4</option>
              </select>
            ) : questionType === "true_false" ? (
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

        <div>
          <label className="block text-sm font-medium mb-1">
            Explanation (optional)
          </label>
          <Textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
        </div>

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

        {!isListenAndMatch && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Upload Image (optional)
              </label>
              <Input
                key={`image-${fileResetKey}`}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />{" "}
              {imageUrlPreview && (
                <img
                  src={imageUrlPreview}
                  alt="Preview"
                  className="mt-4 max-h-48 rounded-lg"
                />
              )}{" "}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Upload Audio (optional)
              </label>
              <Input
                key={`audio-${fileResetKey}`}
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
              />{" "}
              {audioUrlPreview && (
                <audio controls className="mt-4">
                  <source src={audioUrlPreview} />
                  Your browser does not support the audio element.
                </audio>
              )}{" "}
            </div>
          </>
        )}

        <div className="flex justify-end gap-4 flex-wrap">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveAndFinish}
          >
            Save and exit
          </Button>
        </div>
      </form>
    </div>
  );
}
