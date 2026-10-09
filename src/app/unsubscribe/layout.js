// The unsubscribe page is a client component, so its robots rule lives here.
// It was inheriting the root's index,follow and showing up as a landing page.
export const metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function UnsubscribeLayout({ children }) {
  return children;
}
