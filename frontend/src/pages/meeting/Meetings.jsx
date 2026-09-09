import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Header from './components/Header/Header';
import Calendar from './components/Calendar/Calendar';
import PastMeetings from './components/PastMeetings/PastMeetings';
import ScheduleSidebar from './components/ScheduleSidebar/ScheduleSidebar';

export default function Meetings() {
    const [meetings, setMeetings] = useState([]);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const token = localStorage.getItem('token');
    const currentUserEmail = localStorage.getItem('email');

    const navigate = useNavigate();

    const fetchMeetings = async () => {
        if (!token) return;
        try {
            const response = await axiosInstance.get(`/api/v1/meetings/`);
            const data = Array.isArray(response.data) ? response.data : [];
            const formattedMeetings = data.map(m => {
                const start = new Date(m.startTime);
                const end = new Date(m.endTime);

                // Safety check for invalid dates
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    console.error('Invalid date found in meeting:', m);
                    return null;
                }

                const pad = (n) => n.toString().padStart(2, '0');
                const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
                const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
                const date = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;

                return {
                    ...m,
                    id: m.meetingCode,
                    date: date,
                    startTime: startTime,
                    endTime: endTime,
                    participants: Array.isArray(m.participants)
                        ? m.participants.map(p => typeof p === 'object' ? p : { name: p, username: p, status: 'pending' })
                        : (m.participants && typeof m.participants === 'string'
                            ? m.participants.split(',').map(p => ({ name: p.trim(), username: p.trim(), status: 'pending' }))
                            : []),
                    participantCount: m.participantCount || (Array.isArray(m.participants) ? m.participants.length : 0),
                    isHost: m.user_id === currentUserEmail,
                    color: 'rgba(99, 102, 241, 0.2)',
                    border: 'var(--primary)',
                    text: 'var(--primary-light)'
                };
            }).filter(m => {
                if (!m) return false;
                if (m.isHost) return true;
                // Find current user's participant object
                const myParticipant = m.participants.find(p => p.username === currentUserEmail);
                // Only show if not rejected
                return !myParticipant || myParticipant.status !== 'rejected';
            });
            setMeetings(formattedMeetings);
        } catch (error) {
            console.error('Error fetching meetings:', error);
            if (error?.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        fetchMeetings();

        // Listen for real-time refresh event
        const handleRefresh = () => {
            console.log('Meetings: Refreshing meetings due to real-time update');
            fetchMeetings();
        };

        window.addEventListener('refreshMeetings', handleRefresh);
        return () => window.removeEventListener('refreshMeetings', handleRefresh);
    }, [token]);

    const handleScheduleMeeting = async (meetingData) => {
        try {
            const payload = {
                token: token,
                title: meetingData.title,
                description: meetingData.description,
                startTime: `${meetingData.date}T${meetingData.startTime}:00`,
                endTime: `${meetingData.date}T${meetingData.endTime}:00`,
                participants: Array.isArray(meetingData.participants)
                    ? meetingData.participants
                    : meetingData.participants.split(',').map(p => p.trim()).filter(p => p !== '')
            };
            await axiosInstance.post(`/api/v1/meetings/schedule`, payload);
            fetchMeetings();
        } catch (error) {
            console.error('Error scheduling meeting:', error);
            if (error?.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    const handleUpdateMeeting = async (updatedMeeting) => {
        try {
            const payload = {
                token: token,
                title: updatedMeeting.title,
                description: updatedMeeting.description,
                startTime: `${updatedMeeting.date}T${updatedMeeting.startTime}:00`,
                endTime: `${updatedMeeting.date}T${updatedMeeting.endTime}:00`,
                participants: typeof updatedMeeting.participants === 'string'
                    ? updatedMeeting.participants.split(',').map(p => p.trim()).filter(p => p !== '')
                    : updatedMeeting.participants
            };
            await axiosInstance.put(`/api/v1/meetings/${updatedMeeting.id}`, payload);
            setIsEditModalOpen(false);
            setEditingMeeting(null);
            fetchMeetings();
        } catch (error) {
            console.error('Error updating meeting:', error);
        }
    };

    const handleRejectMeeting = async (meetingCode) => {
        try {
            await axiosInstance.post(`/api/v1/meetings/${meetingCode}/respond?action=reject`);
            fetchMeetings();
        } catch (error) {
            console.error('Error rejecting meeting:', error);
        }
    };

    const handleAcceptMeeting = async (meetingCode) => {
        try {
            await axiosInstance.post(`/api/v1/meetings/${meetingCode}/respond?action=accept`);
            fetchMeetings();
        } catch (error) {
            console.error('Error accepting meeting:', error);
        }
    };

    const handleDeleteMeeting = async (id) => {
        try {
            await axiosInstance.delete(`/api/v1/meetings/${id}`);
            setIsEditModalOpen(false);
            setEditingMeeting(null);
            fetchMeetings();
        } catch (error) {
            console.error('Error deleting meeting:', error);
        }
    };

    const handleOpenEditModal = (meeting) => {
        setEditingMeeting(meeting);
        setIsEditModalOpen(true);
    };

    const location = useLocation();
    const openSchedule = location.state?.openSchedule;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                height: { xs: 'auto', md: 'calc((100vh / var(--app-zoom, 1)) - 64px)' },
                gap: { xs: 3, md: 4 }
            }}
        >
            {/* Left/Main Column */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: { xs: 'visible', md: 'auto' },
                    pr: { xs: 0, md: 1 },
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { background: 'var(--border-main)', borderRadius: '4px' },
                }}
            >
                <Header
                    onSchedule={handleScheduleMeeting}
                    onUpdate={handleUpdateMeeting}
                    onDelete={handleDeleteMeeting}
                    onRefresh={fetchMeetings}
                    editingMeeting={editingMeeting}
                    isEditModalOpen={isEditModalOpen}
                    onCloseEdit={() => { setIsEditModalOpen(false); setEditingMeeting(null); }}
                    autoOpenCreate={openSchedule}
                />

                <Calendar
                    meetings={meetings}
                    onEdit={handleOpenEditModal}
                    onAccept={handleAcceptMeeting}
                    onReject={handleRejectMeeting}
                />

                {/* Mobile: Show Upcoming section here (below calendar) */}
                <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
                    <ScheduleSidebar
                        meetings={meetings}
                        onEdit={handleOpenEditModal}
                    />
                </Box>

                {/* Desktop: Show Past Meetings here */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <PastMeetings meetings={meetings} />
                </Box>
            </Box>

            {/* Right/Sidebar Column (Desktop Only) */}
            <Box
                sx={{
                    width: { md: 350 },
                    flexShrink: 0,
                    height: '100%',
                    display: { xs: 'none', md: 'block' }
                }}
            >
                <ScheduleSidebar
                    meetings={meetings}
                    onEdit={handleOpenEditModal}
                />
            </Box>

            {/* Mobile: Show Past Meetings bottom-most */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, pb: 4 }}>
                <PastMeetings meetings={meetings} />
            </Box>
        </Box>
    );
}
