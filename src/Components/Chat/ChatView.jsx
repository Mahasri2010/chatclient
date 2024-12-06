import React, { useState, useEffect, useRef } from 'react';
import InputEmoji from 'react-input-emoji';
import axios from 'axios'; // Make sure axios is imported
import './ChatView.css';

const ChatView = ({ contact, authId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineStatus, setOnlineStatus] = useState('');
  const [chatId, setChatId] = useState(null);
  const messageContainerRef = useRef(null);
  const [isDropdownVisible,setIsDropdownVisible] = useState(false)

  useEffect(() => {
    if (contact && authId) {
      // Fetch or create chat and messages
      axios
        .get(`http://127.0.0.1:4001/Chat/allchat/${authId}`)
        .then((response) => {
          const existingChat = response.data.find((chat) =>
            chat.participants.includes(contact._id)
          );

          if (existingChat) {
            setChatId(existingChat._id);
            return axios.get(`http://127.0.0.1:4001/Message/specific/${existingChat._id}`);
          } else {
            return axios.post('http://127.0.0.1:4001/Chat/newchat', {
              senderId: authId,
              receiverId: contact._id,
            });
          }
        })
        .then((response) => {
          if (response.data._id) {
            setChatId(response.data._id);
          }

          if (response.data.messages) {
            setMessages(response.data.messages);
          } else {
            return axios.get(`http://127.0.0.1:4001/Message/specific/${chatId}`);
          }
        })
        .then((response) => {
          if (response?.data) {
            setMessages(response.data);
          }
        })
        .catch((error) => console.error('Error fetching or creating chat:', error));

      // Update online status
      setOnlineStatus(contact.online ? 'Online' : `Last seen at ${contact.lastSeen}`);
    }
  }, [contact, authId]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      chatId,
      senderId: authId,
      content: newMessage,
    };

    axios
      .post('http://127.0.0.1:4001/Message/send', messageData)
      .then((response) => {
        setMessages([...messages, response.data]);
        setNewMessage('');
      })
      .catch((error) => console.error('Error sending message:', error));
  };

  const markMessagesAsRead = () => {
    const unreadMessages = messages.filter((msg) => msg.status === 'delivered');
    unreadMessages.forEach((msg) => {
      axios
        .patch(`http://127.0.0.1:4001/Message/status/${msg._id}`, { status: 'read' })
        .then((response) => {
          setMessages((prevMessages) =>
            prevMessages.map((m) =>
              m._id === response.data._id ? { ...m, status: response.data.status } : m
            )
          );
        })
        .catch((error) => console.error('Error updating message status:', error));
    });
  };

  useEffect(() => {
    markMessagesAsRead();
  }, [messages]);

  const renderStatus = (status) => {
    if (status === 'sent') {
      return <span className="message-status">✓</span>;
    } else if (status === 'delivered') {
      return <span className="message-status">✓✓</span>;
    } else if (status === 'read') {
      return <span className="message-status">✓✓ (seen)</span>;
    }
    return null;
  };

  const handleViewContact = () => {
    // Show contact details (e.g., open a modal)
    console.log('View Contact clicked');
    alert(`Contact Name: ${contact.name}\nLast Seen: ${contact.lastSeen}`);
  };

  const handleEditContact = () => {
    console.log('Edit Contact clicked')
  }
  
  const handleClearChat = () => {
    // Clear chat messages
    if (window.confirm('Are you sure you want to clear this chat?')) {
      axios.delete(`http://127.0.0.1:4001/Chat/clear/${chatId}`)
        .then(() => {
          setMessages([]); // Clear messages in the UI
          console.log('Chat cleared successfully');
        })
        .catch((error) => {
          console.error('Error clearing chat:', error);
        });
    }
  };
  
  const handleBlockUser = () => {
    // Block the user
    if (window.confirm(`Are you sure you want to block ${contact.name}?`)) {
      axios.post('http://127.0.0.1:4001/Contact/block', { contactId: contact._id })
        .then(() => {
          console.log('User blocked successfully');
          alert(`${contact.name} has been blocked.`);
        })
        .catch((error) => {
          console.error('Error blocking user:', error);
        });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.three-dot-menu-container')) {
        setIsDropdownVisible(false);
      }
    };
  
    document.addEventListener('click', handleClickOutside);
  
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  
  
  

  return (
    <div className="chat-view">
      {contact ? (
        <>
          <div className="chat-header">
            <img src={contact.profilePicture} alt="Profile" className="profile-pic" />
            <div>
              <span className="contact-name">{contact.name}</span>
              <span className="online-status">{onlineStatus}</span>
            </div>
            <div className="three-dot-menu-container">
              <button className="three-dot-menu" onClick={toggleDropdown}>⋮</button>
              {isDropdownVisible && (
                <div className="dropdown-menu">
                  <ul>
                    <li onClick={handleViewContact}>View Contact</li>
                    <li onClick={handleEditContact}>Edit Contact</li>
                    <li onClick={handleClearChat}>Clear Chat</li>
                    <li onClick={handleBlockUser}>Block User</li>
                  </ul>
                </div>
              )}
            </div>

          </div>

          <div className="messages" ref={messageContainerRef}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === authId ? 'sent' : 'received'}`}
              >
                <span>{msg.content}</span>
                <span className="timestamp">{new Date(msg.timestamp).toLocaleString()}</span>
                {renderStatus(msg.status)}
              </div>
            ))}
          </div>

          <div className="message-input">
            <button className="attach-btn">📎</button>
            <InputEmoji
              value={newMessage}
              onChange={setNewMessage}
              placeholder="Type a message..."
            />
            <button className="send-btn" onClick={handleSendMessage}>
              Send
            </button>
          </div>
        </>
      ) : (
        <p>Select a contact to start chatting</p>
      )}
    </div>
  );
};

export default ChatView;
