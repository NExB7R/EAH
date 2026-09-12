'use client'
import './animated-background-v2.css'

export default function AnimatedBackgroundV2() {
  return (
    <div className="bg-canvas" aria-hidden>
      <div className="bg-canvas__layer bg-canvas__layer--stars" />
      <div className="bg-canvas__layer bg-canvas__layer--grid" />
      <div className="bg-canvas__noise" />
    </div>
  )
}
