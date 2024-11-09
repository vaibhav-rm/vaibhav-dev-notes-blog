import React, { useState } from 'react'
import { motion } from 'framer-motion'
import authService from '../appwrite/auth'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../Store/authSlice'
import { Button, Input, Logo } from './index'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import LoadingSpinner from './LoadingSpinner'
import Skeleton from './Skeleton'

function SignUp() {
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const { register, handleSubmit, formState: { errors } } = useForm()

    const create = async (data) => {
        setError("");
        setLoading(true)
        try {
            const userData = await authService.createAccout(data)
            if (userData) {
                const currentUser = await authService.getCurrentUser()
                if (currentUser) dispatch(login(currentUser))
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
            <div className="flex items-center justify-center w-full my-20">
                <div className="w-full max-w-lg">
                    <Skeleton className="h-12 w-32 mx-auto mb-4" />
                    <Skeleton className="h-8 w-3/4 mx-auto mb-6" />
                    <Skeleton className="h-12 w-full mb-4" />
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
            className="flex items-center justify-center my-20"
        >
            <motion.div 
                className="dark:bg-gray-700 transition-all duration-300 mx-auto w-full max-w-lg bg-white rounded-xl p-10 border border-black/10 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]"
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
                    Sign up to create account
                </motion.h2>
                <motion.p 
                    className="mt-2 mb-5 text-center dark:text-white text-base text-black/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Already have an account?&nbsp;
                    <Link
                        to="/login"
                        className="font-medium text-primary transition-all duration-200 hover:underline"
                    >
                        Sign In
                    </Link>
                </motion.p>

                {error && (
                    <motion.p 
                        className='text-red-500 mt-8 text-center'
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {error}
                    </motion.p>
                )}

                <motion.form 
                    onSubmit={handleSubmit(create)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className='space-y-5'>
                        <Input
                            label="Full Name:"
                            placeholder="Enter your name"
                            {...register("name", {
                                required: "Name is required",
                            })}
                            error={errors.name?.message}
                        />

                        <Input
                            label="Email: "
                            placeholder="Enter your email"
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                                    message: "Email address must be a valid address",
                                }
                            })}
                            error={errors.email?.message}
                        />

                        <Input
                            label="Password"
                            placeholder="Enter your Password"
                            type="password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters long"
                                }
                            })}
                            error={errors.password?.message}
                        />

                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                type="submit"
                                className="w-full"
                            >
                                Create Account
                            </Button>
                        </motion.div>
                    </div>
                </motion.form>
            </motion.div>
        </motion.div>
    )
}

export default SignUp