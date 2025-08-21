import React from "react";
import Ocean from "../assests/ocean.jpg";
import sky from "../assests/sky.jpg";
import "./StarDustContainer.css";
import { useLocation } from "react-router-dom";

type StarData = {
  class: string;
  startX: string;
  startY: string;
  endX: string;
  endY: string;
  duration: number;
  delay: number;
  rotation: number;
};

type StarDustProps = {
  isAuthPage: any;
};
const StarDustContainer: React.FC<StarDustProps> = ({ isAuthPage }) => {
  const generateStarData = (index: number): StarData => {
    const sizes = ["star-small", "star-medium", "star-large"];
    const weights = [0.6, 0.3, 0.1];
    const rand = Math.random();

    const starClass =
      rand < weights[0]
        ? sizes[0]
        : rand < weights[0] + weights[1]
        ? sizes[1]
        : sizes[2];

    const startSide = Math.floor(Math.random() * 4);
    let startX: number, startY: number, endX: number, endY: number;

    switch (startSide) {
      case 0: // From top
        startX = Math.random() * 100;
        startY = -5;
        endX = Math.random() * 100;
        endY = 105;
        break;
      case 1: // From right
        startX = 105;
        startY = Math.random() * 100;
        endX = -5;
        endY = Math.random() * 100;
        break;
      case 2: // From bottom
        startX = Math.random() * 100;
        startY = 105;
        endX = Math.random() * 100;
        endY = -5;
        break;
      case 3: // From left
      default:
        startX = -5;
        startY = Math.random() * 100;
        endX = 105;
        endY = Math.random() * 100;
        break;
    }

    return {
      class: starClass,
      startX: `${startX}vw`,
      startY: `${startY}vh`,
      endX: `${endX}vw`,
      endY: `${endY}vh`,
      duration: 25 + Math.random() * 30,
      delay: Math.random() * 20,
      rotation: Math.random() * 720 - 360,
    };
  };

  const location = useLocation();
  const { pathname } = location;

  const isAuthPage1 =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/campaignList";

  return (
    <div className="stardust-wrapper">
      <div className="background-container">
        <div className="background-image-wrapper">
          <img
            src={isAuthPage1 ? sky : Ocean}
            alt={isAuthPage1 ? "Ocean background" : "Sky background"}
            className="background-image"
          />
        </div>
      </div>

      <div className="star-dust-container">
        {Array.from({ length: 60 }, (_, i) => {
          const starData = generateStarData(i);

          const style: React.CSSProperties & { [key: string]: any } = {
            "--start-x": starData.startX,
            "--start-y": starData.startY,
            "--end-x": starData.endX,
            "--end-y": starData.endY,
            "--duration": `${starData.duration}s`,
            "--delay": `${starData.delay}s`,
            "--rotation": `${starData.rotation}deg`,
            animation: `randomFloat var(--duration) infinite linear`,
            animationDelay: `var(--delay)`,
          };

          return (
            <div key={i} className={`star ${starData.class}`} style={style} />
          );
        })}
      </div>
    </div>
  );
};

export default StarDustContainer;
