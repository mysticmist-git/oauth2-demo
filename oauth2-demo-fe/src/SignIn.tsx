import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import iconGoogle from './assets/icon-google-64.png';
import { checkSignIn, requestOAuth } from './lib';

const SignIn = () => {
  const navigate = useNavigate();

  const signIn = async function () {
    try {
      const url = await requestOAuth();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.log('url request fail', error);
      alert('url request fail');
    }
  };

  useEffect(() => {
    async function check() {
      try {
        const signedIn = await checkSignIn();
        if (signedIn) {
          navigate('/');
        }
      } catch (error) {
        console.log('fail check sign in', error);
      }
    }

    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col sm:items-center gap-4 p-12">
      <h1 className="text-3xl font-bold">Sign In</h1>
      <p className="text-gray-400">OAuth2 Demo Program made by Group 7</p>
      <button
        className="flex items-center gap-2 border hover:border-gray-300 rounded-xl p-2 bg-[#f2f2f2] transition-all"
        onClick={() => signIn()}
      >
        <img src={iconGoogle} alt="icon-google" width={32} height={32} />
        <p className="text-lg font-normal">Sign in with Google</p>
      </button>
    </div>
  );
};

export default SignIn;
