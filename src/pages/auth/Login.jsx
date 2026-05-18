import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Zap } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'
import { loginThunk, clearAuthError } from '@/store/slices/authSlice'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { staggerContainer, staggerItem } from '@/animations'

const schema = yup.object({
  userName: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
})

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error, user } = useSelector((s) => s.auth)
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (user?.accessToken) navigate(from, { replace: true })
  }, [user, navigate, from])

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = (values) => dispatch(loginThunk(values))

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-5 w-full px-2 sm:px-0"
    >
      {/* Logo */}
      <motion.div variants={staggerItem} className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-bw-gradient shadow-bw-lg mb-4">
          <span className="text-white font-black text-2xl select-none">BW</span>
        </div>
        <h1 className="text-2xl font-bold text-bw-text">Welcome back</h1>
        <p className="text-bw-muted text-sm mt-1">Sign in to your admin account</p>
      </motion.div>

      {/* Card */}
      <motion.div variants={staggerItem} className="glass-panel p-5 sm:p-6 space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Username"
            placeholder="Enter your username"
            leftIcon={Mail}
            error={errors.userName?.message}
            disabled={loading}
            autoComplete="username"
            {...register('userName')}
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            leftIcon={Lock}
            rightIcon={showPassword ? EyeOff : Eye}
            onRightIconClick={() => setShowPassword((v) => !v)}
            error={errors.password?.message}
            disabled={loading}
            autoComplete="current-password"
            {...register('password')}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              <Zap size={14} className="flex-shrink-0" />
              {error.message || 'Login failed. Please try again.'}
            </motion.div>
          )}

          <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </motion.div>

      <motion.p variants={staggerItem} className="text-center text-xs text-bw-muted">
        BigWhale Admin Panel &copy; {new Date().getFullYear()}
      </motion.p>
    </motion.div>
  )
}
