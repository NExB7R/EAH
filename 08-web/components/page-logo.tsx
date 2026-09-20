import EahLogo from './eah-logo'
import './page-logo.css'

export default function PageLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="plogo">
      <EahLogo size={size} variant="full" href="/" />
    </div>
  )
}
