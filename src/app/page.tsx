import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Dashboard — Private Skill Certification dApp",
  description: "Private Skill Certification — privacy-preserving ZK proof dApp on Midnight Network Preview.",
};

export default function HomePage() {
  return <HomeClient />;
}