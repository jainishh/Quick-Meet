import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import axiosInstance from '../utils/axiosInstance';

const SocketContext = createContext();

const server_url = import.meta.env.VITE_API_URL;

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        let newSocket;

        if (token) {
            // Re-sync username from strict auth to fix any stale localStorage bugs
            axiosInstance.get('/api/v1/users/check_auth').then(res => {
                const correctUsername = res.data.user?.username || res.data.username;
                if (correctUsername) localStorage.setItem('username', correctUsername);
                
                newSocket = io(server_url);

                newSocket.on('connect', () => {
                    console.log('Global socket connected:', newSocket.id);
                    newSocket.emit('join-personal-room', correctUsername);
                });

                newSocket.on('meeting-update', (data) => {
                    console.log('Meeting update received:', data);
                    window.dispatchEvent(new CustomEvent('refreshMeetings', { detail: data }));
                });

                newSocket.on('disconnect', () => {
                    console.log('Global socket disconnected');
                });
                
                setSocket(newSocket);
            }).catch(e => console.error("Could not sync username for socket", e));
        }

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}

        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
