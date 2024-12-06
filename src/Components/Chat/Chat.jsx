import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './chat.css';
import useradd from '../Images/useradd.png';
import placeholder from '../Images/placeholder.png'


const Chat = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const authId = localStorage.getItem('authId');

  // Fetch contacts from the backend when the component mounts
  useEffect(() => {
    // const authId = localStorage.getItem('authId'); // Retrieve userId from local storage

    if (authId) {
      axios.get(`http://127.0.0.1:4001/Contact/contacts/${authId}`)
        .then(response => {
          console.log(response.data, "Contacts")
          setContacts(response.data)
        })
        .catch(error => console.error('Error fetching contacts:', error));
    }
  }, []);

  // Ensure contacts is an array before calling filter
  const filteredContacts = Array.isArray(contacts) ? contacts.filter(contact =>
    contact.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleStartChat = (contactId) => {
    axios.patch(`http://127.0.0.1:4001/Contact/accept/${contactId}`)
      .then(response => {
        const updatedContact = contacts.find(c => c._id === contactId);
        if (updatedContact) onSelectContact(updatedContact,authId);
      })
      .catch(error => console.error('Error starting chat:', error));
  };




  return (
    <div className="chatlist-container" style={{ marginLeft: '75px', padding: '10px' }}>
      <h2>Chats</h2>

      {/* Search bar and add contact/group icons */}
      <div className="chatlist-header d-flex justify-content-between align-items-center">
        <input
          type="text"
          className="search-bar"
          placeholder="Search Contacts"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Link to="/contact">
          <img src={useradd} alt="Add Contact" className="add-contact-icon" style={{ width: '22px', height: '22px', filter: 'invert(100%)' }} />
        </Link>
      </div>

      {/* Contact List */}
      <div className="contact-list">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div
              key={contact._id}
              className="contact-item"
              // onClick={() => onSelectContact(contact)}
              onClick={(e) => {
                e.stopPropagation();
                if (contact.isRegistered) {
                  onSelectContact(contact._id)
                }
              }} //only select registered contacts
              style={{ display: 'flex', padding: '10px', borderBottom: '1px solid #ddd', cursor: 'pointer' }}
            >
              {/* Profile Picture in a Rounded Circle */}
              <img
                src={contact.profilePicture || placeholder}
                alt={`${contact.contact_name}'s profile`}
                className="profile-picture rounded-circle"
                style={{ width: '50px', height: '50px', marginRight: '15px' }}
              />

              {/* Contact Details */}
              <div className="contact-details" style={{ flex: 1 }}>
                {/* <h4 className="contact-name" style={{ margin: '0 0 5px 0' }}>{contact.contact_name}</h4>
                <p className="last-message" style={{ margin: 0, color: '#888' }}>{contact.lastMessage || 'No messages yet'}</p> */}

                <h4 className="contact-name" style={{ margin: '0 0 5px 0' }} >{contact.contact_name}</h4>

                {/* Conditional Rendering for Last Message, Invite Button, or No Messages */}
                {contact.isRegistered ? (
                  contact.lastMessage ? (
                    <p className="last-message" style={{ margin: 0, color: '#888' }} >{contact.lastMessage}</p>
                  ) : (
                    <button
                      className="start-chat-button"
                      onClick={(e) => { e.stopPropagation(); handleStartChat(contact._id) }}
                      style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                    >
                      Start Chat
                    </button>
                  )
                ) : (
                  <button className="invite-button">Invite</button>
                )}

              </div>
            </div>
          ))
        ) : (
          <p>No contacts found</p>
        )}
      </div>

      {/* Contact list */}
      {/* <div className="chatlist-content">
        <ul className="list-unstyled">
          {filteredContacts.map((contact) => (
            <li
              key={contact.id}
              className="chat-item"
              onClick={() => onSelectContact(contact)} // Pass selected contact to parent
            >
              {contact.name}
            </li>
          ))}
        </ul>
      </div> */}
    </div>
  );
};

export default Chat;

