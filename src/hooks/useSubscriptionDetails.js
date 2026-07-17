import { useState, useEffect } from 'react';
import { fetchSubscriptionDetails } from "../actions/subscriptionAction.jsx";

const useSubscriptionDetails = (userId) => {
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const getSubscription = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const details = await fetchSubscriptionDetails(userId);
        const sub = details?.subscription;
        setSubscriptionDetails(sub);

        const hasValidPlan = sub?.plans?.some(plan =>
          plan.status === 'active' || plan.status === 'trial' || plan.status === 'future'
        );

        setIsExpired(!hasValidPlan);
      } catch (err) {
        console.error("Failed to fetch subscription details:", err.message);
        setError(err);
        setIsExpired(true); 
      } finally {
        setIsLoading(false);
      }
    };

    getSubscription();
  }, [userId]);

  return { subscriptionDetails, isLoading, error, isExpired };
};

export default useSubscriptionDetails;
