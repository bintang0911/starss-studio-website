/* ==========================================================================
   STARSS STUDIO — News & updates
   --------------------------------------------------------------------------
   Only publish real, verified announcements. The list is empty on purpose.

   To add an article, copy the template into the array (newest anywhere —
   the site sorts by date), fill in the real details and keep verified: true.

   {
     slug: "my-first-update",          // unique, lowercase, no spaces → news.html#my-first-update
     title: "Article title",
     date: "2026-01-31",               // YYYY-MM-DD
     category: "Development Update",   // Project Release | Development Update | Studio Announcement | Version Update | Important News
     image: "assets/images/showcase/cover.webp",   // optional featured image
     imageAlt: "Describe the image",
     summary: "Short description shown on cards.",
     content: [                        // each string is one paragraph of the full article
       "First paragraph.",
       "Second paragraph."
     ],
     verified: true                    // MUST be true or the article stays hidden
   }
   ========================================================================== */
window.STARSS = window.STARSS || {};
window.STARSS.news = [
];
