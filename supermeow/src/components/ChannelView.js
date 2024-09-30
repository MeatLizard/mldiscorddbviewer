import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemText, Typography, Divider, AppBar, Toolbar, InputBase, IconButton, Button, Checkbox, FormControlLabel, Menu, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const drawerWidth = 240;

const ChannelView = () => {
  const { guildId, channelId } = useParams();
  const navigate = useNavigate();
  const [guilds, setGuilds] = useState([]);
  const [selectedGuild, setSelectedGuild] = useState(null);
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]); // Messages state
  const [filteredMessages, setFilteredMessages] = useState([]); // For search filtered messages
  const [users, setUsers] = useState([]); // Users state for the right sidebar
  const [hasMore, setHasMore] = useState(true); // For infinite scrolling
  const [page, setPage] = useState(1); // Pagination for messages
  const [searchTerm, setSearchTerm] = useState(''); // Search term
  const messageListRef = useRef(null); // Ref to keep track of the scroll position

  // Fetch guilds when component mounts
  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        const response = await axios.get('/api/guilds');
        setGuilds(response.data);
        if (guildId) {
          const selected = response.data.find(g => g.db_file === guildId);
          setSelectedGuild(selected);
        }
      } catch (error) {
        console.error('Error fetching guilds:', error);
      }
    };
    fetchGuilds();
  }, [guildId]);

  // Fetch channels when a guild is selected
  useEffect(() => {
    if (selectedGuild) {
      const fetchChannels = async () => {
        try {
          const response = await axios.get(`/api/guilds/${selectedGuild.db_file}/channels`);
          setChannels(response.data);
        } catch (error) {
          console.error('Error fetching channels:', error);
        }
      };
      fetchChannels();
    }
  }, [selectedGuild]);

  // Fetch users for the user sidebar
  const fetchUsers = async () => {
    if (selectedGuild) {
      try {
        const response = await axios.get(`/api/guilds/${selectedGuild.db_file}/users`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }
  };

  // Fetch users when a guild is selected
  useEffect(() => {
    fetchUsers();
  }, [selectedGuild]);

  // Fetch messages for the selected channel with pagination
  useEffect(() => {
    if (channelId) {
      const fetchMessages = async (shouldScrollToBottom = true) => {
        try {
          const response = await axios.get(`/api/guilds/${guildId}/channels/${channelId}?page=${page}`);
          const reversedMessages = response.data.reverse(); // Reverse message order
          
          if (page === 1) {
            setMessages(reversedMessages); // Load first page
            if (shouldScrollToBottom) {
              scrollToBottom(); // Scroll to the bottom initially
            }
          } else {
            setMessages((prevMessages) => [...reversedMessages, ...prevMessages]); // Prepend older messages
          }
          if (response.data.length === 0) {
            setHasMore(false); // No more messages to load
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
    }
  }, [channelId, page]);

  // Infinite scroll upwards function
  const loadMoreMessages = () => {
    const previousScrollHeight = messageListRef.current.scrollHeight;
    setPage((prevPage) => prevPage + 1); // Increment the page number to load older messages

    setTimeout(() => {
      // After loading older messages, adjust the scroll to maintain the previous position
      const currentScrollHeight = messageListRef.current.scrollHeight;
      messageListRef.current.scrollTop = currentScrollHeight - previousScrollHeight;
    }, 100); // Delay to wait for messages to render
  };

  // Scroll to bottom when messages are loaded
  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  // Detect when the user scrolls to the top (to load more messages)
  const handleScroll = () => {
    if (messageListRef.current.scrollTop === 0 && hasMore) {
      loadMoreMessages(); // Load more messages when scrolled to the top
    }
  };

  // Handle search input to filter messages
  useEffect(() => {
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filteredData = messages.filter((message) =>
        message.content.toLowerCase().includes(lowercasedFilter) ||
        message.user_name.toLowerCase().includes(lowercasedFilter)
      );
      setFilteredMessages(filteredData);
    } else {
      setFilteredMessages(messages); // Reset to all messages if no search term
    }
  }, [searchTerm, messages]);

  // Handle channel selection
  const handleChannelSelect = (channelName) => {
    navigate(`/guild/${selectedGuild.db_file}/channel/${channelName}`);
    setPage(1); // Reset the pagination when switching channels
    setHasMore(true);
  };

  // Handle user click to navigate to user profile
  const handleUserClick = (userId) => {
    navigate(`/guild/${guildId}/users/${userId}`);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Left sidebar for channels */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider />
        <List>
          {guilds.map((guild) => (
            <ListItem button key={guild.db_file} onClick={() => setSelectedGuild(guild)}>
              <ListItemText primary={guild.name} />
            </ListItem>
          ))}
          {channels.map((channel) => (
            <ListItem button key={channel.name} onClick={() => handleChannelSelect(channel.name)}>
              <ListItemText primary={channel.name} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main content area for messages */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, height: '80vh', overflowY: 'auto' }} // Ensure scrollable area
        onScroll={handleScroll}
        ref={messageListRef} // Ref for the message list to track scroll position
      >
        <Toolbar />
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Messages
            </Typography>

            {/* Search Bar */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <IconButton>
                <SearchIcon />
              </IconButton>
              <InputBase
                placeholder="Search Messages…"
                inputProps={{ 'aria-label': 'search' }}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Toolbar>
        </AppBar>

        <Box sx={{ mt: 2 }}>
          {filteredMessages.map((message, index) => (
            <Box key={index} sx={{ my: 2, p: 2, borderRadius: 1, bgcolor: 'grey.800', color: 'white' }}>
              <Typography variant="subtitle2">{message.user_name} - {new Date(message.timestamp).toLocaleString()}</Typography>
              <Typography variant="body1">{message.content}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right sidebar for users */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="right"
      >
        <Toolbar />
        <Divider />
        <List>
          {users
            .sort((a, b) => b.total_messages - a.total_messages) // Sort users by message count descending
            .map((user) => (
              <ListItem button key={user.user_id} onClick={() => handleUserClick(user.user_id)}>
                <ListItemText primary={`${user.user_name} (${user.total_messages})`} />
              </ListItem>
            ))}
        </List>
      </Drawer>
    </Box>
  );
};

export default ChannelView;
