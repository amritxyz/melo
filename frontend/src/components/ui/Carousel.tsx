import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/Button'

interface CarouselContextValue {
  carouselRef: React.RefObject<HTMLDivElement | null>
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

export function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }
  return context
}

export function Carousel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const carouselRef = React.useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(true)

  const checkScroll = React.useCallback(() => {
    if (!carouselRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollPrev(scrollLeft > 2)
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 2)
  }, [])

  React.useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  const scrollPrev = React.useCallback(() => {
    carouselRef.current?.scrollBy({ left: -260, behavior: 'smooth' })
  }, [])

  const scrollNext = React.useCallback(() => {
    carouselRef.current?.scrollBy({ left: 260, behavior: 'smooth' })
  }, [])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        className={cn('relative w-full', className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

export function CarouselContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { carouselRef } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className={cn(
        'flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      {...props}
    />
  )
}

export function CarouselItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn('min-w-0 shrink-0 grow-0 snap-start', className)}
      {...props}
    />
  )
}

export function CarouselPrevious({
  className,
  variant = 'outline',
  size = 'sm',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      className={cn('h-6 w-6 p-0 rounded-xs disabled:opacity-30', className)}
      aria-label="Previous slide"
      {...props}
    >
      <ChevronLeft className="w-3.5 h-3.5" />
    </Button>
  )
}

export function CarouselNext({
  className,
  variant = 'outline',
  size = 'sm',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={!canScrollNext}
      onClick={scrollNext}
      className={cn('h-6 w-6 p-0 rounded-xs disabled:opacity-30', className)}
      aria-label="Next slide"
      {...props}
    >
      <ChevronRight className="w-3.5 h-3.5" />
    </Button>
  )
}
