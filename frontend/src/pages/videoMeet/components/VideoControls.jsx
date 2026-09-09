import React from 'react';
import { IconButton, Badge } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ChatIcon from '@mui/icons-material/Chat';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
import ClosedCaptionDisabledIcon from '@mui/icons-material/ClosedCaptionDisabled';

import PersonAddIcon from '@mui/icons-material/PersonAdd';

const VideoControls = ({
    video, audio, screen, screenAvailable, newMessages, showModal, captions,
    handleVideo, handleAudio, handleScreen, handleEndCall, setModal, handleCaptions,
    toggleMeetingInfo
}) => {
    return (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center flex-wrap gap-1 md:gap-3 bg-[var(--bg-card)] px-4 md:px-6 py-2 md:py-3 rounded-full md:rounded-full z-50 shadow-2xl max-w-[95vw] md:max-w-none">

            <IconButton onClick={handleAudio} sx={{ color: audio ? 'var(--text-primary)' : '#ef4444', '&:hover': { backgroundColor: 'var(--border-main)' } }}>
                {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            <IconButton onClick={handleVideo} sx={{ color: video ? 'var(--text-primary)' : '#ef4444', '&:hover': { backgroundColor: 'var(--border-main)' } }}>
                {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            {screenAvailable && (
                <IconButton onClick={handleScreen} sx={{ color: screen ? '#818CF8' : 'var(--text-primary)', '&:hover': { backgroundColor: 'var(--border-main)' } }}>
                    {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                </IconButton>
            )}

            <IconButton onClick={handleCaptions} sx={{ color: captions ? '#10B981' : 'var(--text-primary)', '&:hover': { backgroundColor: 'var(--border-main)' } }}>
                {captions ? <ClosedCaptionIcon /> : <ClosedCaptionDisabledIcon />}
            </IconButton>

            <IconButton onClick={toggleMeetingInfo} title="Meeting Info" sx={{ color: 'var(--text-primary)', '&:hover': { backgroundColor: 'var(--border-main)', color: '#818CF8' } }}>
                <PersonAddIcon />
            </IconButton>

            <IconButton
                onClick={handleEndCall}
                size="small"
                sx={{
                    backgroundColor: '#ef4444',
                    color: 'var(--text-primary)',
                    padding: '12px',
                    '&:hover': { backgroundColor: '#dc2626' }
                }}
            >
                <CallEndIcon fontSize="small" />
            </IconButton>

            <Badge badgeContent={newMessages} color="error" max={99}>
                <IconButton
                    onClick={() => setModal(!showModal)}
                    sx={{ color: showModal ? '#818CF8' : 'var(--text-secondary)', '&:hover': { backgroundColor: 'var(--border-main)' } }}
                >
                    <ChatIcon fontSize="small" />
                </IconButton>
            </Badge>
        </div>
    );
};

export default VideoControls;
