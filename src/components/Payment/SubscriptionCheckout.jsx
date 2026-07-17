import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchSubscriptionDetails } from '../../actions/subscriptionAction';
import { baseURL } from '../../http';
import SubscriptionDetails from './SubscriptionDetails';
import PaymentInvoices from './PaymentandInvoicesDetails';
import { getTeams } from '../../actions/teamAction';



const SubscriptionCheckout = () => {
    const dispatch = useDispatch();
    const [subscriptionDetails, setSubscriptionDetails] = useState(null);
    const {combined:teams} = useSelector((state)=>state.teams)
    const numberOfMembers = (teams?.length || 1) - 1
    const combined = useSelector((state) => state.logMember.combined);
    const location = useLocation();

   
    // Check if the variable was passed
    useEffect(() => {
        dispatch(getTeams());
    }, [dispatch]);

    useEffect(() => {
        if (location.state?.subscriptionUpdated) {
            // Use the passed subscription details directly
            setSubscriptionDetails(location.state.subscriptionUpdated);
        } else {
            // Fallback to fetch the details
            const getSubscription = async () => {
                if (combined?.user?._id) {
                    try {
                        const details = await fetchSubscriptionDetails(combined.user._id);
                        setSubscriptionDetails(details);
                    } catch (error) {
                        console.error("Failed to fetch subscription details:", error.message);
                    }
                }
            };

            getSubscription();
        }
    }, [location.state, combined?.user?._id]);

    const [billingCycle, setBillingCycle] = useState('Monthly');
    const [selectedPlan, setSelectedPlan] = useState(null);

    const pricingDetails = {
        'Monthly': [
            { price: 9, maxTeamMembers: 3 },
            { price: 39, maxTeamMembers: 10 },
            { price: 119, maxTeamMembers: 25 }
        ],
       'Yearly': [
            { price: 6, maxTeamMembers: 3 },
            { price: 29, maxTeamMembers: 10 },
            { price: 99, maxTeamMembers: 25 }
        ]
    };

    const handlePlanSelect = (index) => {
        setSelectedPlan(index);
    };

    const handlePayment = async () => {
        if (selectedPlan !== null) {
            const response = await fetch(`${baseURL}/api/v1/activate-plan`, {
                method: 'POST',
                credentials: 'include',

                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    playRecursion: billingCycle,
                    selectedPlanIndex: selectedPlan,
                }),
            });
            
            const data = await response.json();
            if (data.success && data.url) {
                window.location.href = data.url; // Redirect to Stripe checkout
            } else {
                alert('Failed to initiate payment');
            }
        } else {
            alert('Please select a plan');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            {/* Current Subscription Section */}
            <SubscriptionDetails subscriptionDetails={subscriptionDetails} numberOfMembers={numberOfMembers}/>

            
            {/* Subscription Plans Section */}  
            <section style={{ margin: '0 auto 3rem auto', maxWidth: '900px', textAlign: 'left' }}>
                <h2 style={{ marginTop: '1.5rem', fontSize: '2rem', fontWeight: '700', color: '#333' }}>
                    Subscription Plans
                </h2>

                {/* Billing Cycle Toggle */}
                <div style={{ marginBottom: '2rem', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
                    <button
                        style={{
                            marginRight: '10px',
                            padding: '10px 20px',
                            backgroundColor: billingCycle === 'Monthly' ? 'rgb(127, 86, 217)' : '#ffffff',
                            color: billingCycle === 'Monthly' ? '#ffffff' : 'rgb(127, 86, 217)',
                            border: '1px solid rgb(127, 86, 217)',
                            borderRadius: '5px',
                        }}
                        onClick={() => setBillingCycle('Monthly')}
                    >
                        Monthly
                    </button>
                    <button
                        style={{
                            padding: '10px 20px',
                            backgroundColor: billingCycle === 'Yearly' ? 'rgb(127, 86, 217)' : '#ffffff',
                            color: billingCycle === 'Yearly' ? '#ffffff' : 'rgb(127, 86, 217)',
                            border: '1px solid rgb(127, 86, 217)',
                            borderRadius: '5px',
                        }}
                        onClick={() => setBillingCycle('Yearly')}
                    >
                        Yearly
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    {pricingDetails[billingCycle].map((plan, index) => (
                        <div
                            key={index}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '10px',
                                padding: '1.5rem',
                                width: '250px',
                                textAlign: 'left',
                                transition: 'box-shadow 0.3s ease',
                                boxShadow: selectedPlan === index ? '0 4px 10px rgba(0, 0, 0, 0.1)' : '',
                            }}
                            onClick={() => handlePlanSelect(index)}
                        >
                            <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>
                                {index === 0 ? 'Essential' : index === 1 ? 'Professional' : 'Elite'}
                            </h2>
                            <h3 style={{ color: '#333', marginBottom: '1rem' }}>${plan.price}/month</h3>
                            <ul style={{ listStyleType: 'none', padding: '0', margin: '0 0 1.5rem' }}>
                                <li style={{ padding: '0.5rem 0' }}>Up to {plan.maxTeamMembers} team members</li>
                                <li style={{ padding: '0.5rem 0' }}>Unlimited clients</li>
                                <li style={{ padding: '0.5rem 0' }}>Unlimited orders</li>
                                <li style={{ padding: '0.5rem 0' }}>Task Management</li>
                                <li style={{ padding: '0.5rem 0' }}>Single Workspace</li>
                                <li style={{ padding: '0.5rem 0' }}>Invoicing & Payment</li>
                                <li style={{ padding: '0.5rem 0' }}>Support</li>
                            </ul>
                            <button
                                style={{
                                    backgroundColor: selectedPlan === index ? 'rgb(127, 86, 217)' : '#ffffff',
                                    color: selectedPlan === index ? '#ffffff' : 'rgb(127, 86, 217)',
                                    border: '2px solid rgb(127, 86, 217)',
                                    padding: '10px 20px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                }}
                            >
                                {selectedPlan === index ? 'Selected' : 'Select Plan'}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Checkout Button */}
             <div style={{ marginTop: '2rem', alignItems:'center', display:'flex', justifyContent:'center' }}>
                 <button
                    style={{
                        padding: '15px 30px',
                        fontSize: '1.2rem',
                        backgroundColor: 'rgb(127, 86, 217)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                    onClick={handlePayment}
                >
                    Proceed to Payment
                </button>
            </div>

        </div>
    );
    
    
};

export default SubscriptionCheckout;
