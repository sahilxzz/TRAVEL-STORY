import React, { useState } from 'react'
import { assets } from '../../assets/assets';
import PasswordInput from '../../components/input/PasswordInput';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import axios from 'axios';

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if(!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if(!password){
      setError("Please enter the password");
      return;
    }

    setError("");

    // Login API CAall
    try{
      const response = await axiosInstance.post("/login", {
        email: email,
        password: password,
      });

      // Handle successful login response
      if(response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard");
      }
    } catch (error) {
      // Handle login error
      if(
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      }
      else{
        setError("An unexpected error occured, Please try again");
      }
    }


  };

return (
  <div className="min-h-screen bg-[#D4F6FF] overflow-y-auto relative">

    {/* Background Design Elements */}
    <div className="absolute right-10 -top-40 login-ui-box pointer-events-none z-0" />
    <div className="absolute bg-[#BFECFF] -bottom-40 right-1/2 login-ui-box pointer-events-none z-0" />

    {/* Main Content */}
    <div className="relative z-10 container flex flex-col lg:flex-row items-center justify-center px-4 lg:px-20 py-10 gap-0">

      {/* Image Section */}
      <div
        className="w-full lg:w-1/2 h-60 lg:h-[80vh] flex items-end bg-cover bg-center rounded-t-lg lg:rounded-lg p-6 lg:p-10"
        style={{ backgroundImage: `url(${assets.loginBg})` }}
      >
        <div>
          <h4 className="text-3xl lg:text-5xl text-white font-semibold leading-snug">
            Capture your journeys
          </h4>
          <p className="text-sm lg:text-base text-white leading-6 mt-4 pr-2">
            Record your travel experiences and memories in your personal travel journal.
          </p>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="w-full lg:w-1/2 bg-white rounded-b-lg lg:rounded-r-lg p-6 lg:p-16 shadow-lg shadow-cyan-200/20">
        <form onSubmit={handleLogin}>
          <h4 className="text-xl lg:text-2xl font-semibold mb-6">Login</h4>

          <input
            type="text"
            placeholder="Email"
            className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={email}
            onChange={({ target }) => setEmail(target.value)}
          />

          <PasswordInput
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />

          {error && <p className="text-red-500 text-xs pt-1">{error}</p>}

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 mt-4 rounded-md transition duration-300"
          >
            LOGIN
          </button>

          <p className="text-xs text-slate-500 text-center my-4">Or</p>

          <button
            type="button"
            className="w-full border border-cyan-500 text-cyan-500 py-2 rounded-md hover:bg-cyan-50 transition duration-300"
            onClick={() => navigate('/signUp')}
          >
            CREATE ACCOUNT
          </button>
        </form>
      </div>
    </div>
  </div>
);

}


export default Login
