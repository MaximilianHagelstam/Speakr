'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import { getLocalStream, startRecording, stopRecording } from '@/utils/mediaUtils';

import Player from '@/components/Player';
import Feed from '@/components/Feed';
import SignInButton from '@/components/SignInButton';

export default function Home() {
  const [audio, setAudio] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);

  useEffect(() => {
    getLocalStream(setError);
  }, []);

  const handleStartRecording = () => {
    if (audio) setAudio(null);
    setIsRecording(true);
    startRecording();
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    const base64Audio = await stopRecording();
    setAudio(base64Audio);
  };

  const uploadSound = async () => {
    try {
      const response = await fetch('/api/new', {
        method: 'POST',
        body: JSON.stringify({ audio }),
      });

      if (response.ok) {
        if (audio) setAudio(null);
      } else {
        console.error('Failed to upload audio');
      }
    } catch (error) {
      console.error('Error fetching:', error);
    }
  };

  return (
    <main className="flex flex-col h-screen w-2/3 bg-gray-800 mx-auto relative rounded-lg">
      <div className="flex flex-col justify-center items-center flex-1 overflow-y-auto scrollbar-thin">
        <div className="w-1/2">
          <h1 className="text-white text-3xl mb-4 pt-5">🗣️ Speakr</h1>
          <p className="text-white text-lg mb-4">What others have to say:</p>
        </div>
        <Feed />
      </div>

      <div className="sticky bottom-0 w-full flex flex-col items-end">
        <div className="bg-gray-600 p-4 w-10/12 rounded-tl-xl shadow-lg flex items-center space-x-5">
          {error ? (
            <p className="error-message">{error}</p>
          ) : (
            <>
              <p className="text-xl">Say something: </p>

              {!isRecording ? (
                <button
                  className="rounded-md p-3 pl-4 pr-4 h-full text-2xl bg-emerald-700 hover:bg-emerald-800"
                  onClick={handleStartRecording}
                  disabled={isRecording}
                >
                  <Image src="/icons/microphone.svg" alt="Record" width={15} height={15} />
                </button>
              ) : (
                <>
                  <button
                    className="rounded-md p-3 pl-4 pr-4 h-full text-2xl bg-red-500 hover:bg-red-600"
                    onClick={handleStopRecording}
                    disabled={!isRecording}
                  >
                    <Image src="/icons/microphone-line.svg" alt="Stop recording" width={15} height={15} />
                  </button>
                </>
              )}

              {audio && (
                <>
                  <Player base64={audio} />

                  <button
                    className="rounded-md pl-4 pr-4 h-full text-md bg-teal-500 hover:bg-teal-600"
                    type="button"
                    onClick={uploadSound}
                  >
                    <Image src="/icons/share.svg" alt="Share" width={15} height={15} />
                  </button>
                </>
              )}
            </>
          )}
        </div>

        <div className="bg-gray-700 p-4 flex items-center shadow-lg justify-between w-11/12 rounded-tl-xl rounded-br-lg">
          <div className="flex items-center">
            <span className="text-2xl font-bold">William</span>
            <SignInButton />
          </div>
          <button className="text-lg">⚙️</button>
        </div>
      </div>
    </main>
  );
}
