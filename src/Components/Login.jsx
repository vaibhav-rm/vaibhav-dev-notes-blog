import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { login as authLogin } from '../Store/authSlice'
import { Button, Input, Logo } from './index'
import authService from '../appwrite/auth'
import { useForm } from 'react-hook-form'
import LoadingSpinner from './LoadingSpinner'
import Skeleton from './Skeleton'

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const login = async (data) => {
        setError("")
        setLoading(true)
        try {
            const session = await authService.login(data)
            if (session) {
                const userData = await authService.getCurrentUser()
                if (userData) dispatch(authLogin(userData));
                navigate('/')
            }
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full my-10">
                <div className="w-full max-w-lg">
                    <Skeleton className="h-12 w-32 mx-auto mb-4" />
                    <Skeleton className="h-8 w-3/4 mx-auto mb-6" />
                    <Skeleton className="h-12 w-full mb-4" />
                    <Skeleton className="h-12 w-full mb-4" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='flex items-center justify-center w-full my-10'
        >
            <motion.div 
                className="dark:bg-gray-700 transition-all duration-300 mx-auto w-full max-w-lg bg-white shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] rounded-xl p-10 border border-black/10"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <motion.div 
                    className="mb-2 flex justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                >
                    <span className="inline-block w-full max-w-[100px] font-bold text-2xl">
                        <Logo width="100%" />
                    </span>
                </motion.div>
                <motion.h2 
                    className="text-center text-2xl font-bold leading-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Sign in to your account
                </motion.h2>
                <motion.p 
                    className="mt-2 text-center dark:text-white text-base text-black/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Don&apos;t have any account?&nbsp;
                    <Link
                        to="/signup"
                        className="font-medium text-primary transition-all duration-200 hover:underline"
                    >
                        Sign Up
                    </Link>
                </motion.p>
                {error && (
                    <motion.p 
                        className='text-red-600 mt-8 text-center'
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {error}
                    </motion.p>
                )}

                <motion.form 
                    onSubmit={handleSubmit(login)} 
                    className='mt-8'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className='space-y-5'>
                        <Input
                            label='Email :'
                            type='email'
                            placeholder='Enter your email'
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                                    message: "Email address must be a valid address"
                                }
                            })}
                            error={errors.email?.message}
                        />

                        <Input
                            label='Password :'
                            type="password"
                            placeholder='Enter your password'
                            {...register('password', {
                                required: "Password is required"
                            })}
                            error={errors.password?.message}
                        />

                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                type="submit"
                                className='w-full'
                            >
                                Login
                            </Button>
                        </motion.div>
                    </div>
                </motion.form>
            </motion.div>
        </motion.div>
    )
}

export default Login