// Server-component layout that adds search metadata to the (client-rendered)
// /signup page. The page itself stays "use client"; this wrapper only supplies
// the <title> and meta description so the indexed signup page isn't generic.
// The root template appends " | My-Team Sports" to the title automatically.

export const metadata = {
  title: "Create Your Team — Half Off for the 2026 Season",
  description:
    "Create your youth sports team website in about five minutes. Pick your sport, name your team, and share a passcode — no app, no parent accounts, parents always free. Start with a 30-day free trial.",
  alternates: { canonical: "/signup" },
  openGraph: {
    title: "Create Your Team — Half Off for 2026 | My-Team Sports",
    description:
      "Set up your team website in five minutes. Start free for 30 days. No app, no parent accounts.",
    url: "https://my-teamsports.com/signup",
  },
};

export default function SignupLayout({ children }) {
  return children;
}
