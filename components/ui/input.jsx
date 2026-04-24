import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "w-full rounded-2xl border bg-muted/70 px-4 py-3 text-sm text-foreground shadow-sm shadow-slate-900/5 placeholder:text-muted-foreground transition duration-200 ease-in-out focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        error && "border-destructive focus-visible:ring-destructive/30",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }
