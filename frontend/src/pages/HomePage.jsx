import CardGrid from "../components/CardGrid";
import Carousel from "../components/Carousel";
import CarouselCategory from "../components/CarouselCategory";
import CarouselProducts from "../components/CarouselProducts";
import HomeCard from "../components/HomeCard";
import { Helmet } from "react-helmet-async";
import homeCardsData from "../homeCardsData";
import ProductListPage from "./ProductListPage";
const HomePage = () => {
  

  return (
    <div className="bg-amazonClone-background">
      <Helmet><title>Amazon Clone</title></Helmet>
      {/* Main container with Amazon-like width constraints */}
      <div className="">
        {/* hero section */}
        <Carousel/>
        <div className="grid grid-cols-3 xl:grid-cols-4 -mt-80">
            {homeCardsData.map((card) => (
              <HomeCard 
              key={card.id}
              title={card.title}
              link={card.link}
              img={card.img}
              />
            ))}
           
        </div>
       {/* Product list */}
        <ProductListPage className="mt-2"/>

        {/* Product slider */}
        <CarouselProducts/>

        {/* Product category */}
        <CarouselCategory/>

        {/*  cards */}
          <CardGrid/>
          
          
       
      </div>
    </div>
  )
}

export default HomePage;