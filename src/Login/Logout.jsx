import React from 'react'
import { useDispatch } from 'react-redux'
import { logoutMember, setSidebarVisibility } from '../actions/loginAction'

const Logout = () => {
    const dispatch = useDispatch()
    dispatch(setSidebarVisibility(false));
    dispatch(logoutMember())
  return (
    <div>Logout</div>
  )
}

export default Logout