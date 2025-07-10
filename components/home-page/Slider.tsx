'use client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface SlideData {
  id: number;
  title: string;
  description: string;
  image: string;
  features: string[];
}

const slides: SlideData[] = [
  {
    id: 1,
    title: 'Token Swap',
    description:
      'Seamlessly swap between different cryptocurrencies with our integrated DEX aggregator. Get the best rates across multiple exchanges with minimal slippage and gas optimization.',
    image: '/images/home-page/swap.png',
    features: ['DEX Aggregation', 'Best Rate Finding', 'Gas Optimization', 'Slippage Protection'],
  },
  {
    id: 2,
    title: 'Token Dashboard',
    description:
      'Comprehensive overview of your crypto portfolio with real-time price tracking, balance monitoring, and performance analytics. Track your favorite tokens and get instant market insights.',
    image: '/images/home-page/dashboard.png',
    features: ['Real-time Portfolio Tracking'],
  },
  {
    id: 3,
    title: 'NFT Marketplace',
    description:
      'Explore, buy, and sell NFTs in our integrated marketplace. Discover trending collections, track floor prices, and manage your digital collectibles all in one place.',
    image: '/images/home-page/nft.png',
    features: ['NFT Trading', 'Portfolio Management'],
  },
];

export function HomePageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) {return;}

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // const toggleAutoPlay = () => {
  //   setIsAutoPlaying(!isAutoPlaying);
  // };

  return (
    <div
      className="relative mx-auto w-full max-w-6xl rounded-2xl px-6 shadow-2xl"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slider Container */}
      <div className="relative">
        {/* Main Slide */}
        <div className="relative h-[600px] overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
                index === currentSlide
                  ? 'translate-x-0'
                  : index < currentSlide
                    ? '-translate-x-full'
                    : 'translate-x-full'
              }`}
            >
              <div className="grid h-full md:grid-cols-2">
                {/* Image Section */}
                <div className="relative flex items-center justify-center p-6">
                  <div className="relative h-full w-full max-w-lg">
                    <Image
                      src={slide.image}
                      alt="Swap Token"
                      fill
                      objectFit="contain"
                      className="overflow-hidden rounded-lg object-cover shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-lg" />
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col justify-center space-y-6 p-8">
                  <div>
                    <h3 className="mb-4 text-3xl font-bold text-white">{slide.title}</h3>
                    <p className="mb-6 text-lg leading-relaxed text-slate-400">{slide.description}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="text-xl font-semibold text-orange-400">Key Features:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {slide.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-orange-400" />
                          <span className="text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1/2 -left-5 h-12 w-12 -translate-y-1/2 cursor-pointer border-0 text-white hover:bg-transparent hover:text-orange-400/80"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1/2 -right-10 h-12 w-12 -translate-y-1/2 cursor-pointer border-0 text-white hover:bg-transparent hover:text-orange-400/80"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center">
        {/* Slide Indicators */}
        <div className="flex space-x-4">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 cursor-pointer rounded-full transition-all duration-300 ${
                index === currentSlide ? 'scale-125 bg-orange-400' : 'bg-slate-600 hover:bg-slate-500'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        {/* Auto-play Control */}
        {/* <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-300">
            {currentSlide + 1} / {slides.length}
          </span>
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white" onClick={toggleAutoPlay}>
            {isAutoPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isAutoPlaying ? 'Pause' : 'Play'}
          </Button>
        </div> */}
      </div>
    </div>
  );
}
