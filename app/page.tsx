'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import { getLocalStream, startRecording, stopRecording } from '@/utils/mediaUtils';

import Player from '@/components/Player';
import Post from '@/components/Post';

interface AudioData {
  id: string;
  base64: string;
}

export default function Home() {
  const [audio, setAudio] = useState<string | null>(null);

  const [audios, setAudios] = useState<AudioData[] | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);

  useEffect(() => {
    getLocalStream(setError);
    getAudios();
  }, []);

  const getAudios = async () => {
    try {
      const response = await fetch('/api/audio');
      if (!response.ok) {
        throw new Error('Failed to fetch audios');
      }
      const data: AudioData[] = await response.json();
      setAudios(data);
    } catch (error) {
      console.error(error);
    }
  };

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
        await getAudios();
        if (audio) setAudio(null);
      } else {
        console.error('Failed to upload audio');
      }
    } catch (error) {
      console.error('Error fetching:', error);
    }
  };

  return (
    <main className="flex flex-col h-screen w-2/3 bg-gray-800 mx-auto relative ">
      <div className="flex flex-col justify-center items-center flex-1 overflow-y-scroll">
        <h1 className="text-white mb-4 pt-14">🗣️ Speakr</h1>
        <p className="text-white mb-4">What others have to say:</p>

        {audios && (
          <div className="flex-1 w-1/2">
            {audios.map((audio) => (
              <Post key={audio.id} base64={audio.base64} />
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 flex flex-col items-end">
        <div className="bg-gray-600 p-4 w-9/12 rounded-tl-xl flex items-center space-x-5">
          {error ? (
            <p className="error-message">{error}</p>
          ) : (
            <>
              <p className="text-xs">Speak: </p>

              {!isRecording ? (
                <button
                  className="rounded-sm p-2 h-full text-2xl bg-emerald-700"
                  onClick={handleStartRecording}
                  disabled={isRecording}
                >
                  <Image src="/icons/microphone.svg" alt="Record" width={12} height={12} />
                </button>
              ) : (
                <>
                  <button
                    className="rounded-sm  p-2 h-full text-2xl bg-red-500"
                    onClick={handleStopRecording}
                    disabled={!isRecording}
                  >
                    <Image src="/icons/microphone-line.svg" alt="Stop recording" width={12} height={12} />
                  </button>
                </>
              )}

              {audio && (
                <>
                  <Player base64={audio} />

                  <button className="rounded-sm p-2 h-full text-md  bg-emerald-500" type="button" onClick={uploadSound}>
                    <Image src="/icons/share.svg" alt="Share" width={15} height={15} />
                  </button>
                </>
              )}
            </>
          )}
        </div>

        <div className=" bg-gray-700 p-4 flex items-center justify-between w-11/12 rounded-tl-xl">
          <div className="flex items-center">
            <span className="text-sm font-bold">William</span>
          </div>
          <button>⚙️</button>
        </div>
      </div>
    </main>
  );
}
