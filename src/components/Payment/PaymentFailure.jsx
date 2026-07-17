import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailure = () => {
    const navigate = useNavigate()
    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>Payment Failed</h1>
            <p>Unfortunately, your payment was not successful. Please try again.</p>
            <button
                style={{
                    padding: '15px 30px',
                    fontSize: '1.2rem',
                    backgroundColor: '#007bff',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '1rem'
                }}
                onClick={() => navigate('/subscription-plan') } // Redirect to home or a relevant page
            >
                Try Again
            </button>
        </div>
    );
};

export default PaymentFailure;
