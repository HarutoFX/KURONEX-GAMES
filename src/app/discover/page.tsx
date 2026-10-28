import { DiscoverPage } from "@/components/discover/DiscoverPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover Games | KURONEX GAMES",
  description: "Find Your Next Game. Explore games based on your taste, mood, and the way you play.",
};

export default function Discover() {
  return (
    <main>
      <DiscoverPage />
    </main>
  );
}
