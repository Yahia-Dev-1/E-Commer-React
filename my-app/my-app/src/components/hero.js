import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import '../styles/hero.css'
export default function hero() {
  return (
    <div className='hero-container'>                                          
        <DotLottieReact
      src="https://lottie.host/9e31c819-612c-4f38-b3fd-2e53e6a10104/EEfP3i9LcG.lottie"
      loop
      autoplay
    />
    </div>
  )
}