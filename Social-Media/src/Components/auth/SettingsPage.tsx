import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react'
import type { z } from 'zod'
import { authApi } from '../../shared/api/services'
import { Avatar, Button, FormError } from '../ui'
import { PageHeading } from '../feed/FeedPages'
import { useAuth } from '../../features/auth/auth-state'
import { PasswordInput } from './AuthPage'
import { passwordSchema } from '../../features/auth/schemas'

export function SettingsPage() {
  const { user, replaceToken } = useAuth()
  const [error, setError] = useState<unknown>()
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  })
  return (
    <div className="stack">
      <PageHeading
        eyebrow="YOUR ACCOUNT, YOUR SPACE"
        title="Account settings"
        description="A few small details to keep your corner of the community secure."
      />
      <div className="card settings-account">
        <Avatar user={user} size="lg" />
        <div>
          <h2>{user?.name}</h2>
          <p className="muted">{user?.email}</p>
          <span className="small muted">@{user?.username}</span>
        </div>
        <ShieldCheck size={24} className="security-icon" />
      </div>
      <section className="card settings-card">
        <div className="section-heading">
          <h2>
            <LockKeyhole size={19} /> Change your password
          </h2>
        </div>
        <p className="muted">
          Choose something strong, unique, and just for you.
        </p>
        <form
          className="form-stack"
          onSubmit={handleSubmit(async (values) => {
            setError(undefined)
            setSuccess(false)
            try {
              const response = await authApi.password({
                password: values.password,
                newPassword: values.newPassword,
              })
              replaceToken(response.data.token)
              reset()
              setSuccess(true)
            } catch (error) {
              setError(error)
            }
          })}
          noValidate
        >
          {(
            [
              { key: 'password', label: 'Current password' },
              { key: 'newPassword', label: 'New password' },
              { key: 'confirmPassword', label: 'Confirm new password' },
            ] as const
          ).map(({ key, label }) => (
            <div className="field" key={key}>
              <label htmlFor={key}>{label}</label>
              <PasswordInput
                id={key}
                autoComplete={
                  key === 'password' ? 'current-password' : 'new-password'
                }
                placeholder={label}
                {...register(key)}
                aria-invalid={!!errors[key]}
              />
              {errors[key] && (
                <span className="field-error">{errors[key].message}</span>
              )}
            </div>
          ))}
          <p className="field-hint">
            Use at least 8 characters, including uppercase and lowercase
            letters, a number, and a symbol.
          </p>
          <FormError error={error} />
          {success && (
            <div className="success-panel" role="status">
              <CheckCircle2 size={18} />
              Your password has been updated.
            </div>
          )}
          <Button type="submit" busy={isSubmitting}>
            <ShieldCheck size={16} />
            Update password
          </Button>
        </form>
      </section>
    </div>
  )
}
