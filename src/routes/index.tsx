import { createFileRoute } from "@tanstack/react-router";
import SchoolOS from "../school-os/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vedaalay — School OS" },
      { name: "description", content: "Vedaalay School OS: manage admissions, attendance, homework, gradebook, fees, and parent communication in one place." },
      { property: "og:title", content: "Vedaalay — School OS" },
      { property: "og:description", content: "Vedaalay School OS: manage admissions, attendance, homework, gradebook, fees, and parent communication in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SchoolOS,
});
