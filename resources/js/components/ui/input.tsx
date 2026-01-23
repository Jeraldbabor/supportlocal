import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      style={{ colorScheme: 'light' }}
      className={cn(
        "border-gray-300 file:text-gray-900 placeholder:text-gray-400 selection:bg-orange-100 selection:text-orange-900 flex h-9 w-full min-w-0 rounded-md border bg-white px-3 py-1 text-base text-gray-900 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-orange-500 focus-visible:ring-orange-500/30 focus-visible:ring-[3px]",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
