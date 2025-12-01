import { ReactNode, ButtonHTMLAttributes } from 'react'

// ============================================================
// BROKEN VERSION - Intentionally bad implementation
// Problems:
// - No TypeScript types for props
// - Inline styles mixed with logic
// - Wrong event binding (onClick on div instead of button)
// - No accessibility attributes
// - Hardcoded colors, no variants
// - Magic strings everywhere
// ============================================================

export function BrokenButton_BROKEN(props: any) {
  // Bad: using any type, no destructuring
  let style: any = {}
  
  // Bad: deeply nested conditions for styling
  if (props.variant === 'primary') {
    style.backgroundColor = '#22c55e'
    style.color = 'white'
  } else if (props.variant === 'secondary') {
    style.backgroundColor = '#27272a'
    style.color = '#a1a1aa'
  } else if (props.variant === 'danger') {
    style.backgroundColor = '#ef4444'
    style.color = 'white'
  } else {
    style.backgroundColor = '#22c55e'
    style.color = 'white'
  }
  
  // Bad: size handling with magic numbers
  if (props.size === 'sm') {
    style.padding = '4px 8px'
    style.fontSize = '12px'
  } else if (props.size === 'lg') {
    style.padding = '16px 32px'
    style.fontSize = '18px'
  } else {
    style.padding = '8px 16px'
    style.fontSize = '14px'
  }
  
  // Bad: using div instead of button, inline onClick
  return (
    <div
      style={style}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  )
}


// ============================================================
// REFACTORED VERSION - Clean, accessible, type-safe
// ============================================================

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-emerald-500 to-teal-500 text-white 
    hover:from-emerald-400 hover:to-teal-400
    shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40
    border border-emerald-400/20
    btn-shine
  `,
  secondary: `
    bg-zinc-800/80 text-zinc-200 
    hover:bg-zinc-700/80 
    border border-zinc-700/50 hover:border-zinc-600/50
    shadow-lg shadow-black/20
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-rose-500 text-white 
    hover:from-red-400 hover:to-rose-400
    shadow-lg shadow-red-500/25
    border border-red-400/20
  `,
  ghost: `
    bg-transparent text-zinc-400 
    hover:text-zinc-100 hover:bg-zinc-800/50
    border border-transparent hover:border-zinc-700/50
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <button
      className={`
        relative inline-flex items-center justify-center font-semibold
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        active:scale-[0.98]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
}

// Note: BrokenButton_BROKEN is exported above for demonstration purposes
