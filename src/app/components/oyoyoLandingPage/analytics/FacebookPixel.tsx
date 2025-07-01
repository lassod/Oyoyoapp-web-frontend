import React from "react";
import Script from "next/script";

interface Props {
  containerId: string;
}
const FacebookPixel = ({ containerId }: Props) => {
  return (
    <>
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', ${containerId}); 
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* <Image
          height="1"
          alt="Image"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1`}
        /> */}
      </noscript>
    </>
  );
};

export default FacebookPixel;
