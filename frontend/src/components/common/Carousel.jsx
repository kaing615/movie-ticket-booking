import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

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
          .swiper-button-prev::after,
          .swiper-button-next::after {
            font-size: 28px !important;
            color: #666 !important;
          }`}
      </style>
      <Swiper
        slidesPerView={1}
        spaceBetween={30}
        centeredSlides={true}
        loop={true}
        speed={1600}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Pagination, Navigation, Autoplay]}
        className="mySwiper w-full max-w-[1520px] shadow-lg"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={index}>
            <img src={banner} alt={`Banner ${index + 1}`} className="w-full object-cover" />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default Carousel;
