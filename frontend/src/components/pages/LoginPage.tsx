import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { LoginCredentials } from '../../types'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { cn, isValidEmail } from '../../utils/cn'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginCredentials>()

  const onSubmit = async (data: LoginCredentials) => {
    const result = await login(data)
    
    if (!result.success) {
      setError('root', {
        type: 'manual',
        message: result.error || 'Login failed',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo */}
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-neutral-600">
            Sign in to your Hospital Management System account
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Root error display */}
            {errors.root && (
              <div className="bg-error-50 border border-error-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-error-400" />
                  <div className="ml-3">
                    <p className="text-sm text-error-800">
                      {errors.root.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={cn(
                  'form-input',
                  errors.email && 'border-error-300 focus:border-error-500 focus:ring-error-500'
                )}
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  validate: (value) => isValidEmail(value) || 'Please enter a valid email address',
                })}
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={cn(
                    'form-input pr-10',
                    errors.password && 'border-error-300 focus:border-error-500 focus:ring-error-500'
                  )}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-500" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary justify-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 text-center mb-3">
              Demo Credentials (for testing):
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-neutral-50 p-2 rounded border">
                <p className="font-medium text-neutral-700">Admin</p>
                <p className="text-neutral-600">admin@hospital.com</p>
                <p className="text-neutral-600">admin123</p>
              </div>
              <div className="bg-neutral-50 p-2 rounded border">
                <p className="font-medium text-neutral-700">Doctor</p>
                <p className="text-neutral-600">doctor@hospital.com</p>
                <p className="text-neutral-600">doctor123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Hospital Management System v1.0
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Secure, reliable healthcare management
          </p>
        </div>
      </div>
    </div>
  )
}