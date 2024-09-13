import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from '../utils/axiosConfig';

type Option = {
  id: number;
  text: string;
  is_correct: boolean;
};

type Question = {
  id: number;
  text: string;
  answer: string;
  options: Option[];
};

type Quiz = {
  id: number;
  title: string;
  description: string;
  department: string;
  questions: Question[];
};

const UpdateQuiz: React.FC = () => {
  const router = useRouter();
  const { quizId, userID } = router.query;
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get<Quiz>(`${process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL}/quiz/${quizId}`);
      setQuiz(response.data);
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setQuiz((prevQuiz) => prevQuiz ? { ...prevQuiz, [name]: value } : null);
  };

  const handleQuestionChange = (
    qIndex: number,
    field: keyof Omit<Question, 'options'>,
    value: string
  ) => {
    setQuiz((prevQuiz) => {
      if (!prevQuiz) return null;
      const updatedQuestions = [...prevQuiz.questions];
      updatedQuestions[qIndex] = {
        ...updatedQuestions[qIndex],
        [field]: value,
      };
      return { ...prevQuiz, questions: updatedQuestions };
    });
  };

  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    field: keyof Option,
    value: string | boolean
  ) => {
    setQuiz((prevQuiz) => {
      if (!prevQuiz) return null;
      const updatedQuestions = [...prevQuiz.questions];

      if (field === 'is_correct' && value === true) {
        const updatedOptions = updatedQuestions[qIndex].options.map((option, index) => ({
          ...option,
          is_correct: index === oIndex,
        }));

        updatedQuestions[qIndex] = {
          ...updatedQuestions[qIndex],
          options: updatedOptions,
          answer: updatedOptions[oIndex].text,
        };
      } else {
        const updatedOptions = [...updatedQuestions[qIndex].options];
        updatedOptions[oIndex] = {
          ...updatedOptions[oIndex],
          [field]: value,
        };

        updatedQuestions[qIndex] = {
          ...updatedQuestions[qIndex],
          options: updatedOptions,
        };
      }

      return { ...prevQuiz, questions: updatedQuestions };
    });
  };

const handleUpdateQuiz = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quiz) return;
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL}/quiz/${quiz.id}/${userID}`, {
        title: quiz.title,
        description: quiz.description
      });
      alert('Quiz updated successfully!');
    } catch (error) {
      console.error('Failed to update quiz:', error);
      alert('Failed to update quiz.');
    }
  };

  const handleUpdateQuestion = async (qIndex: number) => {
    if (!quiz) return;
    const question = quiz.questions[qIndex];
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL}/quiz/${quizId}/question/${question.id}/${userID}`, {
        text: question.text,
        answer: question.answer,
        options: question.options
      });
      alert('Question updated successfully!');
    } catch (error) {
      console.error('Failed to update question:', error);
      alert('Failed to update question.');
    }
  };


  if (!quiz) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Update Quiz</h1>
      <form onSubmit={handleUpdateQuiz} className="space-y-6">
        <div className="flex flex-col space-y-2">
          <label className="text-lg font-semibold">Title:</label>
          <input
            type="text"
            name="title"
            value={quiz.title}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-lg font-semibold">Description:</label>
          <input
            type="text"
            name="description"
            value={quiz.description}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-lg font-semibold">Department:</label>
          <input
            type="text"
            name="department"
            value={quiz.department}
            readOnly
            className="p-2 border border-gray-300 rounded bg-gray-200 cursor-not-allowed"
          />
        </div>

        {quiz.questions.map((question, qIndex) => (
          <div key={qIndex} className="border p-4 rounded-lg shadow-sm space-y-4">
            <h3 className="text-xl font-semibold">Question {qIndex + 1}</h3>
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                placeholder="Question text"
                value={question.text}
                onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                className="p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="space-y-2">
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={`Option ${oIndex + 1}`}
                    value={option.text}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                    className="p-2 border border-gray-300 rounded flex-1"
                    required
                  />
                  <label className="flex items-center space-x-1">
                    <input
                      type="radio"
                      name={`correctOption-${qIndex}`}
                      checked={option.is_correct}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, 'is_correct', e.target.checked)}
                      className="form-radio"
                      required
                    />
                    <span>Correct</span>
                  </label>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleUpdateQuestion(qIndex)}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Update Question
            </button>
          </div>
        ))}
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Update Quiz
        </button>
      </form>
    </div>
  );
};

export default UpdateQuiz;
