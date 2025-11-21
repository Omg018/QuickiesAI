import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import { assets } from '../assets/assets'
import AiInfo from '../components/AiInfo'
import Testimonial from '../components/Testimonial'
import Plan from '../components/Plan'
import Footer from '../components/Footer'

const Home = () => {
    return (
        <div>
            <Navbar />
            <Hero/>
            <AiInfo/>
            <Testimonial/>
            <Plan/>
            <Footer/>
            
        </div>
    )
}

export default Home
