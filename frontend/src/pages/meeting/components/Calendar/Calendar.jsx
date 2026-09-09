import React, { useState } from 'react';
import { Box, Typography, ButtonGroup, Button, IconButton, Menu, MenuItem } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MeetingDetailsModal from './MeetingDetailsModal';

export default function Calendar({ meetings = [], onEdit, onAccept, onReject }) {
    const [currentDate, setCurrentDate] = useState(new Date()); // Dynamic current date
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    // Placeholder events matching the image design
    const dummyEvents = {
        '2023-9-4': [ // Oct 4
            { id: 1, time: '09:00', title: 'Design Sprint', color: 'rgba(249, 115, 22, 0.2)', border: '#F97316', text: '#F97316', description: 'Design sync for the new dashboard', participants: 'alex@example.com, sara@example.com', date: 'Oct 4, 2023', startTime: '09:00', endTime: '10:30' },
            { id: 2, time: '11:30', title: 'Stakeholder Review', color: 'rgba(249, 115, 22, 0.2)', border: '#F97316', text: '#F97316', description: 'Reviewing progress with key stakeholders', participants: 'boss@example.com', date: 'Oct 4, 2023', startTime: '11:30', endTime: '12:30' },
            { id: 3, time: '14:00', title: 'QA Sync', color: 'rgba(56, 188, 248, 0.2)', border: '#38BDF8', text: '#38BDF8', description: 'Weekly QA report and sync', participants: 'tester1@example.com', date: 'Oct 4, 2023', startTime: '14:00', endTime: '14:30' }
        ],
        '2023-9-5': [ // Oct 5
            { id: 4, time: '10:00', title: 'Product All Hands', color: 'rgba(249, 115, 22, 0.2)', border: '#F97316', text: '#F97316', description: 'Monthly company-wide meeting', participants: 'team@example.com', date: 'Oct 5, 2023', startTime: '10:00', endTime: '11:00' }
        ]
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const generateCalendarDates = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const todayStr = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;

        const daysInCurrentMonth = getDaysInMonth(year, month);
        const daysInPrevMonth = getDaysInMonth(year, month - 1);
        const startDay = getFirstDayOfMonth(year, month);

        const dates = [];

        // Previous month padding
        for (let i = startDay - 1; i >= 0; i--) {
            dates.push({
                date: daysInPrevMonth - i,
                disabled: true,
            });
        }

        // Current month
        for (let i = 1; i <= daysInCurrentMonth; i++) {
            const pad = (n) => n.toString().padStart(2, '0');
            const targetDateStr = `${year}-${pad(month + 1)}-${pad(i)}`;
            const displayDateStr = `${year}-${month}-${i}`; // For staticEvents lookup
            const isToday = displayDateStr === todayStr;

            // Combine dummy and dynamic meetings
            // Format dynamic meetings for display
            const dynamicMeetingsForDate = meetings.filter(m => m.date === targetDateStr).map(m => ({
                id: m.id,
                time: m.startTime,
                title: m.title,
                color: 'rgba(139, 92, 246, 0.15)', // Purple theme
                border: 'var(--primary-light)',
                text: 'var(--primary-light)',
                raw: m // Keep the original data for details
            }));

            const staticEvents = dummyEvents[displayDateStr] || [];
            const allEvents = [...staticEvents, ...dynamicMeetingsForDate];

            dates.push({
                date: i,
                disabled: false,
                active: allEvents.length > 0,
                isToday: isToday,
                events: allEvents.length > 0 ? allEvents : null
            });
        }

        // Next month padding to fill exactly 35 or 42 cells
        const totalCells = dates.length <= 35 ? 35 : 42;
        const remainingCells = totalCells - dates.length;
        for (let i = 1; i <= remainingCells; i++) {
            dates.push({
                date: i,
                disabled: true,
            });
        }

        return dates;
    };

    const dates = generateCalendarDates();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const [monthAnchorEl, setMonthAnchorEl] = useState(null);
    const [yearAnchorEl, setYearAnchorEl] = useState(null);

    const handleMonthClick = (event) => setMonthAnchorEl(event.currentTarget);
    const handleMonthClose = () => setMonthAnchorEl(null);
    const handleMonthSelect = (monthIndex) => {
        setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
        handleMonthClose();
    };

    const handleYearClick = (event) => setYearAnchorEl(event.currentTarget);
    const handleYearClose = () => setYearAnchorEl(null);
    const handleYearSelect = (year) => {
        setCurrentDate(new Date(year, currentDate.getMonth(), 1));
        handleYearClose();
    };

    const handleEventClick = (e, event) => {
        e.stopPropagation();
        // If it's a dynamic meeting, it has the 'raw' property
        const meetingData = event.raw ? event.raw : {
            title: event.title,
            description: event.description,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            participants: event.participants
        };
        setSelectedMeeting(meetingData);
        setIsDetailsModalOpen(true);
    };

    return (
        <Box sx={{ mb: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <Typography
                                variant="h4"
                                onClick={handleMonthClick}
                                sx={{
                                    fontSize: { xs: '1.5rem', md: '2.125rem' },
                                    fontWeight: 800,
                                    color: 'var(--text-primary)',
                                    letterSpacing: '-0.5px',
                                    cursor: 'pointer',
                                    '&:hover': { color: 'var(--primary-light)' },
                                    transition: 'color 0.2s'
                                }}
                            >
                                {monthNames[currentDate.getMonth()]}
                            </Typography>
                            <Menu
                                anchorEl={monthAnchorEl}
                                open={Boolean(monthAnchorEl)}
                                onClose={handleMonthClose}
                                PaperProps={{
                                    sx: {
                                        bgcolor: 'var(--bg-card)',
                                        border: '1px solid var(--border-light)',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                        mt: 1,
                                        maxHeight: 300,
                                        '&::-webkit-scrollbar': {
                                            width: '6px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: 'rgba(255, 255, 255, 0.02)',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: 'rgba(148, 163, 184, 0.2)',
                                            borderRadius: '10px',
                                        },
                                        '&::-webkit-scrollbar-thumb:hover': {
                                            background: 'rgba(148, 163, 184, 0.4)',
                                        },
                                        '& .MuiMenuItem-root': {
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' },
                                            '&.Mui-selected': { bgcolor: 'rgba(99, 102, 241, 0.25)', color: 'var(--primary)', fontWeight: 700 },
                                            '&.Mui-selected:hover': { bgcolor: 'rgba(99, 102, 241, 0.35)' }
                                        }
                                    }
                                }}
                            >
                                {monthNames.map((month, index) => (
                                    <MenuItem
                                        key={month}
                                        selected={index === currentDate.getMonth()}
                                        onClick={() => handleMonthSelect(index)}
                                    >
                                        {month}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>

                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <Typography
                                variant="h4"
                                onClick={handleYearClick}
                                sx={{
                                    fontSize: { xs: '1.5rem', md: '2.125rem' },
                                    fontWeight: 800,
                                    color: 'var(--text-primary)',
                                    letterSpacing: '-0.5px',
                                    cursor: 'pointer',
                                    '&:hover': { color: 'var(--primary-light)' },
                                    transition: 'color 0.2s'
                                }}
                            >
                                {currentDate.getFullYear()}
                            </Typography>
                            <Menu
                                anchorEl={yearAnchorEl}
                                open={Boolean(yearAnchorEl)}
                                onClose={handleYearClose}
                                PaperProps={{
                                    sx: {
                                        bgcolor: 'var(--bg-card)',
                                        border: '1px solid var(--border-light)',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                        mt: 1,
                                        maxHeight: 300,
                                        '&::-webkit-scrollbar': {
                                            width: '6px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: 'rgba(255, 255, 255, 0.02)',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: 'rgba(148, 163, 184, 0.2)',
                                            borderRadius: '10px',
                                        },
                                        '&::-webkit-scrollbar-thumb:hover': {
                                            background: 'rgba(148, 163, 184, 0.4)',
                                        },
                                        '& .MuiMenuItem-root': {
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' },
                                            '&.Mui-selected': { bgcolor: 'rgba(99, 102, 241, 0.25)', color: 'var(--primary)', fontWeight: 700 },
                                            '&.Mui-selected:hover': { bgcolor: 'rgba(99, 102, 241, 0.35)' }
                                        }
                                    }
                                }}
                            >
                                {Array.from({ length: 20 }, (_, i) => 2020 + i).map(year => (
                                    <MenuItem
                                        key={year}
                                        selected={year === currentDate.getFullYear()}
                                        onClick={() => handleYearSelect(year)}
                                    >
                                        {year}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                            <IconButton size="small" onClick={handlePrevMonth} sx={{ color: 'var(--text-secondary)', '&:hover': { color: 'var(--text-secondary)' } }}>
                                <ChevronLeftIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={handleNextMonth} sx={{ color: 'var(--text-secondary)', '&:hover': { color: 'var(--text-secondary)' } }}>
                                <ChevronRightIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                    {(() => {
                        const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
                        const todayMeetingsCount = meetings.filter(m => m.date === todayStr).length;
                        return (
                            <Typography variant="body2" sx={{ color: 'var(--primary-light)', fontWeight: 600, mt: 0.5 }}>
                                {todayMeetingsCount === 0
                                    ? "You have no meetings today"
                                    : `You have ${todayMeetingsCount} meeting${todayMeetingsCount > 1 ? 's' : ''} today`}
                            </Typography>
                        );
                    })()}
                </Box>

            </Box>

            {/* Calendar Grid */}
            <Box sx={{
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                overflow: 'hidden',
                bgcolor: 'var(--bg-card)',
                backdropFilter: 'blur(10px)'
            }}>
                {/* Days Header */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-light)' }}>
                    {daysOfWeek.map((day, i) => (
                        <Box key={day} sx={{ py: 1.5, textAlign: 'center', borderRight: '1px solid var(--border-light)', '&:nth-of-type(7n)': { borderRight: 'none' } }}>
                            <Typography variant="caption" sx={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1 }}>
                                {day}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Grid Cells */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: { xs: 'minmax(70px, auto)', sm: 'minmax(100px, auto)' } }}>
                    {dates.map((item, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                p: { xs: 0.5, md: 1.5 },
                                borderRight: '1px solid var(--border-light)',
                                borderBottom: '1px solid var(--border-light)',
                                '&:nth-of-type(7n)': { borderRight: 'none' }, // Remove right border for last column
                                opacity: item.disabled ? 0.5 : 1,
                                bgcolor: item.active ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                border: item.active ? '1px solid var(--primary)' : '1px solid transparent',
                                position: 'relative',
                                transition: 'all 0.2s',
                                ...(item.active && { zIndex: 2, borderRadius: '8px' }),
                                '&:hover': !item.disabled && !item.active ? {
                                    bgcolor: 'rgba(255, 255, 255, 0.02)'
                                } : {}
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: item.active ? 'var(--text-primary)' : item.isToday ? 'var(--primary)' : 'var(--text-secondary)',
                                        fontWeight: item.active || item.isToday ? 800 : 500,
                                        width: '28px',
                                        height: '28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        bgcolor: item.isToday ? 'rgba(99, 102, 241, 0.15)' : 'transparent'
                                    }}
                                >
                                    {item.date}
                                </Typography>
                            </Box>

                            {item.events && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {item.events.map(ev => (
                                        <Box
                                            key={ev.id}
                                            onClick={(e) => handleEventClick(e, ev)}
                                            sx={{
                                                bgcolor: ev.color,
                                                borderLeft: `2px solid ${ev.border}`,
                                                borderRadius: '4px',
                                                p: 0.75,
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s',
                                                '&:hover': { transform: 'scale(1.02)', filter: 'brightness(1.1)' }
                                            }}
                                        >
                                            <Typography sx={{ color: ev.text, fontSize: '0.65rem', fontWeight: 700, lineHeight: 1.1 }}>
                                                {ev.time}
                                            </Typography>
                                            <Typography sx={{ color: ev.text, fontSize: '0.7rem', fontWeight: 600, lineHeight: 1.2, mt: 0.2 }}>
                                                {ev.title}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>
            </Box>

            <MeetingDetailsModal
                open={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                meeting={selectedMeeting}
                onEdit={onEdit}
                onAccept={onAccept}
                onReject={onReject}
            />
        </Box>
    );
}
