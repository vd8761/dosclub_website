"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

// Register plugins exactly once on the client.
if (typeof window !== "undefined") {
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollSmoother,
    DrawSVGPlugin,
    MorphSVGPlugin,
  );
}

export { gsap, ScrollTrigger, ScrollSmoother, DrawSVGPlugin, MorphSVGPlugin };
