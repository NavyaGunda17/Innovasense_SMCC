import React, { JSX, useEffect, useState } from "react";
import {
  Popover,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Button,
  Divider,
} from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";
import MusicNoteIcon from "@mui/icons-material/MusicNote"; // for TikTok
import AppButton from "./AppButton";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { supabase } from "../lib/supabaseClient";
import { setGeneratedCampaignstructure, setWeekId } from "../reducer/campaignSlice";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedLoader from "./AnimatedLoader";
import { useError } from "../context/ErrorToastContext";
import { useInfo } from "../context/InfoToastContext";

const DAYS_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type Post = {
  day: string;
  date: string;
  time: string;
  content_type: string;
};

type WeekData = {
  week_number: string;
  theme: string;
  content_focus: string;
  schedule: Record<string, Post[]>;
};

type Props = {
  campaignWeeks: WeekData[];
  handleViewCampaign: (weekId: any) => void;
};

const platformColors: Record<string, string> = {
  LinkedIn: "#0077b5",
  X: "#000000",
  Instagram: "#d6249f",
  TikTok: "#25f4ee",
};

const platformIcons: Record<string, JSX.Element> = {
  LinkedIn: <LinkedInIcon />,
  X: <TwitterIcon />,
  Instagram: <InstagramIcon />,
  TikTok: <MusicNoteIcon />,
};

