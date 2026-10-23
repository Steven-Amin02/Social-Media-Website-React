import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Globe2,
  Heart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router'
import { authApi } from '../../shared/api/services'
import { Brand, Button, FormError } from '../ui'
import { useAuth } from '../../features/auth/auth-state'
import { loginSchema, registerSchema } from '../../features/auth/schemas'

export function AuthPage({ register = false }: { register?: boolean }) {
  const { user, initializing } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/'
  if (user && !initializing)
    return (
      <Navigate
        to={from.startsWith('/') && !from.startsWith('//') ? from : '/'}
        replace
      />
    )
  return (
    <div className="auth-page">
      <div className="auth-top">
        <Brand />
        <span>A little closer, every day.</span>
      </div>
      <main className="auth-main">
        <section className="auth-story">
          <span className="eyebrow">
            <span className="status-dot" /> YOUR PEOPLE. YOUR PLACE.
          </span>
          <h1>
            Life’s better
            <br />
            when you’re
            <br />
            <span>connected.</span>
            <span className="headline-spark">✳</span>
          </h1>
          <p className="auth-description">
            The little moments. The big ideas. The people who get you.
            <br className="desktop-break" /> Find your community and make
            yourself at home.
          </p>
          <div className="connection-art" aria-hidden="true">
            <div className="art-grid" />
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <span className="art-circle circle-one">AM</span>
            <span className="art-circle circle-two">JL</span>
            <span className="art-circle circle-three">SK</span>
            <span className="floating-icon heart">
              <Heart size={22} fill="currentColor" />
            </span>
            <span className="floating-icon chat">
              <MessageCircle size={22} />
            </span>
            <div className="art-note">
              <span className="art-note-icon">
                <Users size={21} />
              </span>
              <div>
                <strong>Good things start with a hello.</strong>
                <span>Your next connection is waiting.</span>
              </div>
              <span className="art-note-check">
                <Check size={14} />
              </span>
            </div>
          </div>
          <div className="auth-benefits">
            <span>
              <Globe2 size={16} /> Discover new perspectives
            </span>
            <span>
              <Heart size={16} /> Share what matters
            </span>
          </div>
        </section>
        <section className="auth-form-side">
          <div className="auth-card">
            <span className="welcome-icon">
              <Sparkles size={23} />
            </span>
            <h2>{register ? 'Find your people.' : 'Welcome back.'}</h2>
            <p className="auth-subtitle">
              {register
                ? 'A new connection starts right here.'
                : 'Your community has missed you. Let’s catch up.'}
            </p>
            {register ? <RegisterForm /> : <LoginForm />}
            <p className="auth-switch">
              {register ? 'Already part of the community?' : 'New around here?'}{' '}
              <Link
                to={register ? '/login' : '/register'}
                state={location.state}
              >
                {register ? 'Log in' : 'Create an account'}{' '}
                <ArrowRight size={13} />
              </Link>
            </p>
          </div>
          <p className="auth-trust">
            <ShieldCheck size={15} /> Your space to connect, share, and belong.
          </p>
        </section>
      </main>
      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} Route Social</span>
        <span>
          Made for real connections <span className="small-heart">♡</span>
        </span>
        <span>A Route Academy learning project</span>
      </footer>
    </div>
  )
}

export function PasswordInput({
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="password-input">
      <input {...props} id={id} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        aria-label={visible ? 'Hide password' : 'Show password'}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
}

function LoginForm() {
  const { authenticate } = useAuth()
  const [error, setError] = useState<unknown>()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  })
  return (
    <form
      className="form-stack"
      onSubmit={handleSubmit(async (values) => {
        setError(undefined)
        try {
          authenticate((await authApi.login(values)).data)
        } catch (error) {
          setError(error)
        }
      })}
      noValidate
    >
      <div className="field">
        <label htmlFor="login">Email or username</label>
        <input
          id="login"
          autoComplete="username"
          placeholder="you@example.com"
          {...register('login')}
          aria-invalid={!!errors.login}
          aria-describedby={errors.login ? 'login-error' : undefined}
        />
        {errors.login && (
          <span id="login-error" className="field-error">
            {errors.login.message}
          </span>
        )}
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          {...register('password')}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <span className="field-error">{errors.password.message}</span>
        )}
      </div>
      <FormError error={error} />
      <Button type="submit" className="auth-submit" busy={isSubmitting}>
        Log in <ArrowRight size={17} />
      </Button>
      <div className="session-note">
        <ShieldCheck size={13} /> You’ll stay signed in for this browser
        session.
      </div>
    </form>
  )
}

function RegisterForm() {
  const { authenticate } = useAuth()
  const [error, setError] = useState<unknown>()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  })
  return (
    <form
      className="form-stack register-form"
      onSubmit={handleSubmit(async (values) => {
        setError(undefined)
        try {
          authenticate((await authApi.register(values)).data)
        } catch (error) {
          setError(error)
        }
      })}
      noValidate
    >
      <div className="form-grid">
        {(['name', 'username'] as const).map((key) => (
          <div className="field" key={key}>
            <label htmlFor={key}>
              {key === 'name' ? 'Full name' : 'Username'}
            </label>
            <input
              id={key}
              autoComplete={key === 'name' ? 'name' : 'username'}
              placeholder={key === 'name' ? 'Alex Morgan' : 'alex_morgan'}
              {...register(key)}
              aria-invalid={!!errors[key]}
            />
            {errors[key] && (
              <span className="field-error">{errors[key].message}</span>
            )}
          </div>
        ))}
      </div>
      <div className="field">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <span className="field-error">{errors.email.message}</span>
        )}
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="dateOfBirth">Date of birth</label>
          <input
            id="dateOfBirth"
            type="date"
            autoComplete="bday"
            {...register('dateOfBirth')}
            aria-invalid={!!errors.dateOfBirth}
          />
          {errors.dateOfBirth && (
            <span className="field-error">{errors.dateOfBirth.message}</span>
          )}
        </div>
        <div className="field">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            {...register('gender')}
            aria-invalid={!!errors.gender}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && (
            <span className="field-error">{errors.gender.message}</span>
          )}
        </div>
      </div>
      <div className="field">
        <label htmlFor="new-password">Password</label>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          {...register('password')}
          aria-invalid={!!errors.password}
        />
        <span className="field-hint">
          8+ characters with uppercase, lowercase, a number, and a symbol.
        </span>
        {errors.password && (
          <span className="field-error">{errors.password.message}</span>
        )}
      </div>
      <div className="field">
        <label htmlFor="rePassword">Confirm password</label>
        <PasswordInput
          id="rePassword"
          autoComplete="new-password"
          placeholder="Enter your password again"
          {...register('rePassword')}
          aria-invalid={!!errors.rePassword}
        />
        {errors.rePassword && (
          <span className="field-error">{errors.rePassword.message}</span>
        )}
      </div>
      <FormError error={error} />
      <Button type="submit" className="auth-submit" busy={isSubmitting}>
        Create account <ArrowRight size={17} />
      </Button>
    </form>
  )
}
