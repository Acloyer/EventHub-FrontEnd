import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Start date must be in the future'
  }),
  endDate: z.string(),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  maxParticipants: z.number().min(1, 'Must allow at least 1 participant')
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate']
})

export const commentSchema = z.object({
  text: z.string()
    .min(1, 'Comment cannot be empty')
    .max(200, 'Comment must be less than 200 characters')
})

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  notifyBeforeEvent: z.boolean()
})

export const telegramVerificationSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d+$/, 'Code must contain only digits')
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type EventFormData = z.infer<typeof eventSchema>
export type CommentFormData = z.infer<typeof commentSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type TelegramVerificationFormData = z.infer<typeof telegramVerificationSchema> 