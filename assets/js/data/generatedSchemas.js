export const GENERATED_SCHEMA_INDEX = {
  "home": {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "America's Real Doctors",
    "url": "https://americasrealdoctors.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://americasrealdoctors.com/pages/doctor-search-results.html?doctorName={doctorName}",
      "query-input": "required name=doctorName"
    }
  },
  "faq": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can I search without an account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Public users can search without creating a patient account in version one."
        }
      },
      {
        "@type": "Question",
        "name": "Are credential documents public?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Documents stay private for administrative verification only."
        }
      },
      {
        "@type": "Question",
        "name": "Can doctors be ranked by payment?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Doctors are not ranked by payment."
        }
      }
    ]
  },
  "article": {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Article Details",
    "description": "Educational article detail page.",
    "author": {
      "@type": "Person",
      "name": "Dr. Elena Morris"
    },
    "publisher": {
      "@type": "Organization",
      "name": "America's Real Doctors"
    }
  },
  "doctorProfile": {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": "Dr. Elena Morris",
    "medicalSpecialty": [
      "Family Medicine",
      "Integrative Medicine",
      "Preventive Care"
    ],
    "url": "https://americasrealdoctors.com/pages/doctor-profile.html",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Philadelphia",
      "addressRegion": "PA",
      "addressCountry": "US"
    }
  },
  "browsePages": [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Doctors in Pennsylvania",
      "description": "Crawlable location landing page for Pennsylvania doctors.",
      "url": "https://americasrealdoctors.com/pages/doctors-in-pennsylvania.html"
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Doctors in Philadelphia",
      "description": "Crawlable location landing page for Philadelphia doctors.",
      "url": "https://americasrealdoctors.com/pages/doctors-in-philadelphia.html"
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Integrative Doctors in California",
      "description": "Crawlable specialty and location landing page.",
      "url": "https://americasrealdoctors.com/pages/integrative-doctors-in-california.html"
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Family Physicians Offering Telehealth",
      "description": "Crawlable telehealth landing page for family physicians.",
      "url": "https://americasrealdoctors.com/pages/family-physicians-offering-telehealth.html"
    }
  ]
};
