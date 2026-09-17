import {
  IcRestaurant, IcPharmacy, IcMarket, IcDelivery,
  IcStar, IcFire, IcCrown, IcNew, IcOffer, IcSparkle,
  IcCompass, IcStore, IcHeart, IcShield, IcChat, IcSearch,
  IcFoodPizza, IcFoodCrepe, IcFoodGrill, IcFoodKebab,
  IcFoodKoshary, IcFoodShawarma, IcFoodSandwich, IcFoodTaameya,
  IcFoodFish, IcFoodBurger, IcFoodJuice, IcFoodDessert, IcFoodCoffee,
  IcPhone, IcClock, IcGift, IcPin, IcSparkles, IcEye,
} from './eah-icons'

const ICONS = [
  IcRestaurant, IcPharmacy, IcMarket, IcDelivery, IcStar, IcFire, IcCrown,
  IcNew, IcOffer, IcSparkle, IcCompass, IcStore, IcHeart, IcShield, IcChat,
  IcSearch, IcFoodPizza, IcFoodCrepe, IcFoodGrill, IcFoodKebab, IcFoodKoshary,
  IcFoodShawarma, IcFoodSandwich, IcFoodTaameya, IcFoodFish, IcFoodBurger,
  IcFoodJuice, IcFoodDessert, IcFoodCoffee, IcPhone, IcClock, IcGift, IcPin,
  IcSparkles, IcEye,
]

// 40 icon instances at random positions (deterministic hash so SSR matches)
function seeded(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export default function AmbientBg() {
  return (
    <div className="eah-icon-bg" aria-hidden>
      {Array.from({ length: 40 }).map((_, i) => {
        const Icon = ICONS[i % ICONS.length]
        const top = `${(seeded(i * 3 + 1) * 100).toFixed(2)}%`
        const left = `${(seeded(i * 5 + 2) * 100).toFixed(2)}%`
        const size = 18 + Math.floor(seeded(i * 7) * 26)
        const rotate = Math.floor(seeded(i * 11) * 60 - 30)
        const opacity = 0.18 + seeded(i * 13) * 0.22
        const delay = `${(seeded(i * 17) * 8).toFixed(2)}s`
        const hue = i % 5 === 0 ? '#E8C79A' : i % 3 === 0 ? '#C084FC' : '#A855F7'
        return (
          <span
            key={i}
            className="eah-icon-bg__item"
            style={{
              top,
              left,
              width: size,
              height: size,
              color: hue,
              opacity,
              transform: `rotate(${rotate}deg)`,
              animationDelay: delay,
            }}
          >
            <Icon />
          </span>
        )
      })}
    </div>
  )
}
