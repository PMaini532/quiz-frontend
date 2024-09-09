import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

type Option = {
  id: number;
  text: string;
  isCorrect: boolean;
  questionID: number;
};

type Question = {
  id: number;
  quizID: number;
  text: string;
  options: Option[];
};

type QuizData = {
  quiz: string;
  questions: Question[];
};

type UserAnswer = {
  questionID: number;
  answer: string; 
};

const QuizPage = () => {
  axios.defaults.withCredentials = true;
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({}); 
  // const [submitted, setSubmitted] = useState<boolean>(false);
  const router = useRouter();
  const { id, userID,department } = router.query;

  useEffect(() => {
    if (id) {
      const fetchQuizData = async () => {
        try {
          // const response = await axios.get<QuizData>(`http://localhost:8024/quizzes/${id}/start`);
          const response = await axios.get<QuizData>(`${process.env.NEXT_PUBLIC_TEST_SERVICE_URL}/quizzes/${id}/start`);
          setQuizData(response.data);
        } catch (error) {
          console.error('Failed to fetch quiz data:', error);
          setError('Failed to fetch quiz data.');
        } finally {
          setLoading(false);
        }
      };
      fetchQuizData();
    }
  }, [id]);

  const handleOptionClick = (questionID: number, optionText: string) => {

    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionID]: optionText,
    }));
    console.log(questionID,optionText);
  };

  const handleSubmit = async () => {
  try {
    const formattedAnswers = Object.entries(userAnswers).map(([questionID, answer]) => ({
      question_id: parseInt(questionID),
      answer,
    }));
    // const response = await axios.post(`http://localhost:8024/quizzes/${id}/submit/${userID}`, formattedAnswers);
    const response = await axios.post(`${process.env.NEXT_PUBLIC_TEST_SERVICE_URL}/quizzes/${id}/submit/${userID}`, formattedAnswers);

    alert('Quiz submitted successfully!');
     router.replace({
        pathname: '/quizzes',
        query: { department, userID },
      });
  } catch (error) {
      console.error('Failed to submit quiz:', error);
      setError('Failed to submit quiz.');
  }
};

  // const handleViewScore = () =>{
  //   router.push(`/quizzes/${id}`)
  // }

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {quizData ? (
        <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4">{quizData.quiz}</h1>
          {quizData.questions.map((question,index) => (
            <div key={question.id} className="mb-4">
              <p className="font-semibold">{index + 1}. {question.text}</p>
              <ul>
                {question.options.map((option,optionIndex) => (
                  <li key={option.id} className="mb-2 flex  items center">
                    <button
                      onClick={() => handleOptionClick(question.id, option.text)} 
                      className={`p-2 border rounded  flex items-center ${
                        userAnswers[question.id] === option.text
                          ? 'bg-blue-500 text-white'
                          : 'bg-white'
                      }`}
                    >
                      {String.fromCharCode(97 + optionIndex)}. {option.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="mt-6 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Submit Quiz
          </button>
        </div>
      ) : (
        <p>No quiz found.</p>
      )}
    </div>
  );
};

export default QuizPage;