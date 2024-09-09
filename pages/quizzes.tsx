import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

type Quiz = {
  id: number;
  title: string;
  description: string;
  department: string;
};

type QuizScore = {
  quiz_id: number;
  quiz_name: string;
  score: number;
};

const Quizzes = () => {
  axios.defaults.withCredentials = true;
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [userScores, setUserScores] = useState<QuizScore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { department, userID } = router.query;

  useEffect(() => {
    if (department && userID) {
      // Fetch quizzes for the department
      const fetchQuizzes = async () => {
        try {
          // const quizResponse = await axios.get<Quiz[]>(`http://localhost:8021/departments/${department}`);
          const quizResponse = await axios.get<Quiz[]>(`${process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL}/departments/${department}`);
          setQuizzes(quizResponse.data);
        } catch (error) {
          console.error('Failed to fetch quizzes:', error);
          setError('Failed to fetch quizzes.');
        } finally {
          setLoading(false);
        }
      };

      // Fetch user scores
      const fetchUserScores = async () => {
        try {
          // const scoreResponse = await axios.get<QuizScore[]>(`http://localhost:8024/users/scores/${userID}`);
          const scoreResponse = await axios.get<QuizScore[]>(`${process.env.NEXT_PUBLIC_TEST_SERVICE_URL}/users/scores/${userID}`);
          setUserScores(scoreResponse.data || []);
          console.log(userScores);
        } catch (error) {
          console.error('Failed to fetch user scores:', error);
        }
      };

      fetchQuizzes();
      fetchUserScores();
    }
  }, [department, userID]);

  // Check if the user has already submitted a score for the quiz
  const hasUserSubmittedQuiz = (quizId: number): boolean => {
    return userScores.some((score) => score.quiz_id === quizId);
  };

  const handleStartQuiz = (quizId: number) => {
    router.replace({
      pathname: `/quiz/${quizId}`,
      query: { userID,department },
    });
  };

const handleViewScore = async (quizId: number) => {
  try {
    // const response = await axios.get<QuizScore[]>(`http://localhost:8024/users/scores/${userID}`);
    const response = await axios.get<QuizScore[]>(`${process.env.NEXT_PUBLIC_TEST_SERVICE_URL}/users/scores/${userID}`);
    const quizScore = response.data.find(score => score.quiz_id === quizId);
    
    if (quizScore) {
      alert(`Score for Quiz "${quizScore.quiz_name}": ${quizScore.score}`);
    } else {
      alert('No score found for this quiz.');
    }
  } catch (error) {
    console.error('Failed to fetch score:', error);
    alert('Failed to fetch score.');
  }
};


  const handleLogout = () => {
    // axios.get('http://localhost:8023/logout').then(() => {
    //   router.push('/login');
    // });
    axios.get(`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/logout`).then(() => {
      router.push('/login');
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="absolute top-4 right-10">
        <button onClick={handleLogout} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Logout
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8">Quizzes for Department: {department}</h1>

      {loading && <p className="text-blue-500">Loading...</p>}

      {error && <p className="text-red-500">{error}</p>}

      <div className="w-full max-w-2xl">
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white p-6 rounded-lg shadow-md mb-4">
              <h2 className="text-xl font-bold">{quiz.title}</h2>
              <p>{quiz.description}</p>
              {hasUserSubmittedQuiz(quiz.id) ? (
                <button
                  onClick={() => handleViewScore(quiz.id)}
                  className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  View Score
                </button>
              ) : (
                <button
                  onClick={() => handleStartQuiz(quiz.id)}
                  className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Start Quiz
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No quizzes available for this department.</p>
        )}
      </div>
    </div>
  );
};

export default Quizzes;
