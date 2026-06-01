// Nút bấm tái sử dụng — Tech Blue variants: primary / secondary / destructive / ghost.
// Hỗ trợ thêm prop `leadingIcon` (ReactNode) để hiển thị icon ở đầu nút.
export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
  leadingIcon = null,
  trailingIcon = null,
  ...props
}) {
  const variantClass = `ui-button--${variant}`

  return (
    <button
      type={type}
      className={`ui-button ${variantClass} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </button>
  )
}
