import type { AboutContent } from "../schema";

export const about: AboutContent = {
  label: "Profile",
  title: "I build reliable server-side foundations",
  blocks: [
    { id: "general", title: "About me", text: "I’m a developer from Belgorod, now living and studying in Saint Petersburg. I started programming in my teens and have steadily focused on web development." },
    { id: "work", title: "Work", text: "I design backend systems, databases, and APIs. At ITMO, I’m responsible for a data canonicalisation service within a microservice platform for scientific publication data." },
    { id: "hobbies", title: "Beyond code", text: "I play guitar, occasionally perform at local concerts, and enjoy mind sports." },
  ],
  facts: [
    { value: "Backend", label: "focus" },
    { value: "ITMO", label: "2024–2028" },
    { value: "Saint Petersburg", label: "location" },
  ],
};
