import * as React from "react"
import { cn } from "../../../lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
}

export function Progress({ value, className, ...props }: ProgressProps) {
  return (
    <div className={cn("h-2 w-full rounded-full bg-gray-200", className)} {...props}>
      <div
        className="h-full rounded-full bg-green-600 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
