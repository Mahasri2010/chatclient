import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import axios from 'axios';
import InputEmoji from 'react-input-emoji';
import menu from '../Images/menu.png';
import comment from '../Images/comment.png';
import grp from '../Images/grp.png';
import placeholder from '../Images/placeholder.png';
import setting from '../Images/setting.png';
import logout from '../Images/logout.png';

const Navbar = ({ setView }) => {
  const navigate = useNavigate();
  const authId = localStorage.getItem('authId');
  const profileId = localStorage.getItem('profileId')
  const [profileData, setProfileData] = useState({
    profilePicture: '',
    name: '',
    phone: '',
    about: '',
  });
  const [base64String, setBase64String] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);  // Add loading state

  // Fetch profile data for the specific user
  useEffect(() => {
    if (authId) {
      setIsLoading(true)
      axios.get(`http://127.0.0.1:4001/Profile/get/${authId}`)
        .then(response => {
          console.log(response.data, "Profile")
          console.log(response.data.profileId,"ID")
          localStorage.setItem(response.data.profileId,'profileId')
          setProfileData(response.data); // Set specific user's data
          setIsLoading(false); // Once data is fetched, set loading to false
        })
        .catch(error => console.error('Error fetching user profile:', error));
      setIsLoading(false);
    }
  }, [authId]);

  const handleMenuToggle = () => {
    setIsExpanded(prev => !prev);
  };

  const handleImageChanges = event => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setBase64String(base64);
      setProfileData(prevData => ({ ...prevData, profilePicture: base64 })); // Update image in profileData
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleShowModal = useCallback(() => setShowModal(true), []);
  const handleCloseModal = useCallback(() => setShowModal(false), []);

  const handleLogout = () => {
    const refresh_token = localStorage.getItem('refresh_token');

    axios.post('http://127.0.0.1:4001/Auth/logout/', { refresh_token })
      .then(response => {
        console.log(response.data.message);
      });

    axios.patch(`http://127.0.0.1:4001/Profile/status/${authId}`, { online: false, lastSeen: Date.now() })
      .then(response => {
        console.log(response.data.message);
      });

    localStorage.removeItem('authId');
    localStorage.removeItem('profileId')
    localStorage.removeItem('Bearer');
    localStorage.removeItem('refresh_token');
    navigate('/login');
    setView(false)
  };

  // const handleSubmit = async event => {
  //   event.preventDefault();
  //   try {
  //     await axios.post(`http://127.0.0.1:4001/Profile/update/${profileData._id}`, profileData);
  //     handleCloseModal();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleSubmit = async event => {
    event.preventDefault();
    try {
      // Only send the fields that need updating, excluding authId
      const updatedProfileData = {
        name: profileData.name,
        phone: profileData.phone,
        about: profileData.about,
        profilePicture: profileData.profilePicture, // Handle image if updated
      };

      // Send a PATCH request to update the profile, using only the updated fields
      await axios.patch(`http://127.0.0.1:4001/Profile/update/${authId}`, updatedProfileData);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Render the modal content only when profile data is available
  if (isLoading) {
    return <div>Loading...</div>;
  }


  return (
    <div className={`nav navbar-container d-flex flex-column justify-content-between align-items-center ${isExpanded ? 'expanded' : ''}`}>
      {/* Menu Icon */}
      <div className="navbar-top" onClick={handleMenuToggle}>
        <img src={menu} alt="Menu" className="navbar-menu-icon" />
      </div>

      {/* Nav Items */}
      <ul className="navbar-items list-unstyled">
        <li>
          <NavLink to="/app/chats" className='navbar-link'>
            <img src={comment} alt="Chats" className="navbar-icon" />
            {isExpanded && <span>Chats</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/app/groups" className='navbar-link'>
            <img src={grp} alt="Groups" className="navbar-icon" />
            {isExpanded && <span>Groups</span>}
          </NavLink>
        </li>
      </ul>

      {/* Settings and Logout */}
      <div className="settings-logout navbar-items">
        <NavLink to="/setting" className='navbar-link'>
          <img src={setting} alt="Settings" className="navbar-icon" />
          {isExpanded && <span>Settings</span>}
        </NavLink>
        <NavLink to='/' className='navbar-link' onClick={handleLogout}>
          <img src={logout} alt="Logout" className="navbar-icon" />
          {isExpanded && <span>Logout</span>}
        </NavLink>
      </div>

      {/* Profile Section */}
      <div style={{display:'flex'}}>
        <div className="profile-pic-container">
          <img
            src={profileData.profilePicture}
            alt="Profile"
            className="profile-pic"
            onClick={handleShowModal}
          />

        </div>
        {isExpanded && <span>Profile</span>}
      </div>


      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Profile Details</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="rounded circle image-upload-container text-center">
                    <img
                      src={profileData.profilePicture || placeholder}
                      alt="Profile"
                      className="profile-pic"
                    />
                  </div>

                  <div className='text-center' style={{ padding: '10px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={(event) => {
                        event.preventDefault();
                        document.getElementById('file-input').click();
                      }}>
                      Upload Profile
                    </button>
                    <input
                      type="file"
                      id="file-input"
                      accept="image/*"
                      onChange={handleImageChanges}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label>Name</label>
                    <InputEmoji
                      type="text"
                      className="form-control"
                      value={profileData.name}
                      onChange={name => setProfileData(prev => ({ ...prev, name }))}
                    />
                  </div>

                  <div className="mb-3">
                    <label>About</label>
                    <InputEmoji
                      type="text"
                      className="form-control"
                      value={profileData.about}
                      onChange={about => setProfileData(prev => ({ ...prev, about }))}
                    />
                  </div>

                  <div className="mb-3">
                    <label>Phone Number</label>
                    <input
                      type="number"
                      className="form-control"
                      value={profileData.phone}
                      onChange={e => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-success" onClick={handleSubmit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
