import React, { useEffect, useRef, useState } from "react";
import "./AnimatedLoader.css"

import vidoeloaidng from "../assests/10d8a812c20ed79a08d68d841680b8a7.gif"
import robotFace from "../assests/face scanning.gif"
const checkmarkIdPrefix = "loadingCheckSVG-";
const checkmarkCircleIdPrefix = "loadingCheckCircleSVG-";
const verticalSpacing = 50;

const phrases = [
 "Unpacking campaign intent",
  "Mapping audience signals",
  "Exploring brand positioning",
  "Aligning with strategic themes",
  "Identifying content opportunities",
  "Balancing creativity and structure",
  "Sequencing campaign touchpoints",
  "Refining narrative flow",
  "Evaluating messaging clarity",
  "Adapting for platform dynamics",
  "Optimizing content cadence",
  "Reassessing campaign coherence"
];

const shuffleArray = (array: string[]): string[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const easeInOut = (t: number): number => {
  const period = 200;
  return (Math.sin(t / period + 100) + 1) / 2;
};
type AnimatedLoaderProps = {
  sx?:any
}
const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({sx}) => {
  const phrasesRef = useRef<SVGGElement>(null);
  const shuffledPhrases = useRef(shuffleArray(phrases));
  const checks = useRef<{ check: SVGPolygonElement; circle: SVGCircleElement }[]>([]);

 useEffect(() => {
  const svgNS = "http://www.w3.org/2000/svg";
  const group = phrasesRef.current;
  if (!group) return;

  group.innerHTML = "";
  checks.current = [];

  shuffledPhrases.current.forEach((phrase, index) => {
    const yOffset = 100 + verticalSpacing * index;

    // ✅ Create text element
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("fill", "white");
    text.setAttribute("x", "60"); // Give more left padding if needed
    text.setAttribute("y", yOffset.toString());
    text.setAttribute("font-size", "18");
     text.setAttribute("overflow", "visible");
    text.setAttribute("font-family", "Arial");
    text.setAttribute("text-anchor", "start"); // Align text left
    text.setAttribute("style", "overflow: visible; white-space: pre;"); // ✅ No truncation
    text.textContent = phrase ;

    // ✅ Checkmark polygon
    const check = document.createElementNS(svgNS, "polygon");
    check.setAttribute(
      "points",
      "21.661,7.643 13.396,19.328 9.429,15.361 7.075,17.714 13.745,24.384 24.345,9.708"
    );
    check.setAttribute("id", checkmarkIdPrefix + index);
    check.setAttribute("fill", "white");

    // ✅ Circle outline path
    const circleOutline = document.createElementNS(svgNS, "path");
    circleOutline.setAttribute(
      "d",
      "M16,0C7.163,0,0,7.163,0,16s7.163,16,16,16s16-7.163,16-16S24.837,0,16,0z M16,30C8.28,30,2,23.72,2,16C2,8.28,8.28,2,16,2 c7.72,0,14,6.28,14,14C30,23.72,23.72,30,16,30z"
    );
    circleOutline.setAttribute("fill", "white");

    // ✅ Transparent circle
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("id", checkmarkCircleIdPrefix + index);
    circle.setAttribute("cx", "16");
    circle.setAttribute("cy", "16");
    circle.setAttribute("r", "15");
    circle.setAttribute("fill", "rgba(255,255,255,0)");

    // ✅ Group wrapper for check/circle
    const groupElem = document.createElementNS(svgNS, "g");
    groupElem.setAttribute("transform", `translate(10 ${yOffset - 20}) scale(.9)`);
    groupElem.appendChild(circle);
    groupElem.appendChild(check);
    groupElem.appendChild(circleOutline);

    // ✅ Add both text + check group to main group
    group.appendChild(text);
    group.appendChild(groupElem);

    checks.current.push({ check, circle });
  });

  // ✅ Animation setup
  const startTime = Date.now();
  let currentY = 0;

const totalHeight = verticalSpacing * (shuffledPhrases.current.length - 1) ;

const animatedIndexes = new Set<number>();

const animateLoading = () => {
  const now = Date.now();
  const delta = 0.3 * easeInOut(now); // Scroll speed
  currentY -= delta;
  group.setAttribute("transform", `translate(0 ${currentY})`);

  checks.current.forEach((item, i) => {
    const threshold = -i * verticalSpacing + verticalSpacing + 15;

    // Only update if not already animated
    if (currentY < threshold && !animatedIndexes.has(i)) {
      item.circle.setAttribute("fill", `rgba(255,255,255,1)`); // Set to full white
      item.check.setAttribute("fill", `rgba(255,120,154,1)`);  // Final check color
      animatedIndexes.add(i);
    }
  });

 if (Math.abs(currentY) < totalHeight) {
  requestAnimationFrame(animateLoading);
} else {
  // Reset position and animated states
  currentY = 0;
  animatedIndexes.clear();

  // Reset visuals
  checks.current.forEach(({ check, circle }) => {
    circle.setAttribute("fill", `rgba(255,255,255,0)`); // Make circle transparent
    check.setAttribute("fill", `white`);                // Reset check color
  });

  requestAnimationFrame(animateLoading); // Start again
}
};



  requestAnimationFrame(animateLoading);
}, []);

  const [progress, setProgress] = useState(0);

// Example: simulate webhook progress
useEffect(() => {
  const interval = setInterval(() => {
    setProgress((p) => {
      const next = Math.min(1, p + 0.02);
      if (next === 1) clearInterval(interval);
      return next;
    });
  }, 300);
  return () => clearInterval(interval);
}, []);

  return (
    <div className="loader-container" id="page" style={{display:"flex",flexDirection:"row",position:sx?.position ? sx?.position : "absolute"}}>
   

      {/* MIDDLE: Phrase Scroll */}
     
                    <img src={vidoeloaidng} style={{position:"absolute",zIndex:-1,height:"100%",objectFit:"cover",width:"100%",opacity:0.2}} />
                    {/* <img src={robotFace} style={{height:"400"}} /> */}
      <div className="phrase-box" id="phrase_box ">
        <svg width="400" height="300">
          <defs>
            <mask id="mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
              <linearGradient id="linearGradient" gradientUnits="objectBoundingBox" x2="0" y2="1">
                <stop stopColor="white" stopOpacity="0" offset="0%" />
                <stop stopColor="white" stopOpacity="1" offset="30%" />
                <stop stopColor="white" stopOpacity="1" offset="70%" />
                <stop stopColor="white" stopOpacity="0" offset="100%" />
              </linearGradient>
              <rect width="100%" height="100%" fill="url(#linearGradient)" />
            </mask>
          </defs>
          <g style={{ mask: "url(#mask)" }}>
            <g ref={phrasesRef} />
          </g>
        </svg>
      </div>

      {/* Optional Footer */}
     
    </div>
  );
};

export default AnimatedLoader;
