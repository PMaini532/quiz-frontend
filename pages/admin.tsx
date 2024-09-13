import { useRouter } from "next/router";
import { useEffect, useState } from "react"
import axios from '../utils/axiosConfig';

type Quiz = {
  id: number;
  title: string;
  description: string;
  department: string;
};

const AdminPage = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const router = useRouter();
    const { userID } = router.query;
    console.log(userID)
    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async() => {
        try{
            const quizResponse = await axios.get<Quiz[]>(`${process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL}/quizzes`)
            setQuizzes(quizResponse.data);
        }catch(error){
            console.error('Failed to fetch quizzes:', error);
        }
    };
    const handleCreateQuiz = () => {
        router.push({
            pathname: '/createquiz',
            query: {userID}
        })
  };

const handleUpdateQuiz = (quizId: number) => {
    router.push({
      pathname : '/updateQuiz',
      query: {quizId,userID}
    })
  };

const handleDeleteQuiz = async (quizId: number) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL}/quiz/${quizId}/${userID}`);
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };
const handleLogout = () => {
    axios.get(`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/logout`).then(() => {
        router.push('/login')
    })
}

    return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="absolute top-4 right-10">
        <button onClick={handleCreateQuiz} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mr-4">
          Create Quiz
        </button>
        <button onClick={handleLogout} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
           Logout
        </button>
      </div>
      <div className="w-full max-w-2xl">
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white p-6 rounded-lg shadow-md mb-4">
              <h2 className="text-xl font-bold">{quiz.title}</h2>
              <p>{quiz.description}</p>
                <button
                  onClick={() => handleUpdateQuiz(quiz.id)}
                  className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mr-5"
                >Update
                </button>
                <button
                  onClick={() => handleDeleteQuiz(quiz.id)}
                  className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Delete Quiz
                </button>
            </div>
          ))
        ) : (
          <p>There are no quizzes available</p>
        )}
      </div>
    </div>
  );
}
export default AdminPage;