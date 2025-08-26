
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { setGeneratedCampaignDetails } from "../../reducer/campaignSlice";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useSelector } from "react-redux";
import AI_lgo from "../../assests/AI_logo.png"

const TriangleCardLayout: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>("brand");
    const campaignState = useSelector( (state:RootState )=> state.campaign )
  useEffect(()=>{
    renderData()
  },[])
  const dispatch = useDispatch<AppDispatch>()
   const renderData = async () => {
    try {
      const { data, error } = await supabase
        .from('campaignInput')
        .select('*')
        .eq('campaignId', campaignState?.campaignId)
        .single();
  
      if (error) {
        console.error('Supabase error:', error.message);
        return;
      }
  
      if (!data) {
        console.warn('No campaign data found.');
        return;
      }
  
      dispatch(setGeneratedCampaignDetails({
        brandValue: data.brandValue || '',
        brandSupport: data.brandSupport || '',
        messagingPillars: Array.isArray(data.messagingPillars) ? data.messagingPillars : [],
        constraints: Array.isArray(data.constraints) ? data.constraints : [],
        brandTone: data.brandTone || '',
      }));
    } catch (err) {
      console.error('Unexpected error fetching campaign data:', err);
    }
  };
  

  useEffect(()=>{
  
  },[campaignState])
  

  const variables = [
      {
        key: "brand",
        title: "Brand Positioning",
        subTitle:campaignState?.brandValue,
        content: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
             <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "16px",fontFamily: 'Orbitron, sans-serif' }}>
              Value:
            </Typography>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "16px" }}>
              {campaignState?.brandValue || "-"}
            </Typography>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "16px",fontFamily: 'Orbitron, sans-serif',mt:2 }}>
              Support:
            </Typography>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "16px" }}>
              {campaignState?.brandSupport || "-"}
            </Typography>
             <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "16px",fontFamily: 'Orbitron, sans-serif',mt:2 }}>
              Tone:
            </Typography>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "16px" }}>
             {campaignState?.brandTone || "-"}
            </Typography>
          </Box>
        ),
      },
      {
        key: "messaging",
        title: "Messaging Pillars",
          subTitle:campaignState?.messagingPillars && campaignState?.messagingPillars[0] && campaignState?.messagingPillars[0]?.pillar,
        content: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {campaignState?.messagingPillars && campaignState?.messagingPillars?.length > 0 ? (
              campaignState.messagingPillars.map((data: any, idx: number) => (
                <Typography key={idx} sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "16px" }}>
                  {data?.pillar || "-"}
                </Typography>
              ))
            ) : (
              <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "16px" }}>No pillars defined.</Typography>
            )}
          </Box>
        ),
      },
      {
        key: "constraints",
        title: "Constraints",
         subTitle:campaignState?.constraints?.[0]?.items[0]?.description,
        content: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {["Legal", "Cultural", "Values"].map((section, i) => (
              <Box key={section}>
                <Typography
                  sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "16px", fontWeight: "bold",fontFamily: 'Orbitron, sans-serif' }}
                >
                  {section}:
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1,mb:2 }}>
                  {campaignState?.constraints?.[i]?.items?.map(
                    (item: any, idx: number) => (
                      <Typography
                        key={`${section.toLowerCase()}-${idx}`}
                        sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "16px" }}
                      >
                        {item["description"] || "-"}
                      </Typography>
                    )
                  ) || (
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "16px" }}>
                      No {section.toLowerCase()} constraints.
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        ),
      },
    ];

  const renderCard = (variable: any, index: number) => {
    const isSelected = selectedCard === variable.key;

    return (
      <Box
       component={motion.div}
  key={variable.key}
  initial={{ scale: 1 }}
  animate={{
    scale: isSelected ? 1.2 : 1,
    zIndex: isSelected ? 10 : 1,
  }}
  transition={{ duration: 0.3 }}
  sx={{
    width: isSelected ? "350px" : "300px",
    height: isSelected ? "400px" : "300px",
    borderRadius: "16px",
    position: "relative",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255,255,255,0.2)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    color: "white",
    cursor: "pointer",
    padding: "1.5rem",
    overflowY: "auto",
    textAlign: "left",
    scrollbarWidth: "none", // Firefox
    msOverflowStyle: "none", // IE 10+
    "&::-webkit-scrollbar": {
      display: "none", // Chrome, Safari
    },
  }}
        onClick={() => setSelectedCard(variable.key)}
      >
        <Typography variant="h6" sx={{ mb: 2 ,
            fontFamily: 'Orbitron, sans-serif'

        }}>
           {!isSelected && (
           <img src={AI_lgo} style={{width:"30px",marginRight:"5px",verticalAlign:"middle",position:"absolute",top:"7px",right:"7px"}}/>
        )}

         
          {variable.title}
        </Typography>

        {isSelected ? (
          <Box>{variable.content}</Box>
        ) : (
        //   <Typography
        //     variant="body2"
        //     sx={{ opacity: 0.6, fontStyle: "italic" }}
        //   >
        //     {variable.content}
        //     Click to expand
        //   </Typography>
<>
          <Box
    sx={{
      display: "-webkit-box",
     maxHeight: "210px",
    overflow: "hidden",
      textOverflow: "ellipsis",
      opacity: 0.85,
      fontStyle: "italic",
      fontSize: "14px",
     
      mb:2
    }}
  >
    {variable.content}
    
  </Box>
<a > Click to expand</a>
</>
        )}

        {isSelected && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCard(null);
            }}
            sx={{ position: "absolute", top: 8, right: 8, color: "white" }}
          >
             <img src={AI_lgo} style={{width:"30px",marginRight:"5px",verticalAlign:"middle",position:"absolute",top:"7px",right:"28px"}}/>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
    );
  };
const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;

     // Don't close if the click was on a button with a specific ID or class
  if (target.closest(".next-button")) {
    return;
  }

    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setSelectedCard(null);
    }
  };

  if (selectedCard) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [selectedCard]);

  return (
    <Box
     ref={containerRef}
      sx={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        mt: 6,
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 4,
          justifyContent: "center",
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        {variables.map(renderCard)}
      </Box>
    </Box>
  );
};

export default TriangleCardLayout;
