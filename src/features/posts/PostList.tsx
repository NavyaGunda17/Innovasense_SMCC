import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Skeleton,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { setCampaignMasterArticleWeekevent, setGeneratedCampaignstructure, setGeneratedXTwitter } from "../../reducer/campaignSlice";
import { useDispatch } from "react-redux";
import HamburgerMenu from "../../components/HamburgerMenu";
import { AnimatePresence, motion } from "framer-motion";
import AppButton from "../../components/AppButton";
import RegenerateAssistant from "./RegenerationAssistant";
import { useInfo } from "../../context/InfoToastContext";

// Types here (or import from separate file)
type Post = {
  type: string;
  day: string;
  date: string;
  time: string;
  mediaType: string;
  index: string | number;
  url?: string;
  caption?: string;
  hashtags?: string[];
};

type PlatformData = {
  "Platform name": string;
  "The Narrative": string;
  "Visual Prompt": string;
  "Post Schedule": Post[];
};

type Platforms = {
  [platformKey: string]: PlatformData;
};

type CampaignWeekData = {
  weekKey: string;
  Week: string;
  companyId: string;
  campaignId: string;
  campaignMasterArticleComments: string;
  "Campaign Strategy": string;
  platforms: Platforms;
};

const PostList: React.FC = () => {
  const { campaignId, weekId } = useParams();
  const companyId = useSelector((state: RootState) => state.auth.companyId);
  const campaignStateWeekEvent = useSelector(
    (state: RootState) => state.campaign.campaignMasterWeekEvent
  );
  const dispatch = useDispatch<AppDispatch>();
  const [weekData] = useState<any>(campaignStateWeekEvent);
  const [expandedPost, setExpandedPost] = useState<{
    post: Post;
    platform: string;
  } | null>(null);
  const [postList, setPostList] = useState<any>();
  const [weekDetails, setWeekDetails] = useState<any>(campaignStateWeekEvent);

   const campaignStateMarticleJson = useSelector(
    (state: RootState) => state.campaign.campaignMasterArticleJson
  );

  const { showInfoToast } = useInfo()

  useEffect(()=>{
transformMasterArtickeJSON()
  },[campaignStateMarticleJson])

  useEffect(() => {
    if (campaignStateWeekEvent) {
      setWeekDetails(campaignStateWeekEvent);
    }
  }, [campaignStateWeekEvent]);


  useEffect(() => {
  if (
    campaignStateWeekEvent &&
    campaignStateMarticleJson
  ) {
    renderData();
  }
}, [campaignStateWeekEvent, campaignStateMarticleJson]);


const transformMasterArtickeJSON = () => {
 if(weekId){
 const index = parseInt(weekId, 10);
  const keyName = `week_${index}`
  if (!campaignStateMarticleJson || !keyName) return;

  const foundIndex = campaignStateMarticleJson.findIndex(
    (obj: Record<string, any>) => Object.keys(obj)[0] === keyName
  );

  if (foundIndex !== -1) {
    const rawJsonString = campaignStateMarticleJson[foundIndex][keyName];

    try {
      const parsed = JSON.parse(rawJsonString);
      const parsedWeek = { weekKey: keyName, ...parsed };
      console.log("parsedWeek",parsedWeek)
      dispatch(setCampaignMasterArticleWeekevent({ campaignMasterWeekEvent: parsedWeek }));
      setWeekDetails(parsedWeek); // still using array to reuse rendering logic
      renderData()
    } catch (error) {
      console.error(`Failed to parse ${keyName}`, error);
    }
  }
  }
}
 

  const handleGeneratePost = (platform: string) => {
    showInfoToast("Be mindful that image & video generation might take few moments.")
    handleGeneratePostForPlatform(platform);
  };

  // Generate posts per platform by triggering webhook
  const handleGeneratePostForPlatform = async (platform: string) => {
    try {
      const response = await fetch(
        "https://innovasense.app.n8n.cloud/webhook/smcc/brain",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId,
            campaignId: campaignId,
            intent: "Campaign post",
            content: {
              campaignPostComments: "",
              weekNumber: weekId,
              subTask: "generate",
              platform: platform,
            },
          }),
        }
      );

        const result = await response.json();


      if (result[0].output.status == "fail") {
        console.error("Failed to trigger webhook");
        return false
      }

      // renderData();
    } catch (error) {
      console.error("Error triggering webhook:", error);
    }
  };

  const renderData = async () => {
   
    const { data } = await supabase
      .from("postList")
      .select("*")
      .eq("campaignId", campaignId)
      .eq("companyId", companyId)
      .eq("week", weekId)
      .single();

    console.log("renderData PostList", data,weekDetails);
    if (data) {
      // dispatch(setGeneratedXTwitter({ xTwitterPostList: [data] }));
      setPostList(data);

      if (weekDetails?.platforms) {
        const combinedSchedule = combineScheduleWithPosts(data, weekDetails?.platforms);
        console.log("combinedSchedule",combinedSchedule)
        setWeekDetails((prev: any) => ({
          ...prev,
          schedule: combinedSchedule,
        }));
      }
    }
  };

