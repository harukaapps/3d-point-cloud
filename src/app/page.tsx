'use client';

import Image from "next/image";
import { ThreeDScan } from "@/components/3dscan";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-white">
      <ThreeDScan />
    </main>
  );
}