// Glassmorphism surface container.
// `variant` (optional): 'glow' (thêm hiệu ứng phát sáng xanh), 'flat' (bỏ viền gradient),
//   'accent' (nền gradient nhẹ). Mặc định giữ nguyên hành vi cũ.
export default function Card({ children, className = '', variant = '' }) {
  const variantClass = variant ? `ui-card--${variant}` : ''
  return (
    <section className={`ui-card ${variantClass} ${className}`.trim()}>{children}</section>
  )
}
