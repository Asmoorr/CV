import type { AboutContent } from "../schema";

export const about: AboutContent = {
  label: "Profile",
  title: "I build reliable server-side foundations",
  paragraphs: [
    "I’m a backend developer from Belgorod, now living and studying in Saint Petersburg. I started programming in my teens and have been steadily focusing on backend engineering ever since.",
    "I design application structures and work with relational databases, caching, and REST APIs. I study Applied Computer Science at ITMO University and use that knowledge in commercial and research projects.",
    "Outside development, I play guitar, perform at university concerts, and enjoy mind sports.",
  ],
  facts: [
    { value: "Backend", label: "focus" },
    { value: "ITMO", label: "2024–2028" },
    { value: "Saint Petersburg", label: "location" },
  ],
};
