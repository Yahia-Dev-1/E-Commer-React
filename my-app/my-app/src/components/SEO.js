import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "Yahia Store - Advanced E-commerce Store | Safe and Fast Shopping",
  description = "Advanced e-commerce store for clothing, shoes, and accessories. Safe and fast shopping with excellent customer service",
  keywords = "e-commerce store, clothing, shoes, accessories, online shopping, offers, discounts",
  image = "https://yahia-dev-1.github.io/E-Commer-React/logo192.png",
  url = "https://yahia-dev-1.github.io/E-Commer-React",
  type = "website"
}) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Yahia Store" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="Yahia Store" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Structured Data for E-commerce */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "Yahia Store",
          "description": description,
          "url": url,
          "logo": image,
          "image": image,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "EG"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": "English"
          },
          "sameAs": [
            "https://github.com/yahia-dev-1"
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEO; 