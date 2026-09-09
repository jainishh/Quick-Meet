import React from 'react';

const VideoTile = ({ videoObj, isLocal, videoEnabled, isPinned, onPin, isScreenShare }) => {
    let hasActiveVideo = false;
    
    if (isLocal) {
        // Local: Trust the button state primarily
        hasActiveVideo = videoEnabled === true;
    } else {
        // Remote: If signal is explicitly OFF, show avatar.
        // Otherwise, if we have a stream, try to show video.
        if (videoEnabled === false) {
            hasActiveVideo = false;
        } else {
            hasActiveVideo = !!videoObj?.stream && videoObj.stream.getVideoTracks().length > 0;
        }
    }
    
    // Final safety: if no stream at all, can't show video
    if (hasActiveVideo && (!videoObj?.stream || videoObj.stream.getVideoTracks().length === 0)) {
        hasActiveVideo = false;
    }

    const username = videoObj?.username || "Guest";
    const initial = username.charAt(0).toUpperCase();

    // Local camera should be mirrored. Local screen share should NOT be mirrored.
    const shouldMirror = isLocal && !isScreenShare;

    const videoRef = React.useRef(null);

    React.useEffect(() => {
        if (videoRef.current && videoObj?.stream) {
            if (videoRef.current.srcObject !== videoObj.stream) {
                videoRef.current.srcObject = videoObj.stream;
                console.log(`[VideoTile] Assigned stream to video: socket=${videoObj.socketId}`);
                
                // Safety play call: ensure it starts playing even if autoPlay was throttled
                videoRef.current.play().catch(e => {
                    console.warn(`[VideoTile] Play failed:`, e);
                });
            }
        }
    }, [videoObj?.stream, videoObj?.socketId, hasActiveVideo]);

    const profilePic = videoObj?.profile_picture;

    // Generate a consistent background color based on username for the fallback
    const getBgColor = (text) => {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash % 360);
        return `hsl(${h}, 45%, 25%)`; // Dark, muted colors
    };

    const bgColor = getBgColor(username);

    return (
        <div 
            onClick={onPin}
            className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-[var(--bg-card)] hover:ring-2 hover:ring-purple-500/50 transition-all cursor-pointer ${isPinned ? 'ring-2 ring-purple-500' : ''}`}
        >
            
            {hasActiveVideo ? (
                <video
                    data-socket={videoObj.socketId}
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    className={`w-full h-full ${isScreenShare || isPinned ? 'object-contain bg-black' : 'object-cover'} ${shouldMirror ? 'scale-x-[-1]' : ''}`}
                />
            ) : (
                <div 
                    className="w-full h-full flex items-center justify-center transition-all duration-500"
                    style={{ background: `linear-gradient(135deg, ${bgColor} 0%, var(--bg-darker) 100%)` }}
                >
                    <div className="relative group">
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-[var(--border-main)] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        
                        <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full border-2 border-[var(--border-light)] bg-[var(--bg-card)] shadow-2xl flex items-center justify-center overflow-hidden">
                            {profilePic ? (
                                <img 
                                    src={profilePic} 
                                    alt={username} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                            ) : null}
                            <div 
                                className={`w-full h-full items-center justify-center text-[var(--text-primary)] font-bold text-4xl md:text-5xl lg:text-6xl ${profilePic ? 'hidden' : 'flex'}`}
                                style={{ textShadow: '0 2px 10px var(--shadow-medium)' }}
                            >
                                {initial}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Username overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[var(--bg-card)] px-3 py-1.5 rounded-lg border border-[var(--border-light)] shadow-md">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-[var(--text-primary)] text-xs font-medium tracking-wide">
                    {username}{isLocal ? ' (You)' : ''}{isScreenShare && isLocal ? ' (Presenting)' : ''}
                </span>
            </div>
        </div>
    );
};

export default VideoTile;
