import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const GuildView = () => {
  const [guilds, setGuilds] = useState([]); // State for storing guilds
  const [selectedGuild, setSelectedGuild] = useState(null); // State for selected guild
  const [channels, setChannels] = useState([]); // State for channels of selected guild

  // Fetch the list of guilds from the backend when the component mounts
  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        const response = await axios.get('/api/guilds');
        setGuilds(response.data);
      } catch (error) {
        console.error('Error fetching guilds:', error);
      }
    };

    fetchGuilds();
  }, []);

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

  return (
    <div className="flex h-screen">
      {/* Guild Dropdown */}
      <div className="w-1/4 bg-gray-900 text-white">
        <h1 className="text-xl p-4">Select a Guild</h1>
        <select
          className="bg-gray-700 text-white p-2 m-4"
          onChange={(e) => {
            const selected = guilds.find(g => g.db_file === e.target.value);
            setSelectedGuild(selected);
          }}
          value={selectedGuild ? selectedGuild.db_file : ''}
        >
          <option value="" disabled>Select a Guild</option>
          {guilds.map(guild => (
            <option key={guild.db_file} value={guild.db_file}>
              {guild.name}
            </option>
          ))}
        </select>

        {/* Channels List */}
        <ul>
          {channels.map(channel => (
            <li key={channel.name} className="p-2">
              <Link
                to={`/guild/${selectedGuild.db_file}/channel/${channel.name}`}
                className="text-blue-400 hover:underline"
              >
                {channel.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Placeholder */}
      <div className="flex-1 bg-gray-800 text-white flex items-center justify-center">
        <h2 className="text-3xl">Select a guild and channel</h2>
      </div>
    </div>
  );
};

export default GuildView;
