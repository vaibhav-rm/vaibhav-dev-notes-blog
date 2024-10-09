import React from 'react'
import {useState} from 'react'
import authService from '../appwrite/auth'
import {Link, useNavigate} from 'react-router-dom'
import {login} from '../Store/authSlice'
import {Button, Input, Logo} from './index'
import {useDispatch} from 'react-redux'
import {useForm} from 'react-hook-form'


function SignUp() {
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const dispatch = useDispatch()
    const {register, handleSubmit} = useForm()

    const create = async(data) => {
        setError("");
        try {
            const userData = await authService.createAccout(data)
            if(userData){
                await authService.getCurrentUser()
                if(userData) dispatch(login(userData))
                navigate('/')
            }
        } catch (error) {
            setError(error.message)
        }
    }
  return (
    <div className="flex items-center justify-center my-20 ">
            <div className={`mx-auto w-full max-w-lg bg-white rounded-xl p-10 border border-black/10 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]`}>
            <div className="mb-2 flex justify-center">
                    <span className="inline-block w-full max-w-[100px]">
                        <Logo width="100%" />
                    </span>
                </div>
                <h2 className="text-center text-2xl font-bold leading-tight">Sign up to create account</h2>
                <p className="mt-2 mb-5 text-center text-base text-black/60">
                    Already have an account?&nbsp;
                    <Link
                        to="/login"
                        className="font-medium text-primary transition-all duration-200 hover:underline"
                    >
                        Sign In
                    </Link>
                </p>

                {error && <p className='text-red-500 mt-8 text-center'>{error}</p>}

                <form onSubmit={handleSubmit(create)}>
                    <div className='space-y-5'>
                        <Input  
                        label = "Full Name:"
                        placeholder= "Enter your name"
                        {...register("name", {
                            required: true,
                        })}
                        />

                        <Input
                        label="Email: "
                        placeholder="Enter your email"
                        type="email"
                        {...register("email", {
                            required: true,
                            validate: {
                                matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                "Email address must be a valid address",
                            }
                        })}
                        />

                        <Input 
                        label ="Password"
                        placeholder= "Enter your Password"
                        {...register("password", {
                            required: true,
                        })}
                        />

                        <Button 
                        type= "submit"
                        className="w-full">
                            Create Account
                        </Button>
                    </div>
                </form>
            </div>
    </div>
    )
}

export default SignUp