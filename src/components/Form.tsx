import { useForm, UseFormReturn, FieldValues, UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodType } from 'zod'

interface FormProps<TFormValues extends FieldValues> {
  onSubmit: (values: TFormValues) => void
  children: (methods: UseFormReturn<TFormValues>) => React.ReactNode
  schema?: ZodType<any>
  options?: UseFormProps<TFormValues>
  id?: string
  className?: string
}

export default function Form<TFormValues extends FieldValues>({
  onSubmit,
  children,
  schema,
  options,
  id,
  className
}: FormProps<TFormValues>) {
  const methods = useForm<TFormValues>({
    ...options,
    resolver: schema ? zodResolver(schema) : undefined
  })

  return (
    <form
      id={id}
      className={className}
      onSubmit={methods.handleSubmit(onSubmit)}
      noValidate
    >
      {children(methods)}
    </form>
  )
}

// Field components for use with Form
interface FieldWrapperProps {
  label?: string
  error?: string
  description?: string
  children: React.ReactNode
}

export function FieldWrapper({
  label,
  error,
  description,
  children
}: FieldWrapperProps) {
  const id = label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      {children}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400" id={`${id}-description`}>
          {description}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

// Example usage:
/*
import { z } from 'zod'
import Form, { FieldWrapper } from './Form'
import Input from './Input'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

type LoginFormValues = z.infer<typeof schema>

export function LoginForm() {
  const onSubmit = (values: LoginFormValues) => {
    console.log(values)
  }

  return (
    <Form<LoginFormValues>
      onSubmit={onSubmit}
      schema={schema}
    >
      {({ register, formState: { errors } }) => (
        <>
          <FieldWrapper
            label="Email"
            error={errors.email?.message}
          >
            <Input
              type="email"
              {...register('email')}
            />
          </FieldWrapper>
          <FieldWrapper
            label="Password"
            error={errors.password?.message}
          >
            <Input
              type="password"
              {...register('password')}
            />
          </FieldWrapper>
        </>
      )}
    </Form>
  )
}
*/ 