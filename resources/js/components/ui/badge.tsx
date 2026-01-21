import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 transition-[color,box-shadow] overflow-auto",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-orange-500 text-white [a&]:hover:bg-orange-600",
        secondary:
          "border-transparent bg-gray-100 text-gray-900 [a&]:hover:bg-gray-200",
        destructive:
          "border-transparent bg-red-600 text-white [a&]:hover:bg-red-700 focus-visible:ring-red-500/50",
        outline:
          "text-gray-700 border-gray-300 [a&]:hover:bg-gray-50 [a&]:hover:text-gray-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
