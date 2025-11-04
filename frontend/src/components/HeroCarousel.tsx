import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import hero images
import hero1 from '@/assets/hero1.jpg';
import hero2 from '@/assets/hero2.jpg';
import hero3 from '@/assets/hero3.jpg';

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

interface HeroCarouselProps {
    slides?: CarouselSlide[];
    autoplayDelay?: number;
    showNavigation?: boolean;
    showPagination?: boolean;
    className?: string;
    height?: string; // new prop
  }

const defaultSlides: CarouselSlide[] = [
  {
    id: 1,
    image: hero1,
    title: "Premium Beauty Services",
    subtitle: "Book Certified Beauticians Anytime, Anywhere",
    buttonText: "Book At-Home Service",
    buttonLink: "/at-home-services"
  },
  {
    id: 2,
    image: hero2,
    title: "Professional Salon Visits",
    subtitle: "Discover Top-Rated Salons Near You",
    buttonText: "Find a Salon",
    buttonLink: "/salon-visit"
  },
  {
    id: 3,
    image: hero3,
    title: "Beauty at Your Doorstep",
    subtitle: "Experience Luxury Beauty Services in the Comfort of Your Home",
    buttonText: "Get Started",
    buttonLink: "/at-home-services"
  }
];

const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides = defaultSlides,
  autoplayDelay = 3000,
  showNavigation = false,
  showPagination = true,
  className = ""
}) => {
  const handleSlideChange = (swiper: SwiperType) => {
    // Optional: Add any slide change logic here
    console.log('Slide changed to:', swiper.activeIndex);
  };

  return (
    <div className={`relative w-full max-w-[1200px] mx-auto h-[500px] mt-32 rounded-xl overflow-hidden shadow-lg ${className}`}>

      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
        }}
        effect="fade"
        fadeEffect={{
          crossFade: true
        }}
        navigation={showNavigation}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        loop={true}
        speed={1000}
        onSlideChange={handleSlideChange}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8">

              {/* </div><div className="relative z-10 flex items-center justify-center h-full"> */}
                <div className="text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                  <motion.h1 
                    className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {slide.title}
                  </motion.h1>
                  
                  <motion.p 
                    className="text-lg sm:text-xl lg:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    {slide.subtitle}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <a
                      href={slide.buttonLink}
                      className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-[#4e342e] hover:bg-[#3b2c26] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      {slide.buttonText}
                      <svg 
                        className="w-5 h-5 ml-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M17 8l4 4m0 0l-4 4m4-4H3" 
                        />
                      </svg>
                    </a>
                  </motion.div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Custom Pagination Styling */}
      <style>{`
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          width: 12px;
          height: 12px;
          margin: 0 6px;
          transition: all 0.3s ease;
        }
        
        .swiper-pagination-bullet-active {
          background: #4e342e;
          transform: scale(1.2);
        }
        
        .swiper-pagination {
          bottom: 30px;
        }
        
        .swiper-button-next,
        .swiper-button-prev {
          color: #4e342e;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          margin-top: -25px;
        }
        
        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 18px;
          font-weight: bold;
        }
        
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: #4e342e;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;
