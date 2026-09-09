import React, { useState, useEffect } from 'react';
import { IconButton, Snackbar, Avatar, CircularProgress, Alert, Typography, Box } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import VideocamIcon from '@mui/icons-material/Videocam';
import axiosInstance from '../../utils/axiosInstance';

const MeetingReadyPopup = ({ meetingUrl, username, onClose }) => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [showFriends, setShowFriends] = useState(false);
    const [friends, setFriends] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(false);
    const [inviteStatus, setInviteStatus] = useState({ open: false, message: "", severity: "success" });

    const handleCopy = () => {
        navigator.clipboard.writeText(meetingUrl);
        setOpenSnackbar(true);
    };

    const fetchFriends = async () => {
        setLoadingFriends(true);
        try {
            const response = await axiosInstance.get(`/api/v1/friends/list`);
            setFriends(response.data.friends || []);
        } catch (error) {
            console.error("Error fetching friends:", error);
        } finally {
            setLoadingFriends(false);
        }
    };

    useEffect(() => {
        if (showFriends) {
            fetchFriends();
        }
    }, [showFriends]);

    const sendInvite = async (friendUsername) => {
        const token = localStorage.getItem("token");
        // Extract meeting code from URL robustly (handles both /CODE and ?roomID=CODE)
        let meetingCode = "";
        try {
            const urlObj = new URL(meetingUrl);
            meetingCode = urlObj.searchParams.get('roomID') || urlObj.pathname.split('/').pop();
        } catch (e) {
            meetingCode = meetingUrl.split('/').pop();
        }
        
        try {
            const response = await axiosInstance.post(`/api/v1/friends/invite`, {
                friend_username: friendUsername,
                meeting_code: meetingCode
            });
            setInviteStatus({ 
                open: true, 
                message: response.data.sent ? `Invite sent to ${friendUsername}!` : response.data.message, 
                severity: response.data.sent ? "success" : "warning" 
            });
        } catch (error) {
            setInviteStatus({ 
                open: true, 
                message: "Failed to send invite.", 
                severity: "error" 
            });
        }
    };

    return (
        <div className="absolute bottom-[100px] left-6 w-[360px] max-h-[500px] flex flex-col rounded-xl z-[100] bg-[var(--bg-card)] border border-[var(--border-main)] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out">
            
            <div className="p-6 border-b border-[var(--border-light)]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-[var(--text-primary)]">Your meeting's ready</h2>
                    <IconButton size="small" onClick={onClose} sx={{ color: 'var(--text-secondary)' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>

                <button 
                    onClick={() => setShowFriends(!showFriends)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-4 transition-all ${
                        showFriends 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                        : 'bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30'
                    }`}
                >
                    <PersonAddAlt1Icon fontSize="small" />
                    {showFriends ? 'Hide friends' : 'Add others'}
                </button>

                {!showFriends && (
                    <>
                        <p className="text-[var(--text-secondary)] text-sm mb-4 leading-relaxed">
                            Or share this meeting link with others you want in the meeting
                        </p>

                        <div className="flex items-center bg-[var(--bg-dark)] border border-[var(--border-main)] rounded-lg px-3 py-2.5 mb-2">
                            <span className="flex-1 text-[var(--text-primary)] text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                {meetingUrl}
                            </span>
                            <IconButton size="small" onClick={handleCopy} sx={{ color: 'var(--text-secondary)', padding: '4px' }}>
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </div>
                    </>
                )}
            </div>

            {showFriends && (
                <div className="flex-1 overflow-y-auto p-4 bg-[var(--bg-dark)] min-h-[150px] max-h-[300px]">
                    <Typography variant="caption" className="text-[var(--text-secondary)] mb-3 block px-2">INVITE YOUR FRIENDS</Typography>
                    
                    {loadingFriends ? (
                        <div className="flex justify-center py-6">
                            <CircularProgress size={20} sx={{ color: '#818CF8' }} />
                        </div>
                    ) : friends.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {friends.map((friend) => (
                                <div key={friend.username} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-card-alt)] transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--primary-hover)', fontSize: '0.9rem' }}>
                                            {friend.name[0]}
                                        </Avatar>
                                        <div className="overflow-hidden">
                                            <p className="text-[var(--text-primary)] text-sm font-medium truncate w-[140px]">{friend.name}</p>
                                            <p className="text-[var(--text-secondary)] text-[10px] truncate w-[140px]">@{friend.username}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => sendInvite(friend.username)}
                                        className="text-[11px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-md hover:bg-indigo-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        Invite
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 text-sm py-4">No friends found</p>
                    )}
                </div>
            )}

            <div className="p-4 px-6 border-t border-[var(--border-light)]">
                {username && (
                    <p className="text-[var(--text-secondary)] text-xs flex items-center gap-1.5">
                        <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 6.5C7.38071 6.5 8.5 5.38071 8.5 4C8.5 2.61929 7.38071 1.5 6 1.5C4.61929 1.5 3.5 2.61929 3.5 4C3.5 5.38071 4.61929 6.5 6 6.5ZM6 8C3.99661 8 0 9.00339 0 11.0034V12.5H12V11.0034C12 9.00339 8.00339 8 6 8Z" fill="var(--text-secondary)"/>
                        </svg>
                        Joined as {username}
                    </p>
                )}
            </div>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box sx={{ 
                    bgcolor: 'var(--bg-darker)', 
                    color: 'var(--text-primary)', 
                    px: 3, py: 1.5, 
                    borderRadius: '12px', 
                    border: '1px solid var(--border-main)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <ContentCopyIcon sx={{ fontSize: '18px', color: 'var(--primary)' }} />
                    Meeting link copied!
                </Box>
            </Snackbar>

            <Snackbar
                open={inviteStatus.open}
                autoHideDuration={4000}
                onClose={() => setInviteStatus({ ...inviteStatus, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box sx={{ 
                    background: inviteStatus.severity === 'success' 
                        ? 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-darker) 100%)' 
                        : 'rgba(28, 34, 48, 0.95)',
                    color: 'var(--text-primary)', 
                    px: 3, py: 2, 
                    borderRadius: '16px', 
                    border: '1px solid var(--border-main)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    minWidth: '280px'
                }}>
                    <Typography sx={{ 
                        fontSize: '14px', 
                        fontWeight: 600,
                        color: inviteStatus.severity === 'error' ? '#F87171' : (inviteStatus.severity === 'warning' ? '#FBBF24' : 'var(--primary)'),
                        mb: 0.5
                    }}>
                        {inviteStatus.severity === 'success' ? 'Invite Sent' : 'Notification'}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {inviteStatus.message}
                    </Typography>
                </Box>
            </Snackbar>
        </div>
    );
};

export default MeetingReadyPopup;
