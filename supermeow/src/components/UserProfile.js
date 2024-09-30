import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

const UserProfile = () => {
  const { guildId, userId } = useParams(); // Fetch userId and guildId from the URL
  const [user, setUser] = useState(null); // Store user data
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`/api/guilds/${guildId}/users/${userId}`);
        setUser(response.data); // Set the fetched user data
        setLoading(false); // Stop loading
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false); // Stop loading even if there's an error
      }
    };
    fetchUserProfile();
  }, [guildId, userId]);

  if (loading) {
    // Show loading spinner while data is being fetched
    return <CircularProgress />;
  }

  if (!user) {
    return <Typography variant="h5">User not found</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">{user.user_name}'s Profile</Typography>
      <Typography variant="h6">Total Messages: {user.total_messages}</Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>Messages by Channel:</Typography>
      
      {user.channels && user.channels.length > 0 ? (
        user.channels.map((channel) => (
          <Typography key={channel.channel_id} variant="body1">
            {channel.channel_name}: {channel.message_count} messages
          </Typography>
        ))
      ) : (
        <Typography variant="body1">No messages available</Typography>
      )}
    </Box>
  );
};

export default UserProfile;
