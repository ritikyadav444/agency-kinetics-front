 import axios from 'axios';
import { baseURL, getConfig } from '../http';

// Helper function to get config with JWT token
  

  
export const fetchSubscriptionDetails = async (userId) => {
    const config = getConfig();
        try {    
            const response = await axios.get(`${baseURL}/api/v1/subscription/${userId}`, config);
            // console.log('detaaaaa', response)
            return response.data; // Return the subscription details
        } catch (error) {
            console.error("Error fetching subscription details:", error);
            throw new Error(error.response?.data?.message || "Error fetching subscription details");
        }
    };
