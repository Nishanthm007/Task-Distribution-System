import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserCheck, UserPlus, ClipboardList } from 'lucide-react';

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userName', response.data.user.name);
        localStorage.setItem('isAuthenticated', 'true'); // Add this line
        setSuccess('Login successful!');
        setTimeout(() => {
          navigate('/agentlist'); // Change this line
        }, 1000);
      } else {
        setError('Login failed. Token not received.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        console.log(err);
        setError('An error occurred. Please try again.');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register/admin', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.success) {
        setSuccess('Admin registered successfully! You can now log in.');
        setTimeout(() => {
          setIsRegistering(false);
          setFormData({ name: '', email: '', password: '' });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register admin. Please try again.');
    }
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setFormData({ name: '', email: '', password: '' });
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500/70 via-purple-500/70 to-pink-500/70 flex items-center justify-center p-4 animate-gradient-x backdrop-blur-md">
      <div className="bg-white/30 backdrop-blur-xl dark:bg-gray-800/30 rounded-3xl shadow-2xl w-full max-w-md p-8 transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-4">
            <ClipboardList className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Task Distributor
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isRegistering ? 'Register to manage your team tasks' : 'Sign in to manage tasks'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-white/10 backdrop-blur-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700/30 dark:border-gray-600/50 dark:text-white transition-all duration-200"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-white/10 backdrop-blur-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700/30 dark:border-gray-600/50 dark:text-white transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-white/10 backdrop-blur-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700/30 dark:border-gray-600/50 dark:text-white transition-all duration-200"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02]"
          >
            {isRegistering ? 'Create Account' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={toggleForm}
            className="w-full text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 mt-4"
          >
            {isRegistering ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
