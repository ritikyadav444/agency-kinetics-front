import React, { useEffect } from 'react'
import { clearErrors, getUserDetails } from '../../actions/userAction';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const UserDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user, error } = useSelector(state => state.userDetails);
// console.log(user)

    useEffect(() => {
      if(error){
       dispatch(clearErrors)
    }
    dispatch(getUserDetails(id));
  }, [dispatch, id, error]);
  return (
    <div>
          <p>{user.user_email}</p>

    </div>
  )
}

export default UserDetails