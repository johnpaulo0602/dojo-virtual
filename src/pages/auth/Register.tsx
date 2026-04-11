import { GalleryVerticalEnd } from "lucide-react"

import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-4 self-center">
          <div className="flex size-14 items-center justify-center rounded-2xl overflow-hidden shadow-lg shadow-primary/10 ring-1 ring-border/50">
            <img src="/logo-2x.png" alt="Logo Dojo Virtual" className="size-full object-cover" />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black tracking-tight uppercase">Dojo Virtual</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none mt-1">Jiu-Jitsu</p>
          </div>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
