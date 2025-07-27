import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/40">
      <div className="w-full max-w-md">
        <SignIn />
      </div>
    </div>
  )
}
