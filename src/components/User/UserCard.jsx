import React, { useEffect } from 'react'
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from "react-router-dom";
import { clearErrors, deleteUser } from '../../actions/userAction';
import { DELETE_USER_RESET } from '../../constants/userConstant';
const UserCard = ({user}) => {

const navigate = useNavigate();
const dispatch = useDispatch();


const {error} = useSelector(state=>state.users)
const {error : deleteError , isDeleted} = useSelector(state=>state.userDU)


const deleteUserHandler =(id)=>{
  dispatch(deleteUser(id));
}

  useEffect(() => {
if(error){
  dispatch(clearErrors())
}
if (deleteError){
  dispatch(clearErrors());
}
if(isDeleted){
  toast.success("User deleted Succeccfully")
 navigate("/users");
  dispatch({type:DELETE_USER_RESET}) 
}
  }, [dispatch, error, isDeleted, deleteError])
  return (
    <div>
    <Link className='userCard' to ={`/user/${user._id}`}>
       <p>{user.role}</p></Link>
        <p>{user.user_email}</p>
            {/* <button onClick={()=>
            deleteUserHandler(user._id)}>
              Delete 
            </button> */}
  <hr/>
    
    </div>
  )
}

export default UserCard