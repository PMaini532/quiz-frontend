import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const getSessionData = async () => {
  try {
    // const sessionResponse = await axios.get('http://localhost:8023/check-session', {
    //   withCredentials: true,
    // });
    const sessionResponse = await axios.get(`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/check-session`, {
      withCredentials: true,
    });
    const userID = sessionResponse.data.userID;
    return userID;
  } catch (error) {
    console.error('Failed to get session data:', error);
    return null;
  }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // const loginResponse = await axios.post('http://localhost:8023/login', 
      //   { email, password },
      //   { withCredentials: true } 
      // );
      const loginResponse = await axios.post(`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/login`, 
        { email, password },
        { withCredentials: true } 
      );
      if (loginResponse.status === 200) {
        const { department } = loginResponse.data;

        const userID = await getSessionData(); 
        router.replace({
          pathname: '/quizzes',
          query: { department,userID },
        });
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      setError('An error occurred during login');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-5">Login</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
