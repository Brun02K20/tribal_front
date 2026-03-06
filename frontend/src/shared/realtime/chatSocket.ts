import { io, Socket } from 'socket.io-client';

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

export const createChatSocket = (): Socket => {
  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001');

  return io(baseUrl, {
    transports: ['websocket'],
    withCredentials: true,
  });
};
