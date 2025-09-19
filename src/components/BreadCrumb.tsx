import { Box, Typography, IconButton } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { supabase } from "../lib/supabaseClient";

const BreadCrumnb = ({  onNavigate }: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const campaignState = useSelector((state: RootState) => state?.campaign);
  const campaignId = useSelector(
    (state: RootState) => state.campaign.campaignId
  );
    const [activeItem, setActiveItem] = useState<string>("Campaigns");
   const [showPost, setShowPost] = useState(false);
     const companyId = useSelector((state: RootState) => state.auth.companyId);
     const [weeks, setWeeks] = useState<string[]>([]);
   
  const items = [
    { name: "File Upload", objectiveName: "FileUpload" },
    { name: "File Summary", objectiveName: "FileSummary" },
    { name: "Strategic Objective", objectiveName: "StrategicObjective" },
    { name: "Target Segments", objectiveName: "TargetSegments" },
    { name: "Key Dates", objectiveName: "KeyDates" },
    { name: "AI Generated Brand Strategy", objectiveName: "AIGeneratedBase" },
    { name: "Goal", objectiveName: "Goal" },
    { name: "AI Generated Goal", objectiveName: "AIGneeratedGoal" },
    { name: "Structure", objectiveName: "Structure" },
    { name: "Calendar", objectiveName: "" },
    // { name: "Posts", objectiveName: "" },
  ];

  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };


      useEffect(() => {
      if (!campaignId || !companyId) return;
  
      const checkExisting = async () => {
        const { data } = await supabase
          .from("postList")
          .select("*")
          .eq("campaignId", campaignId)
          .eq("companyId", companyId);
  
        if (data && data.length > 0) {
          setShowPost(true);
  const uniqueWeeks = Array.from(new Set(data.map((d: any) => d.week)));
         setWeeks(uniqueWeeks.sort((a, b) => a - b)); // ascending
  
        } else {
          setShowPost(false);
        }
      };
  
      checkExisting();
    }, [campaignId, companyId,campaignState?.campaignMasterArticleJson]);
  

  const isItemEnabled = (itemName: string) => {
    const pathname = location.pathname;

    if (pathname === "/campaignList") return itemName === "Campaigns";

    const alwaysEnabled = [
      "Campaigns",
      "File Upload",
      "Strategic Objective",
      "Target Segments",
      "Key Dates",
    ];
    if (alwaysEnabled.includes(itemName)) return true;

    if (itemName === "AI Generated Brand Strategy" || itemName === "Goal")
      return !!campaignState?.brandTone;

    if (itemName === "File Summary") return !!campaignState?.generatedFileSummary;
    if (itemName === "AI Generated Goal") return !!campaignState?.generatedCampaignGoal;
    if (itemName === "Structure") return !!campaignState?.campaignStructureSummary;
    if (itemName === "Calendar") return !!campaignState?.campaignStructureSummary;
    if (itemName === "Posts") return showPost;

    return false;
  };

  // Handle breadcrumb click
  const handleItemClick = (item: any) => {
    setIndex(items.findIndex((i) => i.name === item.name));

    if (
      [
        "File Upload",
        "File Summary",
        "Strategic Objective",
        "Target Segments",
        "Goal",
        "AI Generated Goal",
        "Key Dates",
        "AI Generated Brand Strategy",
        "Structure",
      ].includes(item.name)
    ) {
      navigate(`/creatCampaign/${campaignId}#${item.objectiveName}`);
    }

    if (item.name === "Campaigns") navigate(`/campaignList`);
    if (item.name === "Calendar") navigate(`/campaignCalendar/${campaignId}`);

    if (onNavigate) onNavigate(item);

    if (item.name === "Posts") {
      // toggle post menu here
      return;
    }
  };

useEffect(() => {
  const hash = location.hash?.replace("#", "").toLowerCase();
  const pathname = location.pathname.toLowerCase();

  // First try to match hash with objectiveName
  const matchedItem = items.find(
    (item) => item.objectiveName.toLowerCase() === hash
  );

  if (matchedItem) {
    setActiveItem(matchedItem.name);
    setIndex(items.findIndex((i) => i.name === matchedItem.name));
    return;
  }

  // Match pathname-based routes
  if (pathname.includes("/campaigncalendar")) {
    setActiveItem("Calendar");
    setIndex(items.findIndex((i) => i.name === "Calendar"));
  } else if (pathname.includes("/campaignweekdetails") || pathname.includes("/posts")) {
    setActiveItem("Posts");
    setIndex(items.findIndex((i) => i.name === "Posts"));
  } else if (pathname.includes("/campaignlist")) {
    setActiveItem("Campaigns");
    setIndex(items.findIndex((i) => i.name === "Campaigns"));
  }
}, [location.pathname, location.hash, items]);
const itemRefs = useRef<Array<HTMLDivElement | null>>([]);


useEffect(() => {
  if (itemRefs.current[index]) {
    itemRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }
}, [index]);
  return (

    <Box sx={{ display: "flex", alignItems: "center", width: "60vw",margin:"auto" }}>
      {/* Left Arrow */}
      <IconButton onClick={() => scroll("left")} sx={{ color: "white", mr: 1 }}>
        <ChevronLeft />
      </IconButton>

      {/* Breadcrumb Container */}
      <Box ref={scrollRef} sx={{ flex: 1, overflow: "hidden", whiteSpace: "nowrap" }}>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          {items.map((item, idx) => {
            const enabled = isItemEnabled(item.name);

            return (
              <React.Fragment key={idx}>
                <Box
                  ref={(el: HTMLDivElement | null) => {
          itemRefs.current[idx] = el;
        }}

                  onClick={() => enabled && handleItemClick(item)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: idx === index ? "#fff" : enabled ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
                    cursor: enabled ? "pointer" : "not-allowed",
                    opacity: enabled ? 1 : 0.5,
                    transition: "all 0.3s ease",
                    "&:hover": enabled ? {  color: "#fff" } : {},
                  }}
                >
                  <Box
                    sx={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      backgroundColor: idx === index && enabled ? "rgba(255,255,255,0.15)" : "transparent",
                      border: idx === index && enabled ? "none" : "1px solid rgba(255,255,255,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "8px",
                      transition: "all 0.3s ease",
                      "&:hover": enabled ? { backgroundColor: "rgba(255,255,255,0.15)" } : {},
                    }}
                  >
                    {idx + 1}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: idx === index ? "600" : "400",
                      color: idx === index && enabled ? "white" : enabled ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)",
                      "&:hover": enabled ? {  color: "#fff" } : {},

                    }}
                  >
                    {item.name}
                  </Typography>
                </Box>

                {idx < items.length - 1 && (
                  <Box
                    sx={{
                      width: "40px",
                      height: "1px",
                      backgroundColor: "rgba(255,255,255,0.2)",
                      margin: "0 8px",
                      flexShrink: 0,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Box>
      </Box>

      {/* Right Arrow */}
      <IconButton onClick={() => scroll("right")} sx={{ color: "white", ml: 1 }}>
        <ChevronRight />
      </IconButton>
    </Box>
  
  );
};

export default BreadCrumnb;