export const CalendarComponent1: React.FC<Props> = ({
  campaignWeeks,
  handleViewCampaign,
}) => {
  console.log("campaignWeeks", campaignWeeks);

  const [showLoader, setShowLoader] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [popoverData, setPopoverData] = useState<null | {
    platform: string;
    post: Post;
  }>(null);
  const { showErrorToast } = useError();

  const handleIconClick = (
    event: React.MouseEvent<HTMLElement>,
    platform: string,
    post: Post
  ) => {
    setAnchorEl(event.currentTarget);
    setPopoverData({ platform, post });
  };

  const handleClose = () => {
    setAnchorEl(null);
    setPopoverData(null);
  };

  const open = Boolean(anchorEl);
  const campaignState: any = useSelector((state: RootState) => state.campaign);

  const companyId = useSelector((state: RootState) => state.auth.companyId);
    const [inProgressMap, setInProgressMap] = useState<Record<string, boolean>>({});


    const handleGenerateClick = async (week_number:any) => {

       setInProgressMap(prev => ({ ...prev, [week_number]: true }));
      await handleViewCampaignParent(week_number); // triggers webhook
      //  setInProgressMap(prev => ({ ...prev, [week_number]: false }));
    };
  const { showInfoToast } = useInfo();

  useEffect(()=>{

  },[inProgressMap])
  useEffect(()=>{

},[campaignState])

  const handleViewCampaignParent = async (weekNumber: any) => {
     showInfoToast(
      "Initated the process to generate the master article for week."
    );
    // renderData()
    setShowLoader(true);
    const keyToFind = `week_${weekNumber}`;
    console.log("keyToFind", keyToFind);
  //   if (campaignState?.campaignMasterArticle.length > 0) {
  //     const index = campaignState?.campaignMasterArticle.findIndex(
  //       (obj: any) => keyToFind in obj
  //     );
  //     if (index >= 0) {
  //       // handleViewCampaign(weekNumber);
  //       setShowLoader(false);
  //       renderData();
  // return;
  //     }
  //   }


     if (campaignState?.campaignMasterArticleJson.length > 0) {
      const index = campaignState?.campaignMasterArticleJson.findIndex(
        (obj: any) => keyToFind in obj
      );
      if (index >= 0) {
        // handleViewCampaign(weekNumber);
        setShowLoader(false);
        renderData();
  return;
      }
    }

    setTimeout(() =>{
       setShowLoader(false);
    },2000)
    try {
      const response = await fetch(
        "https://innovasense.app.n8n.cloud/webhook/smcc/brain",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyId: companyId,
            campaignId: campaignState?.campaignId,
            intent: "Campaign master article",
            content: {
              campaignMasterArticleComments: "",
              weekNumber: weekNumber,
              subTask: "generate",
              postIndex: "",
              platform: "",
            },
          }),
        }
      );


      const result = await response.json();

      if (result[0].output.status == "fail") {
        showErrorToast("Error in generating the campaign Master article");
        // showErrorToast('Failed to trigger webhook');
        setShowLoader(false);
        return false 
      }
      // showSuccessToast('Webhook triggered successfully');
 dispatch(setWeekId({weekId:weekNumber}))
      // handleViewCampaign(weekNumber);
      setShowLoader(false);
      renderData()
      //   setShowCampaignGoal(true)
    } catch (error) {
      showErrorToast("Error in generating the campaign Master article");
      setShowLoader(false);
      renderData()
      // showErrorToast('Error triggering webhook:');
    }
  };
  const dispatch = useDispatch();

  const renderData = async () => {
    const data: any = await supabase
      .from("campaignInput")
      .select("*")
      .eq("campaignId", campaignState?.campaignId)
      .single();
    console.log(data.data);
    const campaignStructureSummary = data?.data?.campaignStructureSummary;
    console.log(
      "calendar componet",
      campaignStructureSummary,
      data?.data?.campaignStructureJson
    );
    dispatch(
      setGeneratedCampaignstructure({
        campaignStructureSummary: campaignStructureSummary,
        campaignStructureJson: data?.data?.campaignStructureJson,
        campaignMasterArticle: data?.data?.campaignMasterArticle,
        campaignMasterArticleJson: data?.data?.campaignMasterArticleJson,
      })
    );
    // if (data?.data?.campaignMasterArticle?.length > 0) {
    //   data?.data?.campaignMasterArticle.forEach((article: any) => {
    //     const weekKey = Object.keys(article)[0]; // e.g., "week_2"
    //     const weekNum = weekKey.replace("week_", "");
    //     setInProgressMap(prev => ({ ...prev, [weekNum]: false }));
    //   });
    // }
      if (data?.data?.campaignMasterArticleJson?.length > 0) {
      data?.data?.campaignMasterArticleJson.forEach((article: any) => {
        const weekKey = Object.keys(article)[0]; // e.g., "week_2"
        const weekNum = weekKey.replace("week_", "");
        setInProgressMap(prev => ({ ...prev, [weekNum]: false }));
      });
    }
  };
  useEffect(() => {
    renderData();
    console.log("calendar componet", campaignWeeks);
  }, []);


  useEffect(() => {
      let channel: any;
  
      const subscribeRole = () => {
        if (campaignState?.campaignId) {
          channel = supabase
            .channel("row-listener")
            .on(
              "postgres_changes",
              {
                event: "*", // or 'UPDATE' if you want specific
                schema: "public",
                table: "campaignInput", // change this to your table name
                filter: `campaignId=${campaignState?.campaignId}`,
              },
              (payload) => {
                console.log("Row updated:", payload);
                const updatedData: any = payload.new;
                renderData();
               
                
              }
            )
            .subscribe((status) => {
              if (status === "SUBSCRIBED") {
                console.log("✅ Subscribed to row changes");
              } else if (status === "CHANNEL_ERROR") {
                console.error("❌ Error subscribing to row");
              }
            });
        }
      };
  
      subscribeRole();
  
      const handleVisibility = () => {
        if (document.visibilityState === "visible") {
          console.log("🔄 Tab activated — refreshing connection");
          if (channel) supabase.removeChannel(channel);
          subscribeRole();
        }
      };
  
      document.addEventListener("visibilitychange", handleVisibility);
  
      return () => {
        if (channel) supabase.removeChannel(channel);
        document.removeEventListener("visibilitychange", handleVisibility);
      };
    }, []);

  return (
    <div
      style={{
        overflowX: "auto",
        fontFamily: "sans-serif",
        padding: "30px",
        maxHeight: "75vh", // limit height
        overflowY: "auto", // enable scroll
        scrollbarWidth: "none",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {campaignWeeks &&
          campaignWeeks.map((week, index) => {
            const keyToFind = `week_${week.week_number}`;
  
            // Check if master article exists for this week
            // const articleExists =
            //   campaignState?.campaignMasterArticle?.length > 0 &&
            //   campaignState.campaignMasterArticle.findIndex(
            //     (obj: any) => keyToFind in obj
            //   ) >= 0;
const articleExists =
              campaignState?.campaignMasterArticleJson?.length > 0 &&
              campaignState.campaignMasterArticleJson.findIndex(
                (obj: any) => keyToFind in obj
              ) >= 0;

              
                const inProgress = inProgressMap[week.week_number] || false; // per-week

            return (
              <Box
                key={week.week_number}
                sx={{
                  // backgroundColor: '#1e1e1e',
                  backgroundColor: index % 2 === 0 ? "#1e1e1eb8" : "#4e4c4cba", // alternate colors
                  borderRadius: "16px",
                  p: 3,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  transition: "0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                    transform: "translateY(-4px)"
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" color="white" gutterBottom>
                    Week {week.week_number} — {week.theme}
                  </Typography>
                  {/* <Typography variant="body2" sx={{ color: '#ccc', mb: 2 }}>
        {week.content_focus}
      </Typography> */}
  {/* {inProgress && (
            <Box
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: 2,
                backgroundColor: "#f39c12",
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              In Progress
            </Box>
          )}
                  <AppButton
                    sx={{
                      mb: 2,
                      background: "transparent",
                      border: "1px solid white",
                      "&:hover": {
                        background: "#6B73FF",
                        borderColor: "#6B73FF",
                      },
                    }}
                    onClick={() => handleGenerateClick(week.week_number)}
                  >
                    {articleExists
                      ? "View Master Article"
                      : "Generate Master Article"}
                  </AppButton>
 */}

{!inProgress && (
    <AppButton
                    sx={{
                      mb: 2,
                      background: "transparent",
                      border: "1px solid white",
                      "&:hover": {
                        background: "#6B73FF",
                        borderColor: "#6B73FF",
                      },
                    }}
                    onClick={() => articleExists ? handleViewCampaign(week.week_number) : handleGenerateClick(week.week_number)}
                  >
                    {articleExists
                      ? "View Master Article"
                      : "Generate Master Article"}
                  </AppButton>

)}
    

                 
          {inProgress && !articleExists && (
            <Box
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: 2,
                backgroundColor: "#573705",
                color: "#ec9c1f",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              In Progress
            </Box>
          )}
       
                </Box>

                <Divider sx={{ border: "0.5px solid #404040", mb: 3 }} />
                <Typography
                  color="white"
                  gutterBottom
                  sx={{ fontSize: "18px", fontFamily: "Orbitron,sans-serif" }}
                >
                  Content Focus:
                </Typography>
                <Typography
                  color="white"
                  gutterBottom
                  sx={{ fontSize: "14px" }}
                >
                  {week.content_focus}
                </Typography>
                {/* Grid of days */}
                <Box
                  sx={{
                    // display: 'grid',
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 2,
                    display: "none",
                  }}
                >
                  {DAYS_ORDER.map((day) => {
                    const postsForDay: { platform: string; post: Post }[] = [];

                    Object.entries(week.schedule).forEach(
                      ([platform, posts]) => {
                        posts.forEach((post) => {
                          if (post.day.toLowerCase() === day.toLowerCase()) {
                            postsForDay.push({ platform, post });
                          }
                        });
                      }
                    );

                    return (
                      <Box
                        key={day}
                        sx={{
                          backgroundColor: "#404040",
                          borderRadius: 2,
                          p: 2,
                          transition: "0.3s",
                          minHeight: 100,
                          "&:hover": {
                            backgroundColor: "#333",
                          },
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: "#fff",
                            mb: 1,
                            borderBottom: "1px solid #444",
                            pb: 0.5,
                          }}
                        >
                          {day}
                        </Typography>

                        {postsForDay.length > 0 ? (
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {postsForDay.map(({ platform, post }, idx) => (
                              <Tooltip
                                key={idx}
                                title={`${platform}: ${post.content_type}`}
                              >
                                <IconButton
                                  size="small"
                                  onClick={(e) =>
                                    handleIconClick(e, platform, post)
                                  }
                                  sx={{
                                    color: platformColors[platform] || "gray",
                                    backgroundColor: "#fff",
                                    borderRadius: 1,
                                    transition: "0.2s",
                                    "&:hover": {
                                      backgroundColor:
                                        platformColors[platform] + "22", // add light overlay
                                      transform: "scale(1.1)",
                                    },
                                  }}
                                >
                                  {platformIcons[platform] || "📱"}
                                </IconButton>
                              </Tooltip>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: "#aaa" }}>
                            No Posts
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
      </Box>

      {/* Popover for post details */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        {popoverData && (
          <Box p={2} maxWidth={300}>
            <Typography variant="subtitle2" gutterBottom>
              {popoverData.platform}
            </Typography>
            <Typography variant="body2">
              <strong>Date:</strong> {popoverData.post.date}
            </Typography>
            <Typography variant="body2">
              <strong>Time:</strong> {popoverData.post.time}
            </Typography>
            <Typography variant="body2" mt={1}>
              <strong>Content:</strong> {popoverData.post.content_type}
            </Typography>
          </Box>
        )}
      </Popover>

      {showLoader && (
        <Box sx={{ height: "100vh" }}>
          <AnimatedLoader />
        </Box>
      )}
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: "10px",
  //   background: "#f0f0f0",
  border: "1px solid #3b3939",
  textAlign: "center",
  minWidth: 120,
};

const tdStyle: React.CSSProperties = {
  padding: "10px",
  borderRight: "1px solid #3b3939",
  borderBottom: "1px solid #3b3939",
  verticalAlign: "top",
  minWidth: 120,
};
const headlineStyle: React.CSSProperties = {
  backgroundColor: "rgb(121 118 118)",
  padding: "12px 16px",
  fontSize: "14px",
  //   borderTop: "2px solid #ccc",
  //   borderBottom: "1px solid #ddd",
};
