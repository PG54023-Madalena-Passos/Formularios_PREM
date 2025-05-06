import * as React from "react"
import { cn } from "../../../lib/utils"

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  children: React.ReactNode
}

export function RadioGroup({
  className,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  )
}
