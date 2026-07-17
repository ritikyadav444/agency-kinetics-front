import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      
      <h1>Welcome to Your App</h1>
      <p>Explore our services and features!</p>

      <div>
        {/* <Link to="/combined/newUser"> */}
        <Link to="/signup">
          <button>Sign Up</button>
        </Link>
        {/* <Link to="/combined/login"> */}
        <Link to="/login">
          <button>Login</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
