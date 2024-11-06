"use client"

import { useState, useEffect } from "react"

import GenerateIcon from "./vectors/generate.svg"
import ManageIcon from "./vectors/manage.svg"
import OneStopIcon from "./vectors/onestop.svg"

const Carousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const slides = [
    {
      text: "One-stop view into the bank's financials",
      Icon: OneStopIcon,
    },
    {
      text: "Manage customers, approve loans, record deposits and withdrawals",
      Icon: ManageIcon,
    },
    {
      text: "Generate regulatory reporting for government compliance",
      Icon: GenerateIcon,
    },
  ]

  // Autoplay effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length)
    }, 5000) // Change slide every 5 seconds
    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <div className="relative px-10 flex h-full w-full overflow-hidden">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out w-full"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <CarouselItem key={index} text={slide.text} Icon={slide.Icon} />
        ))}
      </div>

      {/* Navigation Indicators */}
      <div className="absolute bottom-20 left-2/4 z-50 flex -translate-x-2/4 gap-2">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`block h-1 cursor-pointer rounded-2xl transition-all ${activeIndex === i ? "w-8 bg-white" : "w-4 bg-white/50"}`}
            onClick={() => setActiveIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}

export default Carousel

type CarouselItemProps = {
  text: string
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
}

const CarouselItem: React.FC<CarouselItemProps> = ({ text, Icon }) => (
  <div className="flex flex-col justify-center items-center space-y-10 h-full w-full flex-shrink-0">
    <Icon />
    <div className="text-title text-body-lg text-center !text-white">{text}</div>
  </div>
)
