import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './Contact.css'
import InputEmoji from 'react-input-emoji';
import axios from 'axios';

const Contact = ({setView}) => {
    const navigate = useNavigate()

    const [con_name, setConName] = useState('')
    const [con_number, setConNumber] = useState('')
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('')
    const profileId = localStorage.getItem('profileId')

    const handleClose = event => {
        event.preventDefault()
        navigate('/app/chats/')

    }

    const Submit = event => {
        event.preventDefault()

        // clear previous message
        setSuccessMessage('')
        setErrorMessage('')

        if (!con_name || !con_number) {
            setErrorMessage('Name and phone number are required');
            return;
        }

        const authId = localStorage.getItem('authId')


        const data = {
            authId: authId,
            profileId:profileId,
            contact_name: con_name,
            contact_number: con_number
        }
        axios.post('http://127.0.0.1:4001/Contact/add/', data)
            .then(response => {
                console.log(response.data)

                setSuccessMessage('Contact saved  successfully!');
                setTimeout(() => {
                    navigate('/app/chats');
                    setView(true);
                }, 2000);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    // If there's an error response from the server, display it
                    setErrorMessage(error.response.data.message);
                } else {
                    setErrorMessage('An unexpected error occurred. Please try again.');
                }
            })
    }


    return (
        <div className='contact d-flex justify-content-center align-items-center vh-100'>
            <div className='card p-4 shadow picwid'>
                <div style={{ display: 'flex',justifyContent:"space-evenly" }}>
                    <h3 className='text-center'>New Contact</h3>
                    <button type="button" style={{padding:'10px',fontWeight:'bold'}} className="btn-close" onClick={handleClose} aria-label="Close"></button>
                </div>

                {/* Display success message if present */}
                {successMessage && <p className="success-message text-success text-center">{successMessage}</p>}

                {/* Display error message if present */}
                {errorMessage && <p className="error-message text-danger text-center">{errorMessage}</p>}

                <div className='mb-3'>
                    <label htmlFor="">Name</label>
                    <InputEmoji
                        type="text"
                        className='infield'
                        value={con_name}
                        placeholder='Enter your Name'
                        onChange={setConName}
                        required
                    />
                </div>

                <div className='mb-3'>
                    <label htmlFor="">Phone Number</label>
                    <input
                        type="number"
                        className='infield'
                        placeholder='+91 9876543210'
                        style={{ borderRadius: '50px' }}
                        value={con_number}
                        onChange={e => setConNumber(e.target.value)}
                    />
                </div>

                <button type='submit' className='btn btn-success' onClick={event => Submit(event)}>Save Contact</button>

            </div>
        </div>
    )
}

export default Contact