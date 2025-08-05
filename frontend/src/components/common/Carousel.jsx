import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

const Carousel = () => {
  const banners = [
    "/img/banner/bi-kip-luyen-rong-2048_1749195168873.jpg",
    "/img/banner/ballerina-2048_1748252066486.jpg",
    "/img/banner/doraemon-movie-44-1_1748017461000.jpg",
    "/img/banner/duoi-day-ho-p-2048_1748921724215.jpg",
    "/img/banner/glx-2048x682_1747389452013.png",
    "/img/banner/miku-sneak-2048_1749529881854.jpg",
    "/img/banner/mua-lua-2048_1747295237842.jpg",
    "/img/banner/the-stone-2048_1747797893261.jpg",
  ];

  return (
    <>
      <style>
        {`
        .mySwiper {
          border-radius: 1.5rem;
          box-shadow: 0 6px 32px 0 #0008, 0 1.5px 3px #3332;
          overflow: hidden;
          background: linear-gradient(90deg,#141517 70%,#22242a 100%);
        }
        .mySwiper .swiper-pagination-bullet {
          background: #fff;
          opacity: 0.7;
          border: 1.5px solid #F26B38;
          width: 12px;
          height: 12px;
          transition: transform .2s;
        }
        .mySwiper .swiper-pagination-bullet-active {
          background: #F26B38;
          opacity: 1;
          transform: scale(1.2);
        }
        .mySwiper .swiper-button-prev,
        .mySwiper .swiper-button-next {
          top: 55%;
          transform: translateY(-50%);
          color: #fff !important;
          border-radius: 50%;
          background: #222c;
          width: 44px;
          height: 44px;
          box-shadow: 0 2px 12px #0008;
          transition: background 0.2s;
        }
        .mySwiper .swiper-button-prev:hover,
        .mySwiper .swiper-button-next:hover {
          background: #F26B38cc;
        }
        .mySwiper .swiper-button-prev::after,
        .mySwiper .swiper-button-next::after {
          font-size: 1.9rem !important;
          font-weight: bold;
        }
        .mySwiper img {
          border-radius: 1.5rem;
          object-fit: cover;
          min-height: 340px;
          max-height: 380px;
          transition: filter .4s;
        }
        .mySwiper .swiper-slide-active img {
          filter: brightness(1) drop-shadow(0 4px 32px #F26B3860);
        }
        .mySwiper .swiper-slide:not(.swiper-slide-active) img {
          filter: grayscale(0.5) blur(1px) opacity(0.85);
        }
      `}
      </style>
      <Swiper
        slidesPerView={1}
        spaceBetween={20}
        centeredSlides={true}
        loop={true}
        speed={1100}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{
          delay: 3600,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Pagination, Navigation, Autoplay, EffectFade]}
        className="mySwiper w-full max-w-5xl md:max-w-6xl xl:max-w-7xl mx-auto"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={index}>
            <img
              src={banner}
              alt={`Banner ${index + 1}`}
              className="w-full"
            />
            {/* Overlay bottom gradient for text or cinematic feel */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#191919ef] to-transparent pointer-events-none" />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default Carousel;
