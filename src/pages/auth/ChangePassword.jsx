import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { Lock, CheckCircle } from 'react-feather'
import { motion } from 'framer-motion'
import { changePasswordThunk, clearChangePasswordState } from '@/store/slices/authSlice'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { fadeInUp } from '@/animations'

const schema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your password'),
})

export default function ChangePassword() {
  const dispatch = useDispatch()
  const { changePasswordLoading, changePasswordError, changePasswordSuccess } = useSelector((s) => s.auth)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (changePasswordSuccess) {
      reset()
      setTimeout(() => dispatch(clearChangePasswordState()), 3000)
    }
  }, [changePasswordSuccess, reset, dispatch])

  useEffect(() => () => dispatch(clearChangePasswordState()), [dispatch])

  const onSubmit = (values) => {
    dispatch(changePasswordThunk({ currentPassword: values.currentPassword, newPassword: values.newPassword }))
  }

  return (
    <motion.div {...fadeInUp}>
      <PageHeader title="Change Password" subtitle="Update your admin account password" />

      {/* Full width on mobile, constrained on sm+ */}
      <div className="w-full sm:max-w-md">
        <Card>
          <CardHeader title="Password Settings" />
          <CardBody>
            {changePasswordSuccess ? (
              <div className="flex flex-col items-center gap-3 py-8 text-emerald-400">
                <CheckCircle size={40} />
                <p className="text-sm font-medium">Password changed successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Input
                  label="Current Password"
                  type="password"
                  leftIcon={Lock}
                  placeholder="Enter current password"
                  error={errors.currentPassword?.message}
                  disabled={changePasswordLoading}
                  autoComplete="current-password"
                  {...register('currentPassword')}
                />
                <Input
                  label="New Password"
                  type="password"
                  leftIcon={Lock}
                  placeholder="Enter new password"
                  error={errors.newPassword?.message}
                  disabled={changePasswordLoading}
                  autoComplete="new-password"
                  {...register('newPassword')}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  leftIcon={Lock}
                  placeholder="Confirm new password"
                  error={errors.confirmPassword?.message}
                  disabled={changePasswordLoading}
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />

                {changePasswordError && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    {changePasswordError.message || 'Failed to change password.'}
                  </p>
                )}

                <Button type="submit" fullWidth loading={changePasswordLoading}>
                  Update Password
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </motion.div>
  )
}
