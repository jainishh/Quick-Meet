import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Signup from '../SignupAndLogin/Signup';
import Login from '../SignupAndLogin/Login';
import VideoMeetComponent from '../videoMeet/VideoMeet';
import Root from '../root/Root';
import Dashboard from '../dashboard/Dashboard';
import Meetings from '../meeting/Meetings';
import Summarise from '../summarise/summarise';
import Transcripts from '../transcripts/transcripts';
import Reports from '../reports/Reports';
import Settings from '../settings/settings';
import MeetingHistory from '../meeting/history/MeetingHistory';
import UpcomingSchedule from '../dashboard/UpcomingSchedule';
import Friends from '../friends/Friends';
import withAuth from '../../utils/withAuth';

const ProtectedRoot = withAuth(Root);

export default function AllRoutes() {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route path='/' element={<Signup />} />
            <Route path='/login' element={<Login />} />

            {/* Pages with Sidebar Layout - Protected */}
            <Route element={<ProtectedRoot />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/meetings" element={<Meetings />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/summaries" element={<Summarise />} />
                <Route path="/transcripts" element={<Transcripts />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/meetings/history" element={<MeetingHistory />} />
                <Route path="/upcoming" element={<UpcomingSchedule />} />
            </Route>

            {/* Dynamic Video Meeting route */}
            <Route path='/video-meet' element={<VideoMeetComponent />} />
            <Route path='/:url' element={<VideoMeetComponent />} />
        </Routes>
    );
}
