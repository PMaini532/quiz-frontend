import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from '../utils/axiosConfig';

type Department = {
  departmentname: string;
  noofquizzes: number;
};

const Register = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null); 
  const router = useRouter();

  useEffect(() => {
    console.log('Environment Variable:', process.env.NEXT_PUBLIC_USER_SERVICE_URL);
    const fetchDepartments = async () => {
      try {
        // const response = await axios.get('http://localhost:8021/departments');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL}/departments`)
        setDepartments(response.data);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        setError('Failed to load departments. Please try again later.');
      }
    };
    fetchDepartments();
  }, []);

  const validateForm = (): boolean => {
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Invalid email address.');
      return false;
    }

    setFormError(null); 
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return; 

    const data = {
      name,
      email,
      password,
      department,
    };
    
    try {
      // const response = await axios.post('http://localhost:8023/register', data);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/register`,data);
      localStorage.setItem('user', JSON.stringify(response.data));
      router.replace("/login");
    } catch (error) {
      setError('An error occurred. Please try again later.');
      console.error('Error:', error);
    }
  };

  const handleLogin = () =>{
    router.replace('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="absolute top-4 right-10">
        <button onClick={handleLogin} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Login
        </button>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-5">Register</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {formError && <p className="text-red-500 mb-4">{formError}</p>} {/* Display form-level errors */}

        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
            required
          />
        </div>

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
          <p className="text-sm text-gray-500 mt-1">Password must be at least 8 characters long.</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
            required
          >
            <option value="" disabled>Select a department</option>
            {departments.map((dept) => (
              <option key={dept.departmentname} value={dept.departmentname}>
                {dept.departmentname}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
