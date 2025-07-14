import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
const CarouselCategory = () => {
  return (
    <div className='bg-white m-3'>
        <div className="text-2xl font-semibold p-3">Shop by Category</div>
        <Swiper
        slidesPerView={5}
        spaceBetween={10}
        navigation={true}
        modules={[Navigation]}
        >
            <SwiperSlide>
                <img src="https://raw.githubusercontent.com/JonnyDavies/amazon-clone-frontend/refs/heads/main/public/images/category_0.jpg" loading='lazy' alt="" />    
            </SwiperSlide>  
            <SwiperSlide>
                <img src="https://raw.githubusercontent.com/JonnyDavies/amazon-clone-frontend/refs/heads/main/public/images/category_1.jpg" loading='lazy' alt="" />    
            </SwiperSlide>  
            <SwiperSlide>
                <img src="https://raw.githubusercontent.com/JonnyDavies/amazon-clone-frontend/refs/heads/main/public/images/category_2.jpg" loading='lazy' alt="" />    
            </SwiperSlide>  
            <SwiperSlide>
                <img src="https://raw.githubusercontent.com/JonnyDavies/amazon-clone-frontend/refs/heads/main/public/images/category_3.jpg" loading='lazy' alt="" />    
            </SwiperSlide>  
            <SwiperSlide>
                <img src="https://raw.githubusercontent.com/JonnyDavies/amazon-clone-frontend/refs/heads/main/public/images/category_4.jpg" loading='lazy' alt="" />    
            </SwiperSlide>  
            <SwiperSlide>
                <img src="https://raw.githubusercontent.com/JonnyDavies/amazon-clone-frontend/refs/heads/main/public/images/category_5.jpg" loading='lazy' alt="" />    
            </SwiperSlide>  
        </Swiper>
    </div>
  )
}

export default CarouselCategory