useEffect(()=>{

},[weekDetails])






useEffect(() => {
  let channel: any;
  let isSubscribed = false;

  const subscribeRole = async () => {
    if (campaignId && !isSubscribed) {
      channel = supabase
        .channel("row-listener")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "postList",
          },
          (payload) => {
            console.log("Realtime event:", payload);
            // Optional: check payload before updating
            renderData();
          }
        );

      await channel.subscribe();
      isSubscribed = true;
    }
  };

  const unsubscribeRole = () => {
    if (channel && isSubscribed) {
      supabase.removeChannel(channel);
      isSubscribed = false;
    }
  };

  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      unsubscribeRole();
      subscribeRole();
    }
  };

  // Initial subscribe
  subscribeRole();

  // Attach listener
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    unsubscribeRole();
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, []);




  const toCamelCase = (str: string): string => {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
      .replace(/^(.)/, (c) => c.toLowerCase());
  };

const combineScheduleWithPosts = (
  postListData: any,
  platforms: Platforms
): Platforms => {
  const result: Platforms = {};

  Object.entries(platforms).forEach(([platformKey, platformData]) => {
    const scheduledPosts = platformData["Post Schedule"] || [];

    const postListKey = toCamelCase(platformKey); // e.g., Instagram -> instagram
    const generatedPosts = postListData?.[postListKey] || [];

    if (generatedPosts.length === 0) {
      result[platformKey] = {
        ...platformData,
      
      };
      return; // Exit early for this platform
    }

    const mergedPosts = scheduledPosts.map((scheduledPost: any) => {
      const index = Number(scheduledPost?.index ? scheduledPost?.index : scheduledPost?.indexType) - 1;
      const generated = index >= 0 ? generatedPosts[index] : undefined;

      return {
        ...scheduledPost,
        url: generated?.url ?? scheduledPost.url,
        caption: generated?.caption ?? scheduledPost.caption,
        hashtags: generated?.hashtags ?? scheduledPost.hashtags,
      };
    });

    result[platformKey] = {
      ...platformData,
      ["Post Schedule"]: mergedPosts,
    };
  });

  return result;
};

  const [showAssistant, setShowAssistant] = useState(false);
  const handleRegenerate = async(data: {
    platforms: string[];
    events: string[];
    contentType: string;
    command: string;
    selectedPosts?: any;
  }) => {
    console.log("Regenerating:", data);
    setShowAssistant(false);
     showInfoToast("Be mindful that image & video generation might take few moments.")
        try {
      const response = await fetch(
        "https://innovasense.app.n8n.cloud/webhook/smcc/brain",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId,
            campaignId: campaignId,
            intent: "Campaign post",
            content: {
              campaignPostComments: data.command,
              weekNumber: weekId,
              subTask: data.contentType == "" ? "regenerate" : data.contentType == "text" ? "regenerateText" :"regenerateMedia",
              platform: data.platforms[0],
              postIndex:data.selectedPosts,

            },
          }),
        }
      );

        const result = await response.json();



      if (result[0].output.status == "fail") {
        console.error("Failed to trigger webhook");
        return false
      }

      renderData();
    } catch (error) {
      console.error("Error triggering webhook:", error);
    }
  };

  return (


      <Box sx={{ height: "-webkit-fill-available", borderRadius: "10px",   p:5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: "10px 20px",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Box sx={{ p: "20px" }}>
            <Typography sx={{ fontSize: "16px", color: "white" }}>
              Posts
            </Typography>
          </Box>
          <HamburgerMenu />
        </Box>

      </Box>
      
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 ,  p: 4,
          maxHeight: "75vh",
          overflowY: "auto",
          scrollbarWidth: "none",}}>
      {weekDetails && (weekDetails.schedule || weekDetails.platforms) && Object.entries(weekDetails.schedule || weekDetails.platforms || {}).map(
          ([platformKey, platformData]: [any, any]) => {
            const posts: Post[] = platformData["Post Schedule"];

            return posts.length > 0 ? (
              <Box
                key={platformKey}
                sx={{
                  background: "#1e1e1ebf",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  borderRadius: "10px",
                  p: 3,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "white", textTransform: "uppercase" }}
                  >
                    {platformData["Platform name"]}
                  </Typography>

                  {(() => {
                    const isGenerated = posts.every((post) => !!post?.url);
                    return (
                      <Button
                        disabled={isGenerated}
                        sx={{
                          border: "1px solid white",
                          display: isGenerated ? "none" : "inline-block",
                          color: "white",
                          background: "transparent",
                          cursor: isGenerated ? "not-allowed" : "pointer",
                          "&:hover": {
                            background: isGenerated ? "transparent" : "#6B73FF",
                            borderColor: isGenerated ? "gray" : "#6B73FF",
                          },
                        }}
                        onClick={() => handleGeneratePost(platformKey)}
                      >
                        {isGenerated ? "Generated" : "Generate"}
                      </Button>
                    );
                  })()}
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                      lg: "repeat(4, 1fr)",
                    },
                    gap: 4,
                  }}
                >
                  {posts.map((post: Post, idx: number) => {
                    const postKey = `${platformKey}-${idx}`;
                    return (
                      <Box
                        key={postKey}
                        onClick={() =>
                          post?.url && setExpandedPost({ post, platform: platformKey })
                        }
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          background: "#404040",
                          borderRadius: 2,
                          color: "white",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                          p: 2,
                          cursor: post?.url ? "pointer" : "default",
                        }}
                      >
                        {post?.url ? (
                          post.mediaType === "video" ? (
                            <video
                              src={post.url}
                              autoPlay
                              muted
                              controls
                              style={{
                                width: "100%",
                                borderRadius: "8px",
                                height: "200px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <img
                              src={post.url}
                              alt={post.caption || ""}
                              height="200px"
                              style={{
                                width: "100%",
                                borderRadius: "8px",
                                objectFit: "cover",
                              }}
                            />
                          )
                        ) : (
                          <Skeleton variant="rectangular" height={200} width="100%" />
                        )}

                        {post.caption ? (
                          <Typography variant="body2" mt={1}>
                            {post.caption}
                          </Typography>
                        ) : (
                          <Skeleton
                            variant="rectangular"
                            height={30}
                            width="100%"
                            sx={{ mt: 1 }}
                          />
                        )}

                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            📅 <strong>{post.day}, {post.date}</strong>
                          </Typography>
                          <Typography variant="body2">
                            🕒 <strong>{post.time}</strong>
                          </Typography>
                          <Typography variant="body2">
                            📝 <strong>{post.mediaType}</strong>
                          </Typography>
                        </Box>

                        {!!post.hashtags?.length && (
                          <Box mt={3} display="flex" flexWrap="wrap" gap={1}>
                            {post.hashtags.map((tag: string, i: number) => (
                              <Chip
                                key={i}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ color: "white", borderColor: "white" }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ) : null;
          }
        )}
    </Box>

      <AnimatePresence>
  {expandedPost && (
    <Box
      onClick={() => setExpandedPost(null)}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#222",
          borderRadius: "16px",
          padding: "24px",
          width: "90%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          color: "white",
        }}
      >
        {/* Post Content */}
        {expandedPost.post.mediaType === "video" ? (
          <video
            src={expandedPost.post.url}
            autoPlay
            muted
            controls
            style={{
              width: "100%",
              borderRadius: "12px",
              height: "auto",
              maxHeight: "400px",
              objectFit: "cover",
            }}
          />
        ) : (
          <img
            src={expandedPost.post.url}
            style={{
              width: "100%",
              borderRadius: "12px",
              height: "auto",
              maxHeight: "400px",
              objectFit: "cover",
              //  objectPosition: "top",
            }}
          />
        )}

        <Typography variant="h6" mt={2}>
          {expandedPost.post.caption}
        </Typography>

        <Box mt={2}>
          <Typography variant="body2">
            📅 <strong>{expandedPost.post.day}, {expandedPost.post.date}</strong>
          </Typography>
          <Typography variant="body2">
            🕒 <strong>{expandedPost.post.time}</strong>
          </Typography>
          <Typography variant="body2">
            📝 <strong>{expandedPost.post.type}</strong>
          </Typography>
        </Box>

        {!!expandedPost.post.hashtags?.length && (
          <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
            {expandedPost.post.hashtags.map((tag, i) => (
              <Chip key={i} label={tag} size="small" variant="outlined" sx={{ color: "white" }} />
            ))}
          </Box>
        )}

        <AppButton
          onClick={() => setExpandedPost(null)}
          sx={{
            mt: 3,
            // backgroundColor: "#ff1744",
            // color: "white",
            // '&:hover': { backgroundColor: "#f01440" },
          }}
        >
          Close
        </AppButton>
      </motion.div>
    </Box>
  )}
</AnimatePresence>


   {true && (
        <RegenerateAssistant
         schedule={(weekDetails?.schedule || weekDetails?.platforms) ?? {}}
          onRegenerate={handleRegenerate}
        />
      )}


    </Box>
  );
};

export default PostList;
