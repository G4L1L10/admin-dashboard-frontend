"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { uploadViaSignedUrl } from "@/lib/upload";

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

  const [matchingPairMediaType, setMatchingPairMediaType] = useState<
    "text" | "image" | "audio"
  >("text");
  //  const [leftMediaUploads, setLeftMediaUploads] = useState<string[]>([]);
  const [leftMediaUploads, setLeftMediaUploads] = useState<(File | string)[]>(
    [],
  );
  //  const [leftMediaUploadsFiles, setLeftMediaUploadsFiles] = useState<
  //    (File | null)[]
  //  >([]);

  const [options, setOptions] = useState<string[]>(["", "", "", ""]);

  const [imageUrlPreview, setImageUrlPreview] = useState<string>("");
  const [audioUrlPreview, setAudioUrlPreview] = useState<string>("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

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

  const handleTagChange = (index: number, value: string) => {
    const updated = [...tags];
    updated[index] = value;
    setTags(updated);
  };

  const handleRemoveTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const addTagField = () => setTags([...tags, ""]);

  const handlePairChange = (index: number, pos: 0 | 1, value: string) => {
    const updatedPairs = [...pairs];
    updatedPairs[index][pos] = value;
    setPairs(updatedPairs);

    const updatedCorrectPairs = [...correctPairs];

    // Ensure the correctPairs array exists
    if (!updatedCorrectPairs[index]) {
      updatedCorrectPairs[index] = ["", ""];
    }

    // Only auto-fill the LEFT side (pos 0)
    if (pos === 0) {
      updatedCorrectPairs[index][0] = value;
    }

    setCorrectPairs(updatedCorrectPairs);
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
        const previewUrl = URL.createObjectURL(file);
        setImageUrlPreview(previewUrl);
        setImageFile(file); // Save file to be uploaded later
      } catch (err) {
        console.error("Failed to preview image:", err);
        toast.error("Image preview failed.");
      }
    }
  };

  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const previewUrl = URL.createObjectURL(file);
        setAudioUrlPreview(previewUrl);
        setAudioFile(file); // Save file to be uploaded later
      } catch (err) {
        console.error("Failed to preview audio:", err);
        toast.error("Audio preview failed.");
      }
    }
  };

  const handleRemovePair = (idx: number) => {
    const newPairs = [...pairs];
    const newCorrect = [...correctPairs];
    const newUploads = [...leftMediaUploads];
    newPairs.splice(idx, 1);
    newCorrect.splice(idx, 1);
    newUploads.splice(idx, 1);
    setPairs(newPairs);
    setCorrectPairs(newCorrect);
    setLeftMediaUploads(newUploads);
  };

  const buildPayload = () => {
    const payload: any = {
      lesson_id: lessonId,
      position: questionCount,
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

    if (questionType === "true_false") {
      payload.options = ["True", "False"];
      payload.answer = answer;
      payload.image_url = imageUrl || undefined;
      payload.audio_url = audioUrl || undefined;
    }

    if (questionType === "matching_pairs") {
      payload.pairs = pairs;
      payload.answer = JSON.stringify(correctPairs);
      payload.left_type = matchingPairMediaType;
      payload.image_url = imageUrl || undefined;
      payload.audio_url = audioUrl || undefined;
    }

    return payload;
  };

  async function uploadAndAttachMedia(
    questionId: string,
    courseId: string,
    lessonId: string,
  ) {
    const updates: Record<string, any> = {};
    const fullPayload = buildPayload();

    // DEBUG: Log initial state
    console.log("📦 Starting media upload...");
    console.log("🧠 courseId:", courseId);
    console.log("📚 lessonId:", lessonId);
    console.log("❓ questionId:", questionId);
    console.log("📸 imageFile:", imageFile);
    console.log("🔊 audioFile:", audioFile);
    console.log("🎯 leftMediaUploads:", leftMediaUploads);
    console.log("🎯 pairs:", pairs);

    // Upload image
    if (imageFile) {
      try {
        const imagePath = await uploadViaSignedUrl(
          imageFile,
          courseId,
          lessonId,
          questionId,
        );
        updates.image_url = imagePath;
        console.log("✅ Uploaded main image:", imagePath);
      } catch (err) {
        console.error("❌ Failed to upload image:", err);
        toast.error("Image upload failed.");
      }
    }

    // Upload audio
    if (audioFile) {
      try {
        const audioPath = await uploadViaSignedUrl(
          audioFile,
          courseId,
          lessonId,
          questionId,
        );
        updates.audio_url = audioPath;
        console.log("✅ Uploaded audio:", audioPath);
      } catch (err) {
        console.error("❌ Failed to upload audio:", err);
        toast.error("Audio upload failed.");
      }
    }

    // Matching pair media (image/audio)
    if (
      questionType === "matching_pairs" &&
      (matchingPairMediaType === "image" || matchingPairMediaType === "audio")
    ) {
      const updatedPairs: [string, string][] = [];

      if (pairs.length !== leftMediaUploads.length) {
        console.warn("⚠️ pairs and leftMediaUploads are out of sync!");
      }

      for (let i = 0; i < pairs.length; i++) {
        const left = leftMediaUploads[i];
        const right = pairs[i][1];

        try {
          let uploadedPath: string;

          if (left instanceof File) {
            uploadedPath = await uploadViaSignedUrl(
              left,
              courseId,
              lessonId,
              questionId,
            );
            console.log(`✅ Uploaded pair[${i}] media:`, uploadedPath);
          } else if (typeof left === "string") {
            uploadedPath = left;
            console.log(`📁 Used existing path for pair[${i}]:`, uploadedPath);
          } else {
            console.warn(`⚠️ Invalid left-side data for pair[${i}]`, left);
            continue;
          }

          updatedPairs.push([uploadedPath, right]);

          // Update correctPairs to use uploaded path
          if (correctPairs[i]) {
            correctPairs[i][0] = uploadedPath;
          } else {
            correctPairs[i] = [uploadedPath, ""];
          }
        } catch (err) {
          console.error(`❌ Failed to upload media for pair ${i + 1}:`, err);
          toast.error(`Failed to upload media for pair ${i + 1}`);
        }
      }

      updates.pairs = updatedPairs;
      updates.answer = JSON.stringify(correctPairs);
    }

    // Final PATCH if updates exist
    if (Object.keys(updates).length > 0) {
      try {
        await api.put(`/questions/${questionId}`, {
          ...fullPayload,
          ...updates,
        });
        console.log("✅ Final question updated with all media.");
      } catch (err) {
        console.error("❌ Failed to update question with media:", err);
        toast.error("Failed to save uploaded media to question.");
      }
    } else {
      console.log("ℹ️ No media updates detected, skipping PATCH.");
    }
  }

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (questionCount >= 12) {
      toast.warning("You have already created 12 questions for this lesson.");
      return;
    }

    if (
      questionType === "matching_pairs" &&
      (matchingPairMediaType === "image" || matchingPairMediaType === "audio")
    ) {
      const incomplete = pairs.some((p) => !p[0]);
      if (incomplete) {
        toast.error("Please upload a file for every left-side pair.");
        return;
      }
    }

    try {
      // Step 1: Create base question without media
      const basePayload = buildPayload();
      delete basePayload.image_url;
      delete basePayload.audio_url;

      const res = await api.post("/questions", basePayload);
      const questionId = res.data.id;

      // Step 2: Attach media (image/audio)
      await uploadAndAttachMedia(
        questionId,
        courseId as string,
        lessonId as string,
      );

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
      // Step 1: Create base question without media
      const basePayload = buildPayload();
      delete basePayload.image_url;
      delete basePayload.audio_url;

      const res = await api.post("/questions", basePayload);
      const questionId = res.data.id;

      // Step 2: Attach media
      await uploadAndAttachMedia(
        questionId,
        courseId as string,
        lessonId as string,
      );

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
            className="w-64 p-2 border-gray-300 rounded-md border-1 text-sm"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True/False</option>
            <option value="matching_pairs">Matching Pairs</option>
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
                className="mb-2 w-96"
              />
            ))}
          </div>
        )}

        {/* MEDIA TYPE (LEFT SIDE) */}
        {questionType === "matching_pairs" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Media Type (Left Side)
            </label>
            <select
              value={matchingPairMediaType}
              onChange={(e) => {
                const type = e.target.value as "text" | "image" | "audio";
                setMatchingPairMediaType(type);
                setLeftMediaUploads(Array(pairs.length).fill(""));
              }}
              className="w-64 p-2 border-gray-300 text-sm rounded-md border-1"
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
            </select>
          </div>
        )}

        {questionType === "matching_pairs" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Matching Pairs (Options)
              </label>

              {pairs.map((pair, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 mb-4 items-start relative group"
                >
                  {/* Left side */}
                  <div>
                    {matchingPairMediaType === "text" && (
                      <Input
                        placeholder="Left side"
                        className="w-64"
                        value={pair[0] ?? ""}
                        onChange={(e) =>
                          handlePairChange(idx, 0, e.target.value)
                        }
                        required
                      />
                    )}

                    {(matchingPairMediaType === "image" ||
                      matchingPairMediaType === "audio") && (
                        <>
                          <Input
                            type="file"
                            className="w-64 font-light text-gray-500"
                            accept={
                              matchingPairMediaType === "image"
                                ? "image/*"
                                : "audio/*"
                            }
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              // Store the File object, NOT the blob preview URL
                              const updatedPairs = [...pairs];
                              updatedPairs[idx][0] = file.name;
                              setPairs(updatedPairs);

                              const updatedCorrect = [...correctPairs];
                              if (!updatedCorrect[idx])
                                updatedCorrect[idx] = ["", ""];
                              updatedCorrect[idx][0] = file.name;
                              setCorrectPairs(updatedCorrect);

                              const updatedUploads = [...leftMediaUploads];
                              updatedUploads[idx] = file; // ✅ this must be the File
                              setLeftMediaUploads(updatedUploads);
                            }}
                            required
                          />
                          {/* Previews */}
                          {matchingPairMediaType === "image" &&
                            leftMediaUploads[idx] && (
                              <>
                                {leftMediaUploads[idx] instanceof File ? (
                                  <img
                                    src={URL.createObjectURL(
                                      leftMediaUploads[idx] as File,
                                    )}
                                    alt="Preview"
                                    className="mt-2 max-h-24 rounded-md border"
                                  />
                                ) : (
                                  <img
                                    src={leftMediaUploads[idx] as string}
                                    alt="Preview"
                                    className="mt-2 max-h-24 rounded-md border"
                                  />
                                )}
                              </>
                            )}

                          {matchingPairMediaType === "audio" &&
                            leftMediaUploads[idx] && (
                              <>
                                {leftMediaUploads[idx] instanceof File ? (
                                  <audio
                                    controls
                                    className="mt-2 w-full max-w-sm"
                                  >
                                    <source
                                      src={URL.createObjectURL(
                                        leftMediaUploads[idx] as File,
                                      )}
                                    />
                                    Your browser does not support the audio
                                    element.
                                  </audio>
                                ) : (
                                  <audio
                                    controls
                                    className="mt-2 w-full max-w-sm"
                                  >
                                    <source
                                      src={leftMediaUploads[idx] as string}
                                    />
                                    Your browser does not support the audio
                                    element.
                                  </audio>
                                )}
                              </>
                            )}
                        </>
                      )}
                  </div>

                  {/* Right side (always text input) */}
                  <Input
                    placeholder="Right side"
                    value={pair[1]}
                    className="w-64"
                    onChange={(e) => handlePairChange(idx, 1, e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-gray-400 hover:text-red-600 ml-2 p-1 rounded transition"
                    size="icon"
                    onClick={() => handleRemovePair(idx)}
                  >
                    ✖
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={addPairField} className="mt-2">
                Add Pair
              </Button>
            </div>

            {/* CORRECT MATCHING (ANSWER)*/}
            <div>
              <label className="block text-sm font-medium mb-1 mt-6">
                Correct Matching (Answer)
              </label>
              {correctPairs.map((pair, idx) => (
                <div key={idx} className="flex gap-4 mb-2">
                  <Input
                    placeholder="Left side (Correct)"
                    className="w-64"
                    value={pair[0]}
                    onChange={(e) =>
                      handleCorrectPairChange(idx, 0, e.target.value)
                    }
                    required
                  />
                  <Input
                    placeholder="Right side (Correct)"
                    className="w-64"
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
            <label className="block text-sm mb-1">Correct Answer</label>
            {questionType === "true_false" ? (
              <select
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-64 p-2 border-gray-300 text-sm rounded-md border-1"
                required
              >
                <option value="">Select Answer</option>
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            ) : (
              <Input
                value={answer}
                className="w-96"
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

        {/* Tags */}
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
                onClick={() => handleRemoveTag(idx)}
              >
                ✖
              </Button>
            </div>
          ))}

          <Button type="button" onClick={addTagField} className="mt-2">
            Add Tag
          </Button>
        </div>

        <>
          <div>
            <label className="block text-sm font-medium mb-1">
              Upload Image (optional)
            </label>
            <Input
              key={`image-${fileResetKey}`}
              className="w-64 font-light text-gray-500"
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
              className="w-64 font-light text-gray-500"
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
