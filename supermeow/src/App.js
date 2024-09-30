import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; // Import the dark theme
import ChannelView from './components/ChannelView';
import UserProfile from './components/UserProfile';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<ChannelView />} />
          <Route path="/guild/:guildId/channel/:channelId" element={<ChannelView />} />
          <Route path="/guild/:guildId/users/:userId" element={<UserProfile />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
