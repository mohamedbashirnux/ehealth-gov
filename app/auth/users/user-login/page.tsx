import { UserLoginForm } from "@/components/user-login-form"

export default function UserLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <UserLoginForm />
      </div>
    </div>
  )
}