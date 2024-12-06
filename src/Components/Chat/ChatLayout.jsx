import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import './ChatLayout.css';
import Chat from './Chat'; // For contact list
import Groupchat from '../GroupChat/Groupchat'; // For group list
import ChatView from './ChatView'; // For showing selected contact or group chat

const ChatLayout = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const location = useLocation();

  return (
    <div className="chat-layout">
      <div className="chat-content">
        {/* Main content area */}
        <Routes>
          <Route path="chats" element={<Chat setSelectedContact={setSelectedContact} />} />
          <Route path="groups" element={<Groupchat setSelectedGroup={setSelectedGroup} />} />
        </Routes>
      </div>

      <div className="chat-view">
        {/* Display chat view for selected contact or group */}
        {location.pathname.includes('chats') && !selectedContact && <div>Select a contact to chat</div>}
        {location.pathname.includes('groups') && !selectedGroup && <div>Select a group to chat</div>}
        <ChatView selectedContact={selectedContact} selectedGroup={selectedGroup} />
      </div>
    </div>
  );
};

export default ChatLayout;







