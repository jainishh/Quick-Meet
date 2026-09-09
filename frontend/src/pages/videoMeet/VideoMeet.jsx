import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField, CircularProgress, Snackbar, Alert, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useLocation, useParams } from 'react-router-dom';
import MeetingReadyPopup from '../../components/meetingReadyPopup/MeetingReadyPopup';
const API_URL = import.meta.env.VITE_API_URL;
import VideoControls from './components/VideoControls';
import VideoTile from './components/VideoTile';
import ChatSidebar from './components/ChatSidebar';

const server_url = API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin);
console.log('[Init] Server URL:', server_url);

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" },
        { "urls": "stun:stun1.l.google.com:19302" },
        { "urls": "stun:stun2.l.google.com:19302" },
        { "urls": "stun:stun3.l.google.com:19302" },
        { "urls": "stun:stun4.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {
    const { url } = useParams();
    const location = useLocation();

    // Extract room ID from either path or query param
    const queryParams = new URLSearchParams(location.search);
    const roomID = queryParams.get('roomID') || url;

    const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();
    let didInitialSetup = useRef(false);

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState(true); // Default to ON for better UX while loading
    let [audio, setAudio] = useState(true); // Default to ON

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(false);

    let [screenAvailable, setScreenAvailable] = useState();

    let [captions, setCaptions] = useState(false);
    let [activeCaptions, setActiveCaptions] = useState({}); // { socketId: { text: "...", timestamp: Date.now() } }
    let recognitionRef = useRef(null);

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(false);
    let [isConnecting, setIsConnecting] = useState(true);
    let [showMeetingReady, setShowMeetingReady] = useState(true);

    let [username, setUsername] = useState("");
    let [profilePicture, setProfilePicture] = useState(null);

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])
    let [localStream, setLocalStream] = useState(null);
    let [pinnedSocketId, setPinnedSocketId] = useState(null);
    let [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => { // phase 1.1
        console.log("QuickMeet Video Component Mounted");

        // Safety timeout to ensure loader disappears even if something hangs
        const timeout = setTimeout(() => {
            setIsConnecting(prev => {
                if (prev) {
                    console.warn('[Safety] Forcing loader off after 10s timeout');
                    return false;
                }
                return prev;
            });
        }, 10000);

        let localUsername = localStorage.getItem('name') || localStorage.getItem('username') || ('User_' + Math.floor(Math.random() * 1000));
        let localProfilePic = localStorage.getItem('profile_picture') || null;
        setUsername(localUsername);
        setProfilePicture(localProfilePic);
        getPermissions();

        if (location.state?.inviteSent) {
            setNotification({ open: true, message: "Meeting invite sent successfully!", severity: "success" });
        } else if (location.state?.error) {
            setNotification({ open: true, message: location.state.error, severity: "error" });
        }

        return () => {
            clearTimeout(timeout);
            // Disconnect socket
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            // Close all peer connections
            for (let id in connections) {
                if (connections[id]) {
                    connections[id].close();
                    delete connections[id];
                }
            }
            // Stop local stream tracks
            try {
                if (window.localStream) {
                    window.localStream.getTracks().forEach(track => track.stop());
                }
            } catch (e) { }
        };
    }, [])

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                // On mobile, request video only to increase compatibility (many mobile browsers fail with audio:true)
                const constraints = isMobile ? { video: true } : { video: true, audio: true };
                navigator.mediaDevices.getDisplayMedia(constraints)
                    .then(getDislayMediaSuccess)
                    .catch((e) => {
                        console.log(e);
                        setScreen(false); // Reset if user cancels browser dialog
                    })
            }
        } else if (screen === false) {
            // STOP SCREEN SHARE manually when UI button clicked
            try {
                if (window.localStream) {
                    window.localStream.getTracks().forEach(track => track.stop());
                }
            } catch (e) { console.log(e) }

            getUserMedia(); // Switch back to camera
        }
    }

    let resetLocalPin = () => {
        setPinnedSocketId(prev => prev === 'local' ? null : prev);
    }

    const [globalError, setGlobalError] = useState(null);
    const isInitializing = useRef(false);

    const getPermissions = async () => {
        // Skip if already initializing (prevents concurrent calls)
        if (isInitializing.current) {
            console.log('[Init] Skipping: already initializing');
            return;
        }

        // Skip if we already have a working stream with live tracks
        if (didInitialSetup.current && window.localStream) {
            const hasLiveVideo = window.localStream.getVideoTracks().some(t => t.readyState === 'live');
            const hasLiveAudio = window.localStream.getAudioTracks().some(t => t.readyState === 'live');

            if (hasLiveVideo || hasLiveAudio) {
                console.log('[Init] Skipping: stream already has live tracks. Syncing states.');
                setLocalStream(window.localStream);
                setVideo(hasLiveVideo);
                setAudio(hasLiveAudio);
                setVideoAvailable(hasLiveVideo);
                setAudioAvailable(hasLiveAudio);
                setIsConnecting(false);
                return;
            }
            console.log('[Init] Tracks are dead. Re-fetching camera...');
        }

        isInitializing.current = true;
        setGlobalError(null);
        setIsConnecting(true);
        console.log('[Init] getPermissions started');

        const isScreenSharingSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
        console.log('[Init] Screen Sharing Supported:', isScreenSharingSupported);
        // Force available on mobile for visibility, handler will check support and try video-only
        setScreenAvailable(isScreenSharingSupported || window.innerWidth < 1024);

        try {
            // 1. Identify what hardware is actually present
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasVideo = devices.some(d => d.kind === 'videoinput');
            const hasAudio = devices.some(d => d.kind === 'audioinput');
            console.log('[Init] Hardware detected:', { hasVideo, hasAudio });

            if (!hasVideo && !hasAudio) {
                throw new Error("No camera or microphone found on this device.");
            }

            // 2. Perform ONE unified request for whatever is available
            // This is the most stable pattern across all modern browsers
            let stream;
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                try {
                    console.log(`[Init] getUserMedia attempt ${attempts + 1}/${maxAttempts}`);
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: hasVideo,
                        audio: hasAudio
                    });
                    console.log('[Init] Stream captured successfully');
                    break; // Success!
                } catch (err) {
                    attempts++;
                    console.warn(`[Init] Capture attempt ${attempts} failed:`, err.name, err.message);

                    if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                        // Hardware lock - wait 1s and retry
                        console.log('[Init] Hardware lock detected, waiting 1s before retry...');
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        continue;
                    }

                    // Not a lock - try fallback if first attempt failed for other reasons
                    if (attempts === 1 && hasVideo && hasAudio) {
                        try {
                            console.log('[Init] Trying video-only fallback...');
                            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                            console.log('[Init] Fallback: Video only success');
                            break;
                        } catch (err2) {
                            console.log('[Init] Trying audio-only fallback...');
                            stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                            console.log('[Init] Fallback: Audio only success');
                            break;
                        }
                    }

                    if (attempts >= maxAttempts) throw err;
                }
            }

            if (stream) {
                window.localStream = stream;
                setLocalStream(stream);

                const vTrack = stream.getVideoTracks()[0];
                const aTrack = stream.getAudioTracks()[0];

                // Initial state capture
                setVideoAvailable(!!vTrack);
                setAudioAvailable(!!aTrack);
                setVideo(!!vTrack); // This will trigger the track-enable useEffect
                setAudio(!!aTrack);

                if (localVideoref.current) {
                    localVideoref.current.srcObject = stream;
                }

                console.log('[Init] Tracks obtained:', {
                    video: vTrack ? { label: vTrack.label, state: vTrack.readyState } : 'none',
                    audio: aTrack ? { label: aTrack.label, state: aTrack.readyState } : 'none'
                });
            }

            connectToSocketServer();
        } catch (error) {
            console.error('[Init] Fatal error:', error);
            setGlobalError(error.message || "Failed to access camera/microphone.");
        } finally {
            setIsConnecting(false);
            didInitialSetup.current = true;
            isInitializing.current = false;
        }
    };

    useEffect(() => {
        // Sync track enablement with the booleans
        if (window.localStream) {
            window.localStream.getVideoTracks().forEach(track => {
                track.enabled = !!video;
            });
            window.localStream.getAudioTracks().forEach(track => {
                track.enabled = !!audio;
            });
        }
    }, [video, audio])
    let getMedia = () => { // phase 2.2 
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer(); // phase 3.1  to communicate with server

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        setLocalStream(stream);
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            // Replace tracks on existing senders instead of addStream
            let senders = connections[id].getSenders();
            let videoTrack = stream.getVideoTracks()[0];
            let audioTrack = stream.getAudioTracks()[0];

            senders.forEach(sender => {
                if (sender.track && videoTrack && sender.track.kind === 'video') {
                    sender.replaceTrack(videoTrack);
                } else if (sender.track && audioTrack && sender.track.kind === 'audio') {
                    sender.replaceTrack(audioTrack);
                }
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            setLocalStream(window.localStream);
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then(() => { resetLocalPin(); })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        setLocalStream(stream);
        localVideoref.current.srcObject = stream
        setPinnedSocketId('local'); // Auto-pin when screen sharing
        if (socketRef.current) {
            socketRef.current.emit('screen-toggle', true);
        }

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            // Replace tracks on existing senders instead of addStream
            let senders = connections[id].getSenders();
            let videoTrack = stream.getVideoTracks()[0];
            let audioTrack = stream.getAudioTracks()[0];

            senders.forEach(sender => {
                if (sender.track && videoTrack && sender.track.kind === 'video') {
                    sender.replaceTrack(videoTrack);
                } else if (sender.track && audioTrack && sender.track.kind === 'audio') {
                    sender.replaceTrack(audioTrack);
                }
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)
            setPinnedSocketId(null); // Unpin when screen sharing ends
            if (socketRef.current) {
                socketRef.current.emit('screen-toggle', false);
            }

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            setLocalStream(window.localStream);
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => { //Phase 4: Signal Exchange (Handshake)
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (!connections[fromId]) {
                console.warn(`[WebRTC] Signal received for unknown connection: ${fromId}`);
                return;
            }

            if (signal.sdp) {
                console.log(`[WebRTC] SDP ${signal.sdp.type} from: ${fromId}`);
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                console.log(`[WebRTC] Sending answer to: ${fromId}`);
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.error(`[WebRTC] setLocalDescription Error:`, e))
                        }).catch(e => console.error(`[WebRTC] createAnswer Error:`, e))
                    }
                }).catch(e => console.error(`[WebRTC] setRemoteDescription Error from ${fromId}:`, e))
            }

            if (signal.ice) {
                console.log(`[WebRTC] ICE candidate from: ${fromId}`);
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.error(`[WebRTC] addIceCandidate Error:`, e))
            }
        }
    }




    let connectToSocketServer = () => { // phase 3.1
        if (socketRef.current && socketRef.current.connected) {
            console.log('[Socket] Already connected, skipping initialization');
            return;
        }

        socketRef.current = io.connect(server_url, {
            secure: server_url.startsWith('https'),
            transports: ['websocket', 'polling'] // Allow fallback
        })

        socketRef.current.on('connect_error', (err) => {
            console.error('[Socket] Connection Error:', err);
            setGlobalError(`Failed to connect to signaling server at ${server_url}. ${err.message}`);
            setIsConnecting(false);
        });

        socketRef.current.on('connect_timeout', () => {
            console.error('[Socket] Connection Timeout');
            setGlobalError(`Connection to ${server_url} timed out.`);
            setIsConnecting(false);
        });

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            console.log('[Socket] Connected with id:', socketRef.current.id);
            // Reconnect ghost cleanup
            for (let id in connections) {
                if (connections[id]) {
                    connections[id].close();
                    delete connections[id];
                }
            }
            setVideos([]);

            let currentClientId = localStorage.getItem('clientID');
            if (!currentClientId) {
                currentClientId = 'client_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('clientID', currentClientId);
            }

            const currentUsername = username || localStorage.getItem('name') || localStorage.getItem('username') || "Guest";
            const currentProfilePic = profilePicture || localStorage.getItem('profile_picture') || null;
            socketRef.current.emit('join-call', roomID, currentUsername, currentClientId, currentProfilePic)
            socketIdRef.current = socketRef.current.id
        })

        socketRef.current.on('chat-message', addMessage)  // listener for chat message

        socketRef.current.on('caption-message', (data, senderName, senderSocketId) => {
            setActiveCaptions(prev => ({
                ...prev,
                [senderSocketId]: { text: data, name: senderName, timestamp: Date.now() }
            }));
        })

        socketRef.current.on('video-toggle', (socketId, state) => {
            console.log('[Socket] video-toggle from', socketId, 'state:', state);
            setVideos(prevVideos => prevVideos.map(vid =>
                vid.socketId === socketId ? { ...vid, videoEnabled: state } : vid
            ));
        })

        socketRef.current.on('screen-toggle', (socketId, state) => {
            console.log('[Socket] screen-toggle from', socketId, 'state:', state);
            if (state) {
                setPinnedSocketId(socketId);
            } else {
                setPinnedSocketId(prev => prev === socketId ? null : prev);
            }
            // Also update the video state if needed (though stream might already handle it)
            setVideos(prevVideos => prevVideos.map(vid =>
                vid.socketId === socketId ? { ...vid, isScreenShare: state } : vid
            ));
        })

        socketRef.current.on('user-left', (id) => {
            setVideos((videos) => videos.filter((video) => video.socketId !== id))
            if (connections[id]) {
                connections[id].close();
                delete connections[id];
            }
        })

        socketRef.current.on('user-joined', (...args) => {
            // Robust parsing of multiple arguments or single array
            let id, clients, roomUsers;
            if (args.length === 1 && Array.isArray(args[0])) {
                [id, clients, roomUsers] = args[0];
            } else {
                [id, clients, roomUsers] = args;
            }

            console.log('[Socket] user-joined event:', { id, clients, roomUsers });

            if (!id || !clients) {
                console.warn('[Socket] Malformed user-joined data:', { id, clients, roomUsers });
                return;
            }
            if (roomUsers) {
                setVideos(prevVideos => prevVideos.map(vid => {
                    let updated = false;
                    let newVid = { ...vid };
                    if (roomUsers[vid.socketId]) {
                        if (vid.username !== roomUsers[vid.socketId].name) {
                            newVid.username = roomUsers[vid.socketId].name;
                            updated = true;
                        }
                        if (vid.videoEnabled !== roomUsers[vid.socketId].video) {
                            newVid.videoEnabled = roomUsers[vid.socketId].video;
                            updated = true;
                        }
                        if (vid.profile_picture !== roomUsers[vid.socketId].profile_picture) {
                            newVid.profile_picture = roomUsers[vid.socketId].profile_picture;
                            updated = true;
                        }
                    }
                    return updated ? newVid : vid;
                }));
            }

            // Play join sound when a DIFFERENT user joins (not self)
            if (id !== socketIdRef.current) {
                playJoinSound();
            }

            clients.forEach((socketListId) => {
                // CRITICAL: Don't connect to yourself!
                if (socketListId === socketIdRef.current) return;

                // Skip if connection already exists (don't overwrite working connections)
                if (connections[socketListId]) {
                    console.log('[Socket] Connection already exists for:', socketListId);
                    return;
                }

                connections[socketListId] = new RTCPeerConnection(peerConfigConnections)

                connections[socketListId].onconnectionstatechange = (event) => {
                    console.log(`[WebRTC] Connection state with ${socketListId}:`, connections[socketListId].connectionState);
                };

                // Wait for their ice candidate       
                connections[socketListId].onicecandidate = function (event) {
                    if (event.candidate != null) {
                        socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                    }
                }

                // Wait for their video track
                connections[socketListId].ontrack = (event) => {
                    console.log(`[WebRTC] ontrack from: ${socketListId}`, event.streams);
                    const remoteStream = event.streams[0];
                    if (!remoteStream) {
                        console.warn(`[WebRTC] No stream found in ontrack for: ${socketListId}`);
                        return;
                    }

                    // Atomic update - check and add/update inside setVideos to avoid race conditions
                    setVideos(prevVideos => {
                        let videoExists = prevVideos.find(video => video.socketId === socketListId);
                        if (videoExists) {
                            console.log(`[WebRTC] Updating existing stream for: ${socketListId}`);
                            return prevVideos.map(video =>
                                video.socketId === socketListId ? {
                                    ...video,
                                    stream: new MediaStream(remoteStream.getTracks()), // Force new reference to trigger rendering
                                    username: roomUsers && roomUsers[socketListId] ? roomUsers[socketListId].name : video.username,
                                    videoEnabled: roomUsers && roomUsers[socketListId] ? roomUsers[socketListId].video : video.videoEnabled
                                } : video
                            );
                        } else {
                            console.log(`[WebRTC] Creating new video tile for: ${socketListId}`);
                            return [...prevVideos, {
                                socketId: socketListId,
                                stream: new MediaStream(remoteStream.getTracks()), // Force new reference
                                autoplay: true,
                                playsinline: true,
                                username: roomUsers && roomUsers[socketListId] ? roomUsers[socketListId].name : "Guest",
                                videoEnabled: roomUsers && roomUsers[socketListId] ? roomUsers[socketListId].video : true,
                                profile_picture: roomUsers && roomUsers[socketListId] ? roomUsers[socketListId].profile_picture : null
                            }];
                        }
                    });
                };

                // Add the local video stream tracks
                if (window.localStream) {
                    console.log(`[WebRTC] Adding local tracks to connection for: ${socketListId}`);
                    window.localStream.getTracks().forEach(track => {
                        connections[socketListId].addTrack(track, window.localStream);
                    });
                } else {
                    console.warn(`[WebRTC] No localStream to add for: ${socketListId}. Creating fallback.`);
                    let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                    window.localStream = blackSilence()
                    window.localStream.getTracks().forEach(track => {
                        connections[socketListId].addTrack(track, window.localStream);
                    });
                }
            })

            if (id === socketIdRef.current) {
                for (let id2 in connections) {
                    if (id2 === socketIdRef.current) continue

                    // Stream is already added during connection creation above
                    // Do NOT call addStream again - it creates duplicate streams

                    connections[id2].createOffer().then((description) => {
                        connections[id2].setLocalDescription(description)
                            .then(() => {
                                socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                            })
                            .catch(e => console.log(e))
                    })
                }
            }
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    // Phase 5: Features (Butttons Logic)
    let handleVideo = () => {
        // If video was never captured (e.g. busy hardware), try to re-acquire permissions
        if (!videoAvailable && !isInitializing.current) {
            console.log('[Video] Video unavailable, attempting re-capture...');
            getPermissions();
            return;
        }

        const newState = !video;
        setVideo(newState);
        if (socketRef.current) {
            socketRef.current.emit('video-toggle', newState);
        }
    }
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        if (screen === undefined || screen === false) {
            // Check for actual support before trying to start
            const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
            if (!supported) {
                setNotification({
                    open: true,
                    message: "Screen sharing is not supported by your mobile browser (Apple/Google restriction).",
                    severity: "error"
                });
                return;
            }
        }
        setScreen(!screen);
    }

    let handleReconnect = () => {
        console.log('[WebRTC] Manual reconnect triggered');
        // Clear all existing connections
        for (let id in connections) {
            if (connections[id]) {
                connections[id].close();
                delete connections[id];
            }
        }
        setVideos([]);
        // Re-join the call to trigger new handshakes
        if (socketRef.current) {
            const currentClientId = localStorage.getItem('clientID');
            const currentUsername = username || localStorage.getItem('name') || localStorage.getItem('username') || "Guest";
            socketRef.current.emit('join-call', roomID, currentUsername, currentClientId);
        }
    }

    let handleCaptions = () => {
        setCaptions(!captions);
    }

    let toggleMeetingInfo = () => {
        setShowMeetingReady(!showMeetingReady);
    }

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API not supported in this browser.");
            return;
        }

        if (captions) {
            if (!recognitionRef.current) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onresult = (event) => {
                    let interimTranscript = '';
                    let finalTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }

                    const transcript = finalTranscript || interimTranscript;
                    if (transcript.trim() !== '') {
                        setActiveCaptions(prev => ({
                            ...prev,
                            'local': { text: transcript, name: username, timestamp: Date.now() }
                        }));

                        if (socketRef.current) {
                            socketRef.current.emit('caption-message', transcript, username);
                        }
                    }
                };

                recognition.onerror = (event) => {
                    console.error("Speech recognition error", event.error);
                };

                recognition.onend = () => {
                    if (captions && recognitionRef.current) {
                        try {
                            recognitionRef.current.start();
                        } catch (e) { }
                    }
                };

                recognitionRef.current = recognition;
            }

            try {
                recognitionRef.current.start();
            } catch (e) { console.log(e); }
        } else {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [captions, username]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setActiveCaptions(prev => {
                let updated = { ...prev };
                let changed = false;
                Object.keys(updated).forEach(id => {
                    if (now - updated[id].timestamp > 4000) {
                        delete updated[id];
                        changed = true;
                    }
                });
                return changed ? updated : prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (showModal) {
            setNewMessages(0);
        }
    }, [showModal]);

    //Phase 6: Exit (Call Khatam)
    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/dashboard"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data, isLocal: socketIdSender === socketIdRef.current }
        ]);
        if (socketIdSender !== socketIdRef.current && !showModal) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }


    // Helper: compute grid layout (cols x rows) based on participant count
    const getGridLayout = (count) => {
        if (isMobile) {
            if (count <= 1) return { cols: 1, rows: 1 };
            if (count <= 2) return { cols: 1, rows: 2 };
            if (count <= 4) return { cols: 2, rows: 2 };
            return { cols: 2, rows: Math.ceil(count / 2) };
        }
        if (count <= 1) return { cols: 1, rows: 1 };
        if (count === 2) return { cols: 2, rows: 1 };
        if (count <= 4) return { cols: 2, rows: 2 };
        if (count <= 6) return { cols: 3, rows: 2 };
        if (count <= 9) return { cols: 3, rows: 3 };
        return { cols: 4, rows: Math.ceil(count / 4) };
    };

    // Play the join sound
    const playJoinSound = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.4);
        } catch (e) { console.log('Join sound error:', e); }
    };

    // All tiles: remote videos + local (append isLocal flag to local streams)
    const allTiles = videos.length === 0
        ? [{ socketId: 'local', stream: localStream, username: username, isLocal: true, profile_picture: profilePicture }]
        : [...videos, { socketId: 'local', stream: localStream, username: username, isLocal: true, profile_picture: profilePicture }];

    const pinnedTile = allTiles.find(t => t.socketId === pinnedSocketId) || null;
    const unpinnedTiles = pinnedTile ? allTiles.filter(t => t.socketId !== pinnedSocketId) : allTiles;

    const gridLayout = getGridLayout(unpinnedTiles.length);


    return (
        <div>

            {globalError && (
                <div className="flex flex-col items-center justify-center h-screen w-screen bg-[var(--bg-root)] text-white p-10 z-[300]">
                    <div className="bg-[var(--bg-card)] border border-white/10 p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CloseIcon sx={{ color: '#F87171', fontSize: '32px' }} />
                        </div>
                        <h1 className="text-2xl font-bold mb-4">Meeting Error</h1>
                        <p className="text-gray-400 mb-8 leading-relaxed">{globalError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            Reload Application
                        </button>
                        <p className="mt-6 text-xs text-gray-500">Check if your camera is being used by another app</p>
                    </div>
                </div>
            )}

            {isConnecting ? (
                <div className="flex flex-col items-center justify-center h-screen w-screen bg-[var(--bg-root)] text-white z-[200]">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-white/5 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <VideocamIcon sx={{ color: 'var(--primary)', fontSize: '24px' }} />
                        </div>
                    </div>
                    <div className="mt-8 text-center">
                        <h2 className="text-2xl font-bold mb-2">Setting up your call</h2>
                        <p className="text-indigo-400/70 animate-pulse text-sm">Requesting camera and audio access...</p>
                    </div>
                </div>
            ) : (

                <div className="relative w-screen h-screen bg-[var(--bg-root)] overflow-hidden flex flex-col">

                    {/* Hidden video element to keep localVideoref pipeline alive */}
                    <video ref={localVideoref} autoPlay playsInline muted className="hidden" />

                    {/* Meeting Ready Popup */}
                    {showMeetingReady && (
                        <MeetingReadyPopup
                            meetingUrl={`${window.location.origin}/${roomID}`}
                            username={username}
                            onClose={() => setShowMeetingReady(false)}
                        />
                    )}

                    {/* Bottom Controls Component */}
                    <VideoControls
                        video={video}
                        audio={audio}
                        screen={screen}
                        screenAvailable={screenAvailable}
                        newMessages={newMessages}
                        showModal={showModal}
                        captions={captions}
                        handleVideo={handleVideo}
                        handleAudio={handleAudio}
                        handleScreen={handleScreen}
                        handleEndCall={handleEndCall}
                        setModal={setModal}
                        handleCaptions={handleCaptions}
                        toggleMeetingInfo={toggleMeetingInfo}
                    />

                    {/* Main Content Area: Video Grid + Chat Side by Side */}
                    <div className="flex-1 flex overflow-hidden">

                        {/* Video Area */}
                        <div className={`flex-1 relative p-2 md:p-4 pb-24 transition-all duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col md:flex-row gap-2 md:gap-4 ${!isMobile && showModal ? 'pr-[360px]' : 'pr-0'
                            }`}>

                            {pinnedTile ? (
                                // --- PINNED LAYOUT (Main Area + Sidebar) ---
                                <>
                                    {/* Main Pinned Video Area */}
                                    <div className="flex-1 h-full rounded-2xl overflow-hidden transition-all duration-500 ease-in-out bg-[var(--bg-darker)] border border-white/5 shadow-2xl">
                                        <VideoTile
                                            videoObj={pinnedTile}
                                            isLocal={pinnedTile.isLocal || false}
                                            videoEnabled={pinnedTile.isLocal ? video : pinnedTile.videoEnabled}
                                            isPinned={true}
                                            isScreenShare={pinnedTile.isLocal ? screen : pinnedTile.isScreenShare}
                                            onPin={() => setPinnedSocketId(null)}
                                        />
                                    </div>

                                    {/* Sidebar for unpinned videos */}
                                    {unpinnedTiles.length > 0 && (
                                        <div className="w-full md:w-[240px] h-[120px] md:h-full overflow-x-auto md:overflow-y-auto flex flex-row md:flex-col gap-2 md:gap-3 pr-1 hide-scrollbar">
                                            {unpinnedTiles.map((vid) => (
                                                <div
                                                    key={vid.socketId}
                                                    className="h-full md:h-auto aspect-video md:w-full shrink-0 rounded-xl overflow-hidden transition-all duration-300 ease-in-out bg-[var(--bg-darker)] border border-white/5"
                                                >
                                                    <VideoTile
                                                        videoObj={vid}
                                                        isLocal={vid.isLocal || false}
                                                        videoEnabled={vid.isLocal ? video : vid.videoEnabled !== false}
                                                        isPinned={false}
                                                        isScreenShare={vid.isLocal ? screen : vid.isScreenShare}
                                                        onPin={() => setPinnedSocketId(vid.socketId)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                // --- REGULAR GRID LAYOUT ---
                                <div
                                    className="flex-1 w-full h-full gap-4 transition-all duration-500 ease-in-out"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
                                        gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
                                    }}
                                >
                                    {unpinnedTiles.map((vid) => (
                                        <div
                                            key={vid.socketId}
                                            className="w-full h-full rounded-2xl overflow-hidden transition-all duration-500 ease-in-out bg-[var(--bg-darker)] border border-white/5 shadow-lg"
                                        >
                                            <VideoTile
                                                videoObj={vid}
                                                isLocal={vid.isLocal || false}
                                                videoEnabled={vid.isLocal ? video : vid.videoEnabled !== false}
                                                isPinned={false}
                                                isScreenShare={vid.isLocal && screen}
                                                onPin={() => setPinnedSocketId(vid.socketId)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Captions Overlay */}
                            {captions && Object.keys(activeCaptions).length > 0 && (
                                <div className="absolute bottom-6 left-0 w-full flex flex-col items-center gap-2 pointer-events-none z-40 px-4">
                                    {Object.values(activeCaptions).map((cap, idx) => (
                                        <div key={idx} className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg max-w-2xl text-center border border-white/10 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <span className="font-bold text-indigo-300 text-sm mr-2">{cap.name}:</span>
                                            <span className="text-lg">{cap.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Chat Sidebar - fixed on the right with slide animation */}
                        <ChatSidebar
                            showModal={showModal}
                            setModal={setModal}
                            messages={messages}
                            message={message}
                            setMessage={setMessage}
                            sendMessage={sendMessage}
                        />
                    </div>
                </div>
            )}

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    sx={{ borderRadius: '12px', bgcolor: notification.severity === 'success' ? '#10B981' : (notification.severity === 'info' ? 'var(--primary)' : '#EF4444'), color: 'var(--text-primary)' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

        </div>
    )
}
