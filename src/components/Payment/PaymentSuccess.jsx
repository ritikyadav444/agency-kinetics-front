import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { baseURL } from '../../http';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const combined = useSelector((state) => state.logMember.combined);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            const params = new URLSearchParams(window.location.search);
            const sessionId = params.get('session_id');

            if (!sessionId) {
                alert('Session ID is missing');
                return;
            }

            try {
                const response = await fetch(`${baseURL}/api/v1/success?session_id=${sessionId}`, {
                    method: 'GET',
                    credentials: 'include',

                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                const data = await response.json();

                if (data.success) {
                    const updatedSubscriptionDetails = data.subscription;

                    // Create a notification and fetch notifications after creation
                    const notificationMessage = `Your new ${data.subscription.plans[data.subscription.plans.length - 1].type} plan is activated`

                    await dispatch(
                        createNotification(
                            combined.user._id,
                            notificationMessage
                        )
                    );
                    dispatch(getAllNotifications(combined.user._id));

                    // Redirect to dashboard with updated subscription and snackbar
                    navigate("/dashboard", {
                        state: {
                            subscriptionUpdated: updatedSubscriptionDetails,
                            snackbar: {
                                message: notificationMessage,
                                severity: "success",
                            },
                        },
                    });
                } else {
                    alert('Failed to process payment: ' + data.message);
                }
            } catch (error) {
                console.error('Error processing payment:', error.message);
                alert('An error occurred while processing your payment.');
            }
        };

        fetchPaymentDetails();
    }, [dispatch, combined, navigate]);

    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>Processing Payment...</h1>
            <p>Please wait while we confirm your payment.</p>
        </div>
    );
};

export default PaymentSuccess;
