import React from "react";
import "./Background.css";

const Background = () => {
  return (
    <div className='gradient-bg hidden sm:block fixed top-0 left-0 right-0 bottom-0 -z-10'>
      <div className='gradients-container'>
        <div className='g1'></div>
        <div className='g2'></div>
      </div>
    </div>
  );
};

export default Background;
