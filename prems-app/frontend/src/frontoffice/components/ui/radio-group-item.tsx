import * as React from "react"

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {}

export const RadioGroupItem = React.forwardRef<HTMLInputElement, Props>(
  ({ className, ...props }, ref) => (
    <input
      type="radio"
      ref={ref}
      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
      {...props}
    />
  )
)

RadioGroupItem.displayName = "RadioGroupItem"
