import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from "next/router";
type Option = {
    text: string;
    is_correct: boolean;
};

type Question = {
    text: string;
    answer: string;
    options: Option[];
};

type Quiz = {
    title: string;
    description: string;
    department: string;
    questions: Question[];
};

const CreateQuiz: React.FC = () => {
    const router = useRouter();
    const {userID} = router.query;
    const [quiz, setQuiz] = useState<Quiz>({
        title: '',
        description: '',
        department: '',
        questions: [
            {
                text: '',
                answer: '',
                options: [
                    {  text: '', is_correct: false },
                    {  text: '', is_correct: false },
                    {  text: '', is_correct: false },
                    {  text: '', is_correct: false },
                ],
            },
        ],
    });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setQuiz((prevQuiz) => ({ ...prevQuiz, [name]: value }));
    };

    const handleQuestionChange = (
        qIndex: number,
        field: keyof Omit<Question, 'options'>,
        value: string
    ) => {
        setQuiz((prevQuiz) => {
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
            console.log(updatedOptions)
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


    const handleAddQuestion = () => {
        setQuiz((prevQuiz) => ({
            ...prevQuiz,
            questions: [
                ...prevQuiz.questions,
                {
                    text: '',
                    answer: '',
                    options: [
                        {  text: '', is_correct: false },
                        {  text: '', is_correct: false },
                        {  text: '', is_correct: false },
                        {  text: '', is_correct: false },
                    ],
                },
            ],
        }));
    };

    const submitQuizDetails = async () => {
        console.log(userID)
        const response = await axios.post(`${process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL}/createquiz/${userID}`, {
            title: quiz.title,
            description: quiz.description,
            department: quiz.department,
        });
        return response.data.quizID;
    };

    const submitQuestion = async (quizId: number, question: Question) => {
        await axios.post(`${process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL}/quiz/${quizId}/question/${userID}`, {
            text: question.text,
            answer: question.answer,
            options: question.options,
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const quizId = await submitQuizDetails();
            console.log(quizId)
            for (const question of quiz.questions) {
                await submitQuestion(quizId, question);
            }
            alert('Quiz created successfully!');
        } catch (error) {
            console.error('Error creating quiz:', error);
            alert('Failed to create quiz.');
        }
    };
    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">Create a Quiz</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                        onChange={handleInputChange}
                        className="p-2 border border-gray-300 rounded"
                        required
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
                                onChange={(e) =>
                                    handleQuestionChange(qIndex, 'text', e.target.value)
                                }
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
                                        onChange={(e) =>
                                            handleOptionChange(qIndex, oIndex, 'text', e.target.value)
                                        }
                                        className="p-2 border border-gray-300 rounded flex-1"
                                        required
                                    />
                                    <label className="flex items-center space-x-1">
                                        <input
                                            type="radio"
                                            name={`correctOption-${qIndex}`}
                                            checked={option.is_correct}
                                            onChange={(e) =>
                                                handleOptionChange(
                                                    qIndex,
                                                    oIndex,
                                                    'is_correct',
                                                    e.target.checked
                                                )
                                            }
                                            className="form-radio"
                                            required
                                        />
                                        <span>Correct</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-4"
                >
                    Add Question
                </button>
                <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Create Quiz
                </button>
            </form>
        </div>
    );
};

export default CreateQuiz;


