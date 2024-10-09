import React from 'react'
import {useDispatch} from 'react-redux'
import authService from '../../appwrite/auth'
import {logout} from '../../Store/authSlice'

function LogoutBtn() {
    
    const dispatch = useDispatch()

    const logoutHandler = () => {
        authService.logout().then(() => {
            dispatch(logout())
        }).catch((error) => ("Something went wrong::", error));
    } 

  return (
    <button 
    className='inline-block px-6 py-2 duration-200 hover:bg-white hover:text-black rounded-full'
    onClick={logoutHandler}
    >Logout</button>
  )
}

export default LogoutBtn