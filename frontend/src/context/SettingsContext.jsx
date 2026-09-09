import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'Medium');
    const [appearance, setAppearance] = useState(localStorage.getItem('appearance') || 'Dark');

    useEffect(() => {
        localStorage.setItem('fontSize', fontSize);
        localStorage.setItem('appearance', appearance);
        
        // Apply font size class or style to body/html
        applyFontSize(fontSize);
        applyAppearance(appearance);
    }, [fontSize, appearance]);

    const applyFontSize = (size) => {
        switch(size) {
            case 'Small':
                document.body.style.zoom = '0.9';
                document.documentElement.style.setProperty('--app-zoom', '0.9');
                break;
            case 'Medium':
                document.body.style.zoom = '1.0';
                document.documentElement.style.setProperty('--app-zoom', '1.0');
                break;
            case 'Large':
                document.body.style.zoom = '1.1';
                document.documentElement.style.setProperty('--app-zoom', '1.1');
                break;
            default:
                document.body.style.zoom = '1.0';
                document.documentElement.style.setProperty('--app-zoom', '1.0');
        }
    };

    const applyAppearance = (mode) => {
        const root = document.documentElement;
        if (mode === 'Dark') {
            root.classList.remove('light');
            document.body.style.backgroundColor = 'var(--bg-root)';
        } else if (mode === 'Light') {
            root.classList.add('light');
            document.body.style.backgroundColor = 'var(--bg-root)'; // Keep base dark, CSS filter will invert to var(--text-primary)!
        } else {
            // System preference
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDark) {
                root.classList.remove('light');
                document.body.style.backgroundColor = 'var(--bg-root)';
            } else {
                root.classList.add('light');
                document.body.style.backgroundColor = 'var(--bg-root)';
            }
        }
    };

    const value = {
        fontSize,
        setFontSize,
        appearance,
        setAppearance
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
