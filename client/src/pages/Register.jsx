import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';
import { useTranslation } from 'react-i18next';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { name, email, password, confirmPassword } = formData;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      alert(message);
    }

    if (isSuccess || user) {
      navigate('/');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
    } else {
      const userData = {
        name,
        email,
        password,
      };
      dispatch(register(userData));
    }
  };

  if (isLoading) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-lg shadow-lg">
            <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">{t('Register')}</h2>
            <p className="mt-2 text-sm text-slate-400">
                Create an account to track your expenses
            </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
                <div>
                <input
                    type="text"
                    name="name"
                    value={name}
                    placeholder="Name"
                    onChange={onChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-slate-600 placeholder-slate-400 text-white rounded-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm bg-slate-700"
                    required
                />
                </div>
                <div>
                <input
                    type="email"
                    name="email"
                    value={email}
                    placeholder="Email address"
                    onChange={onChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-slate-600 placeholder-slate-400 text-white rounded-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm bg-slate-700"
                    required
                />
                </div>
                <div>
                <input
                    type="password"
                    name="password"
                    value={password}
                    placeholder="Password"
                    onChange={onChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-slate-600 placeholder-slate-400 text-white rounded-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm bg-slate-700"
                    required
                />
                </div>
                <div>
                <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    placeholder="Confirm Password"
                    onChange={onChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-slate-600 placeholder-slate-400 text-white rounded-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm bg-slate-700"
                    required
                />
                </div>
            </div>

            <div>
                <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                {t('Register')}
                </button>
            </div>
            </form>
            <div className="text-center text-sm text-slate-400">
                Already have an account? <Link to="/login" className="text-accent hover:text-sky-300">Login</Link>
            </div>
        </div>
    </div>
  );
}

export default Register;
