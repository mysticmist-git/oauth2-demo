/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import background from './assets/background.png';
import { ENDPOINTS, ROUTES } from './constants';
import { checkSignIn } from './lib';

type UserInfo = {
  userid: string;
  name: string;
  email: string;
  picture: string;
  introduction: string;
};

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mails, setMails] = useState<any[]>([]);

  const navigate = useNavigate();

  const handleSignOut = async function () {
    try {
      const res = await axios.get(ENDPOINTS.OAUTH.SIGN_OUT, {
        withCredentials: true,
      });
      if (res.status === 200) {
        navigate(ROUTES.SIGN_IN);
      } else {
        console.log('fail to sign out');
      }
    } catch (error) {
      console.log('fail to sign out', error);
    }
  };

  useEffect(() => {
    execute();

    async function execute() {
      await checkSignedIn();
      await loadUserData();
    }
    async function checkSignedIn() {
      setLoading(true);
      try {
        const signedIn = await checkSignIn();
        if (!signedIn) {
          navigate(ROUTES.SIGN_IN);
        }
      } catch (error) {
        console.log('fail to check sign in state', error);
        alert('fail to check sign in state');
      } finally {
        setLoading(false);
      }
    }
    async function loadUserData() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await axios.get(ENDPOINTS.USER.GET, {
          withCredentials: true,
        });
        if (!user) {
          navigate(ROUTES.SIGN_IN);
        }
        setUserInfo(user);
      } catch (error) {
        console.log('fail to get user info', error);
      } finally {
        setLoading(false);
      }
    }
  }, [navigate]);

  const handleIntroductionChange = useCallback((value: string) => {
    setUserInfo((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        introduction: value,
      };
    });
  }, []);

  const handleGetMails = async () => {
    try {
      const {
        data: { messages },
      } = await axios.get(ENDPOINTS.MAILS, {
        withCredentials: true,
      });
      setMails(messages);
    } catch (error) {
      console.log('fail to get mails', error);
      setMails([]);
    }
  };

  const handleUpdateIntroduction = async () => {
    throw new Error('Not implemented');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log(mails);

  return (
    <div
      className="relative w-screen h-screen p-12 bg-scroll overflow-scroll"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <div
        className="flex flex-col gap-2 items-center w-full h-full"
        style={
          mails && mails.length > 0
            ? { justifyContent: 'flex-start ' }
            : { justifyContent: 'center' }
        }
      >
        <Card>
          <div className="h-full flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex flex-col justify-center gap-2 rounded p-2 sm:p-4 shadow-xl h-fit bg-white">
              <div className="flex justify-center sm:justify-start w-full">
                <img
                  src={userInfo?.picture || ''}
                  width={80}
                  height={80}
                  className="border border-gray-300 rounded"
                />
              </div>

              <div>
                <div className="flex justify-center sm:justify-start gap-2">
                  <p className="font-bold">Name: </p>
                  <p>{userInfo?.name || ''}</p>
                </div>
                <div className="flex justify-center sm:justify-start gap-2">
                  <p className="font-bold">Email: </p>
                  <p>{userInfo?.email || ''}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-col flex-1 rounded p-2 sm:p-4 bg-sky-500 text-white">
                <h1 className="font-bold">Introduction</h1>
                <textarea
                  value={userInfo?.introduction || ''}
                  onChange={(e) => handleIntroductionChange(e.target.value)}
                  className="flex-1 rounded-sm w-full p-1 text-black bg-white/80"
                />
              </div>
              <div className="flex justify-end w-full">
                <button
                  className="shadow-xl w-full md:w-40 lg:w-96 rounded-sm text-black font-medium bg-white active:bg-sky-500 transition-all"
                  onClick={handleUpdateIntroduction}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </Card>
        {mails && mails.length > 0 && (
          <Card className="h-auto">
            <p className="font-bold text-lg">Your mail</p>
            <div className="flex flex-col gap-1 mt-2">
              {mails.map((mail) => (
                <Mail key={mail.id} mail={mail} />
              ))}
            </div>
          </Card>
        )}
      </div>
      <div className="flex gap-1 absolute top-2 right-2">
        <button
          className="rounded px-2 py-1.5 font-medium bg-white/80"
          onClick={handleGetMails}
        >
          Get mails
        </button>
        <button
          className="rounded px-2 py-1.5 font-medium bg-white/80"
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

function Card({
  children,
  className = '',
}: PropsWithChildren & { className?: string }) {
  return (
    <div
      className={` rounded shadow-xl p-4 sm:p-12 h-96 sm:w-11/12 bg-white/80 ${className}`}
    >
      {children}
    </div>
  );
}

function Mail({ mail }: any) {
  const { date, from, to, subject, snippet } = useMemo(() => {
    let date = '';
    let from = '';
    let to = '';
    let subject = '';
    let snippet = '';

    const headers = mail.payload.headers;
    headers.forEach((header: any) => {
      if (header.name === 'Date') {
        date = header.value;
      }
      if (header.name === 'From') {
        from = header.value;
      }
      if (header.name === 'To') {
        to = header.value;
      }
      if (header.name === 'Subject') {
        subject = header.value;
      }
    });
    snippet = mail.snippet;

    return {
      date,
      from,
      to,
      subject,
      snippet,
    };
  }, [mail.payload.headers, mail.snippet]);

  return (
    <div className="flex flex-col gap-3 rounded border border-gray-400 p-2 bg-sky-500/60 divide-y hover:bg-sky-500/80 hover:cursor-pointer hover:scale-[1.02] transition-all">
      <div className="flex flex-col">
        <p className="font-bold">{subject}</p>
        <p className="italic">{from}</p>
        <p className="italic">{date}</p>
      </div>
      <div>{snippet}</div>
    </div>
  );
}

export default Home;
