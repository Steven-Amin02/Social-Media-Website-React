import { z } from 'zod'

export const loginSchema = z.object({
  login: z.string().trim().min(1, 'Enter your email or username.'),
  password: z.string().min(1, 'Enter your password.'),
})
export const strongPassword = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .regex(/[a-z]/, 'Include a lowercase letter.')
  .regex(/[A-Z]/, 'Include an uppercase letter.')
  .regex(/[0-9]/, 'Include a number.')
  .regex(/[^A-Za-z0-9]/, 'Include a symbol.')
export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name.'),
    username: z
      .string()
      .trim()
      .min(3, 'Use at least 3 characters.')
      .regex(/^[A-Za-z0-9_]+$/, 'Use letters, numbers, and underscores.'),
    email: z.email('Enter a valid email address.'),
    dateOfBirth: z
      .string()
      .min(1, 'Choose your date of birth.')
      .refine(
        (value) => new Date(value).getTime() < Date.now(),
        'Choose a date in the past.',
      ),
    gender: z.enum(['male', 'female'], { error: 'Choose a gender.' }),
    password: strongPassword,
    rePassword: z.string(),
  })
  .refine((value) => value.password === value.rePassword, {
    message: 'Passwords do not match.',
    path: ['rePassword'],
  })
export const passwordSchema = z
  .object({
    password: z.string().min(1, 'Enter your current password.'),
    newPassword: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
  .refine((value) => value.password !== value.newPassword, {
    message: 'Choose a different password.',
    path: ['newPassword'],
  })
