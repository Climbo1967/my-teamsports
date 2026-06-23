// Server-component layout that adds search metadata to the (client-rendered)
// /signup page. The page itself stays "use client"; this wrapper only supplies
// the <title> and meta description so the indexed signup page isn't generic.
// The root template appends " | My-Team Sports" to the title automatically.

export const metadata = {
  title: "Create Your Team — Free for the 2026 Season",
  description:
    "Create your free youth sports team website in about five minutes. Pick your sport, name your team, and share a passcode — no app, no parent accounts, no cost.",
  alternates: { canonical: "/signup" },
  openGraph: {
    title: "Create Your Team — Free | My-Team Sports",
    description:
      "Set up your free team website in five minutes. No app, no parent accounts, no cost.",
    url: "https://my-teamsports.com/signup",
  },
};

export default function SignupLayout({ children }) {
  return children;
}
