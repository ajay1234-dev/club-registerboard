"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type LiveHero from "./LiveHero";

const LiveHeroDynamic = dynamic(() => import("./LiveHero"), { ssr: false });

export default function LiveHeroWrapper(props: ComponentProps<typeof LiveHero>) {
  return <LiveHeroDynamic {...props} />;
}
