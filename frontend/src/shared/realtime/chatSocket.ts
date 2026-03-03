import { io, Socket } from 'socket.io-client';

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

export const createChatSocket = (token: string): Socket => {
  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001');

  return io(baseUrl, {
    transports: ['websocket'],
    auth: { token },
    withCredentials: true,
  });
};
