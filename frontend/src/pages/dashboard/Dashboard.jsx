import React, { useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import TopHeader from './TopHeader';
import HeroSection from './HeroSection';
import UpcomingMeetings from './UpcomingMeetings';
import InsightsSidebar from './InsightsSidebar';
import RecentSummaries from './RecentSummaries';
import { requestForToken } from '../../firebase';

export default function Dashboard() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        requestForToken();
    }, []);

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: { xs: 2.5, md: 3 }, color: 'var(--text-primary)', maxWidth: '1200px', mx: 'auto' }}>
            {/* Top Header */}
            <TopHeader />

            {/* Hero Banner - Full Width */}
            <HeroSection />

            {/* Bottom Section: Left (Meetings + Summaries) | Right (Insights) */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', lg: 'row' }, 
                gap: { xs: 2.5, md: 3 }, 
                alignItems: { xs: 'stretch', lg: 'flex-start' } 
            }}>
                {/* Left Column */}
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: { xs: 2.5, md: 3 } }}>
                    <UpcomingMeetings />
                    <RecentSummaries />
                </Box>

                {/* Right Column - Insights Sidebar */}
                <Box sx={{ width: { xs: '100%', lg: '320px' }, flexShrink: 0 }}>
                    <InsightsSidebar />
                </Box>
            </Box>
        </Box>
    );
}
