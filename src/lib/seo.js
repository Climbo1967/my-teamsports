// Shared social-preview image. Next merges `openGraph` shallowly: a page that
// sets its own openGraph title replaces the root object wholesale, so the
// root's `images` disappear and the card has no picture (and twitter:card
// says summary_large_image with nothing to show). Pages add this explicitly.
export const SITE_URL = "https://my-teamsports.com";
export const OG_IMAGE = {
  url: `${SITE_URL}/og-image.png`,
  width: 1200,
  height: 630,
  alt: "My-Team Sports — youth sports team websites, no app needed",
};
export const OG_IMAGES = [OG_IMAGE];
export const TWITTER_IMAGES = [OG_IMAGE.url];
