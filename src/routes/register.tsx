import { createFileRoute } from '@tanstack/react-router'
import RegisterForm from '@/components/RegisterationForm'

export const Route = createFileRoute('/register')({
    component: () => <RegisterForm />,
})

