
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';


const Carousel = () => {
  return (
    <div className='h-[600px] bg-white'>
      <Swiper 
      loop={true}
      navigation={true}
      spaceBetween={0}
      modules={[Navigation, Autoplay]}
      autoplay={{
        delay:4500
      }}
      className='h-[50%]'
      >
        <SwiperSlide>
          <img src="https://m.media-amazon.com/images/I/61TD5JLGhIL._SX3000_.jpg" alt="" />
        </SwiperSlide>
        <SwiperSlide>
          <img src="https://m.media-amazon.com/images/I/61DUO0NqyyL._SX3000_.jpg" alt="" />
        </SwiperSlide>
        <SwiperSlide className='bg-black'>
          <video controls muted="muted">
            <source src="../images/carousel_vid.mp4" type="video/mp4" />
          </video>
        </SwiperSlide>
        <SwiperSlide>
          <img src="https://m.media-amazon.com/images/I/61jovjd+f9L._SX3000_.jpg" alt="" />
        </SwiperSlide>

      </Swiper>
      <div className='h-[50%] bg-gradient-to-b from-stone-900'/>
    </div>
  );
};

export default Carousel;