/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { Buffer } from 'buffer';
import clsx from 'clsx';
import {
  ComponentProps,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import ReactLoading from 'react-loading';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import background from './assets/background.png';
import { ENDPOINTS, ROUTES } from './constants';
import { checkSignIn } from './lib';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',

    borderColor: `rgb(75 85 99 / 1)`,
  },
};

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
  const [mailLoading, setMailLoading] = useState(false);

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

  const handleUpdateIntroduction = async () => {
    try {
      await axios.patch(
        ENDPOINTS.USER.UPDATE_INTRO,
        {
          introduction: userInfo?.introduction || '',
        },
        {
          withCredentials: true,
        }
      );
      toast('Successfully update introduction', {
        type: 'success',
      });
    } catch (error) {
      console.log('fail to update introduction', error);
      alert('fail to update introduction');
    }
  };

  const handleGetMails = async () => {
    setMailLoading(true);
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
    } finally {
      setMailLoading(false);
    }
  };

  const [selectedMessage, setSelectedMail] = useState<any | null>(null);
  const { from, date, subject } = useMessage(selectedMessage);
  const handleSelectMail = function (mail: any) {
    setSelectedMail(mail);
    setMessageModalOpen(true);
  };

  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const body = useBody(selectedMessage);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
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
                    className="shadow-xl w-full md:w-40 lg:w-96 rounded border hover:border-black text-black font-medium bg-white  active:bg-sky-500 transition-all"
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
                  <Mail
                    key={mail.id}
                    mail={mail}
                    onClick={() => handleSelectMail(mail)}
                  />
                ))}
              </div>
            </Card>
          )}
        </div>
        <div className="flex gap-1 absolute top-2 right-2">
          <CustomButton
            onClick={handleGetMails}
            className={clsx('flex justify-center items-center')}
          >
            {mailLoading ? (
              <ReactLoading width={12} height={12} color="black" />
            ) : (
              'Get mails'
            )}
          </CustomButton>
          <CustomButton onClick={handleSignOut}>Sign out</CustomButton>
        </div>
      </div>
      <Modal
        isOpen={messageModalOpen}
        onAfterOpen={() => {}}
        onRequestClose={() => {}}
        style={customStyles}
      >
        <div className="flex flex-col gap-2 divide-y divide-gray-400 w-[60vw] h-[80vh] overflow-scroll">
          <div className="">
            <div className="flex justify-between items-start">
              <p className="font-bold">{subject || ''}</p>
              <button
                className="shadow border border-gray-600 hover:border-gray-800 active:border-white rounded-full px-2 text-gray-600 hover:text-gray-800 active:text-white bg-white active:bg-red-800 transition-all"
                onClick={() => {
                  setMessageModalOpen(false);
                  setSelectedMail(null);
                }}
              >
                X
              </button>
            </div>
            <div>
              <span className="text-sm italic">From: </span>
              <span className="text-sm italic">{from}</span>
              <br />
              <span className="text-sm italic">Date: </span>
              <span className="text-sm italic">{date}</span>
            </div>
          </div>
          <div dangerouslySetInnerHTML={{ __html: body || '' }}></div>
        </div>
      </Modal>
    </>
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

function Mail({ mail, onClick }: any) {
  const { date, from, subject, snippet } = useMessage(mail);

  return (
    <div
      className="flex flex-col gap-3 rounded border border-gray-400 p-2 bg-sky-500/60 divide-y hover:bg-sky-500/80 hover:cursor-pointer hover:scale-[1.02] transition-all"
      onClick={onClick}
    >
      <div className="flex flex-col">
        <p className="font-bold">{subject}</p>
        <p className="italic">{from}</p>
        <p className="italic">{date}</p>
      </div>
      <div>{snippet}</div>
    </div>
  );
}

function CustomButton(props: ComponentProps<'button'>) {
  return (
    <button
      {...props}
      className={clsx(
        'shadow-xl w-full md:w-40 lg:w-96 rounded border hover:border-black text-black font-medium bg-white  active:bg-sky-500 transition-all',
        props.className
      )}
    ></button>
  );
}

function useMessage(message: any) {
  const { date, from, subject, snippet } = useMemo(() => {
    let date = '';
    let from = '';
    let to = '';
    let subject = '';
    let snippet = '';

    if (!message) {
      return {
        date,
        from,
        to,
        subject,
        snippet,
      };
    }

    const headers = message.payload.headers;
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
    snippet = message.snippet;

    return {
      date,
      from,
      to,
      subject,
      snippet,
    };
  }, [message]);

  return {
    date,
    from,
    subject,
    snippet,
  };
}

function useBody(message: any) {
  const html = useMemo(() => {
    return parseMessageBody(message);
  }, [message]);
  return html;
}

function parseMessageBody(message: any): string {
  if (!message) {
    return '';
  }

  // Check if the message has parts
  if (message.payload && message.payload.parts) {
    // Filter parts to get only those with mimeType 'text/html'
    const htmlParts = message.payload.parts.filter(
      (part: any) => part.mimeType === 'text/html'
    );

    // Check if there are any HTML parts
    if (htmlParts.length === 0) {
      return '';
    }

    // Initialize an array to hold the decoded HTML content from each part
    let htmlContent = [];

    // Iterate over each HTML part
    htmlParts.forEach((part: any) => {
      let encodedData = part.body.data;

      // Convert URL-safe Base64 to standard Base64 if necessary
      encodedData = encodedData.replace(/-/g, '+').replace(/_/g, '/');

      // Decode the Base64 string and add it to the array
      const bytes = Buffer.from(encodedData, 'base64');
      const html = new TextDecoder('utf-8').decode(bytes);
      // const html = atob(encodedData);
      htmlContent.push(html);
    });

    // Join all parts into a single string
    const combinedHtml = htmlContent.join('');

    console.log('combinedHtml', combinedHtml);
    return combinedHtml;
  } else if (message.payload && message.payload.body) {
    // Handle the case where the body is directly in message.payload.body
    let encodedData = message.payload.body.data;

    // Convert URL-safe Base64 to standard Base64 if necessary
    encodedData = encodedData.replace(/-/g, '+').replace(/_/g, '/');

    // Decode the Base64 string
    const html = atob(encodedData);

    console.log('html', html);
    return html;
  } else {
    // If neither parts nor body is present, return an empty string
    return '';
  }
}

export default Home;
