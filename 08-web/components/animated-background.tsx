'use client'
import './animated-background.css'

export default function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden>
      <div className="animated-bg__layer animated-bg__layer--far" />
      <div className="animated-bg__layer animated-bg__layer--near" />
    </div>
  )
}
