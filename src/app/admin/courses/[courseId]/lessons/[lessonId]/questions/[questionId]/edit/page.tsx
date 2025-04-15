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
    answer: "",
    explanation: "",
  });

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const res = await api.get(`/questions/${questionId}`);
        setQuestionData({
          question_text: res.data.question_text,
          question_type: res.data.question_type,
          answer: res.data.answer,
          explanation: res.data.explanation,
        });
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
      await api.put(`/questions/${questionId}`, questionData);
      toast.success("Question updated!");
      router.back(); // Go back to lesson page
    } catch (error) {
      console.error(error);
      toast.error("Failed to update question");
    }
  };

  if (loading) {
    return <div className="p-6">Loading question...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Edit Question</h1>

      <form onSubmit={handleUpdateQuestion} className="flex flex-col gap-6">
        {/* Question Text */}
        <Textarea
          value={questionData.question_text}
          onChange={(e) =>
            setQuestionData({ ...questionData, question_text: e.target.value })
          }
          placeholder="Question Text"
          required
        />

        {/* Question Type */}
        <select
          className="border rounded-md p-2"
          value={questionData.question_type}
          onChange={(e) =>
            setQuestionData({ ...questionData, question_type: e.target.value })
          }
        >
          <option value="multiple_choice">Multiple Choice</option>
          <option value="true_false">True/False</option>
          <option value="matching_pairs">Matching Pairs</option>
          <option value="listen_and_match">Listen and Match</option>
        </select>

        {/* Correct Answer */}
        <Input
          value={questionData.answer}
          onChange={(e) =>
            setQuestionData({ ...questionData, answer: e.target.value })
          }
          placeholder="Correct Answer"
          required
        />

        {/* Explanation */}
        <Textarea
          value={questionData.explanation}
          onChange={(e) =>
            setQuestionData({ ...questionData, explanation: e.target.value })
          }
          placeholder="Explanation (optional)"
        />

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit">Update Question</Button>
        </div>
      </form>
    </div>
  );
}
