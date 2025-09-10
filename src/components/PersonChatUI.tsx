import React, { useState, useEffect, useRef } from "react";
import { Box, Avatar, Paper, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import picture from "../assests/lady1.png";
import { useLocation } from "react-router-dom";



// Animations
const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
`;

const fadeSlideUp = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;


// Floating animation
const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
`;

const bounce1 = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-4px); }
`;
const hashHints: Record<string, string> = {
  "#FileUpload": "If available, please upload your brand, product, or service guidelines in PDF format.\n\nThese guidelines will help shape the campaign’s overall style and look.",
  "#FileSummary": "This section shows a generated summary of the file you uploaded.\n\nReview it to ensure the key points match your brand’s guidelines and objectives before moving forward.",
  "#StrategicObjective": "Choose the objective that best matches the reason for creating this campaign.\n\nYou can also write your own in the last field.\n\nKeep it to one line that clearly states what you want this campaign to achieve.",
  "#TargetSegments": "Here you can choose your target audience.\n\nWho they are tells you the type of people, age groups show how old they are, and how they think/behave describes their mindset.\n\nPick the ones that best match your audience so your campaign feels relevant and effective.",
  "#AIGeneratedBase": "Please review the three sections carefully.\n\nBrand Positioning explains how your brand should be seen in the market.\n\nMessaging Pillars describe the key messages and values your campaign should highlight.\n\nConstraints list the rules and limits that must be respected, such as legal or ethical standards.\n\nThese points will directly shape the final visuals.\n\nIf something feels off or if you want to add emphasis, write your comments in the field to regenerate the strategy.",
  "#Goal": "Choose one of the base templates: Product, Service, Organization, Cultural, or Awareness, to guide your campaign.\n\nThe AI will then generate a clear campaign goal based on all the inputs you’ve provided so far.",
  "#AIGneeratedGoal": "This section shows the campaign goal created from all your previous inputs.\n\nRead it carefully, and you can use the pen icon if you want to edit, delete, or add details.\n\nOnce you’re satisfied, click Approve Campaign Goals to confirm and move forward.",
   "#Structure": "This section shows the full campaign structure, including the visual style and weekly breakdown. \n \nEach week includes a summary focus plus a detailed posting plan for every platform with date, time, and type of content (image or video). \n \nReview it carefully, and if needed, add comments or changes in the field, so that the AI can regenerate the structure based on your input."
};
const ComicHint = () => {
const location = useLocation()
  const { pathname ,hash} = location;
    const [hintText, setHintText] = useState("");
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
if (path.includes("creatCampaign/") && hashHints[hash]) {
    setHintText(hashHints[hash]);
  } else {
    setHintText(
      "To start a new campaign, click ‘New Campaign’ in the upper-left corner of the page and enter the campaign details.\n\nOnce created, it will appear here as a card. Just click on the card to open and manage your campaign."
    );
  }
  }, [location]);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [isCloudVisible, setIsCloudVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);


// Click anywhere handler
useEffect(() => {
  const handleClickAnywhere = () => {
    setVisibleLines([]);
    setIsCloudVisible(true);
  };

  document.addEventListener("mousedown", handleClickAnywhere);
  return () => document.removeEventListener("mousedown", handleClickAnywhere);
}, []);


const handleCloudClick = () => {
  setIsCloudVisible(false);
  setVisibleLines([]); // reset first

  const steps = ["", hintText]; // ✅ empty first, then full text
  let idx = 0;

  const interval = setInterval(() => {
    setVisibleLines((prev) => {
      const next = [...prev, steps[idx]];
      return next;
    });
    idx++;

    if (idx >= steps.length) {
      clearInterval(interval); // stop after both bubbles
    }
  }, 200); // delay between empty and text
};




  return (
    <Box
      ref={containerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      
        position: "relative",
        
      }}
    >
      {/* Hints above avatar */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "90%", maxWidth: 600,ml:"50px" }}>
        {visibleLines.map((line, idx) => (
          <Paper
            key={idx}
            elevation={4}
            sx={{
              px: 3,
              py: 1.5,
              alignSelf: "flex-start",
              borderRadius: 5,
              background: "linear-gradient(135deg, #3e876a, #3B82F6)",
              color: "white",
              position: "relative",
              animation: `${fadeSlideUp} 0.4s ease-out forwards`,
              whiteSpace: "pre-line",
              wordBreak: "break-word",
            
            //  mr:"80px",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -6,
                left: 15,
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "6px solid #3B82F6",
              },
            }}
          >
            <Typography variant="body1" sx={{ fontFamily: "Orbitron, sans-serif",letterSpacing:1}}>{line}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Avatar and cloud */}
      <Box sx={{ position: "relative", mt: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Cloud */}
        {isCloudVisible && (


<Box
      onClick={handleCloudClick}
      sx={{
        position: "relative",
        px: 4,
        py: 2,
        borderRadius: "50px",
        background: "linear-gradient(135deg, #3e876a, #3B82F6)",
        boxShadow: "0 8px 15px rgba(0,0,0,0.2)",
        display: hash== "#KeyDates" ? "none": "inline-flex",
        alignItems: "flex-start",
        justifyContent: "center",
        cursor: "pointer",
        mr:"100px",
        animation: `${float} 2s ease-in-out infinite`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: "0px 12px 25px rgba(0,0,0,0.3)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -10,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderTop: "10px solid #3B82F6",
        },
      }}
    >
      <Typography
        sx={{
          color: "white",
        //   fontWeight: "bold",
          animation: `${bounce1} 1s infinite`,
           fontFamily: "Orbitron, sans-serif",
        }}
      >
        Click here for help!
      </Typography>
    </Box>

          
        )}


        {/* Avatar */}
        <Avatar
          src={picture}
          alt="person"
          sx={{ width: "30vw", height: "auto", boxShadow: 0,borderRadius:0,
            "& .MuiAvatar-root":{
                borderRadius:0
            },
            "& .MuiAvatar-img":{
                marginLeft:"-150px"
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default ComicHint;
