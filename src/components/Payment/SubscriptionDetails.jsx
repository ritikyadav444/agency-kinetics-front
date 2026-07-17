import React from 'react';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';

const SubscriptionDetails = ({ subscriptionDetails, numberOfMembers }) => {
  const plans = subscriptionDetails?.subscription?.plans || [];
  const isTrialExpired = plans[0]?.status === 'expire';

  const activePlans = plans.slice(1).filter((plan) => plan.status === 'active');

  if (!plans.length) {
    return (
      <section style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#333' }}>Current Subscriptions</h2>
        <p style={{ marginTop: '2rem', color: '#888' }}>Loading your subscription details...</p>
      </section>
    );
  }

  return (
    <section style={{ margin: '0 auto 3rem auto', maxWidth: '900px', textAlign: 'left' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#333' }}>Current Subscriptions</h2>
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          marginTop: '1.5rem',
        }}
      >
        {isTrialExpired && activePlans.length > 0 ? (
          activePlans.map((plan, index) => (
            <div
              key={index}
              style={{
                minWidth: '300px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '1.5rem',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                flex: '0 0 auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#333' }}>
                  {plan.type} Plan
                </h3>
                <div
                  style={{
                    backgroundColor: '#daf5d8',
                    color: '#4caf50',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '30px',
                    display: 'inline-block',
                    marginLeft: 'auto',
                    marginTop: '-10px',
                  }}
                >
                  Current
                </div>
              </div>

              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#333', marginTop: '0.5rem' }}>
                ${plan.price} <span style={{ fontSize: '1rem', fontWeight: '400', color: '#888' }}>/ month</span>
              </p>

              <p style={{ fontSize: '1rem', color: '#555', marginTop: '0.5rem', display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} />
                Active until <strong style={{ marginLeft: '0.5rem' }}>{new Date(plan.expireOn).toLocaleDateString()}</strong>
              </p>

              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>Team Members</p>
                <div
                  style={{
                    height: '10px',
                    backgroundColor: '#ddd',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    margin: '0.5rem 0',
                  }}
                >
                  <div
                    style={{
                      width: `${(numberOfMembers / plan.maxTeamMembers) * 100}%`,
                      backgroundColor: '#4caf50',
                      height: '100%',
                    }}
                  ></div>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#555' }}>
                  {numberOfMembers} of {plan.maxTeamMembers} used
                </p>
              </div>
            </div>
          ))
        ) : isTrialExpired ? (
          <div
            style={{
              width: '100%',
              backgroundColor: '#f4f8f9',
              borderRadius: '10px',
              padding: '2rem',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              marginTop: '1.5rem',
            }}
          >
            <h3 style={{ fontSize: '1.3rem', color: 'rgb(127, 86, 217)', marginBottom: '1rem' }}>
              Free Trial Completed
            </h3>
            <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '1rem', lineHeight: '1.5' }}>
              Your free trial period has ended. Please subscribe to continue enjoying our services.
            </p>
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              backgroundColor: '#f4f8f9',
              borderRadius: '10px',
              padding: '2rem',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              marginTop: '1.5rem',
            }}
          >
            <h3 style={{ fontSize: '1.3rem', color: 'rgb(127, 86, 217)', marginBottom: '1rem' }}>
              Free Trial
            </h3>
            <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '1rem', lineHeight: '1.5' }}>
              You are currently on a Free Trial with{' '}
              <strong style={{ fontWeight: '700' }}>{plans[0]?.days || 0} days</strong> left.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SubscriptionDetails;
