import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Skeleton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  FormGroup,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { setCampaignMasterArticleWeekevent } from "../../reducer/campaignSlice";
import { useDispatch } from "react-redux";
import HamburgerMenu from "../../components/HamburgerMenu";
import { AnimatePresence, motion } from "framer-motion";
import AppButton from "../../components/AppButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import FileIcon from "@mui/icons-material/InsertDriveFile";
import RegenerateAssistant from "./RegenerationAssistant";
import { useInfo } from "../../context/InfoToastContext";
import { useError } from "../../context/ErrorToastContext";
import { useSuccess } from "../../context/SuccessToastContext";

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
  const [regenerateModal, setRegenerateModal] = useState<{
    open: boolean;
    platform: string;
    postIndex: number;
    contentType: string;
    command: string;
  }>({
    open: false,
    platform: "",
    postIndex: -1,
    contentType: "",
    command: "",
  });

  const { campaignId, weekId } = useParams();

    const location = useLocation()
    useEffect(()=>{
  
    },[location])

    
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

  const [anchorEl, setAnchorEl] = useState<{
    [key: string]: HTMLElement | null;
  }>({});

  const [generatePostModal, setGeneratePostModal] = useState<{
    open: boolean;
    platform: string;
    productImage: File | null;
    postIndex: number;
  }>({
    open: false,
    platform: "",
    productImage: null,
    postIndex: 1,
  });

  const [regenerateMediaModal, setRegenerateMediaModal] = useState<{
    open: boolean;
    platform: string;
    productImage: File | null;
    postIndex: number;
    prompt: string;
    url?:string
  }>({
    open: false,
    platform: "",
    productImage: null,
    postIndex: 1,
    prompt: "",
  });

  const [regenerateTextModal, setRegenerateTextModal] = useState<{
    open: boolean;
    platform: string;
    postIndex: number;
    prompt: string;
  }>({
    open: false,
    platform: "",
    postIndex: 1,
    prompt: "",
  });
  const [postList, setPostList] = useState<any>();
  const [weekDetails, setWeekDetails] = useState<any>(campaignStateWeekEvent);

  const campaignStateMarticleJson = useSelector(
    (state: RootState) => state.campaign.campaignMasterArticleJson
  );

  const { showInfoToast } = useInfo();
  const { showErrorToast } = useError();
  const { showSuccessToast } = useSuccess();

  useEffect(() => {
    transformMasterArtickeJSON();
  }, [campaignStateMarticleJson]);

  useEffect(() => {
    if (campaignStateWeekEvent) {
      setWeekDetails(campaignStateWeekEvent);
    }
  }, [campaignStateWeekEvent]);

  useEffect(() => {
    if (campaignStateWeekEvent && campaignStateMarticleJson) {
      renderData();
    }
  }, [campaignStateWeekEvent, campaignStateMarticleJson]);


  useEffect(()=>{

  },[weekDetails])

  const transformMasterArtickeJSON = () => {
    if (weekId) {
      const index = parseInt(weekId, 10);
      const keyName = `week_${index}`;
      if (!campaignStateMarticleJson || !keyName) return;

      const foundIndex = campaignStateMarticleJson.findIndex(
        (obj: Record<string, any>) => Object.keys(obj)[0] === keyName
      );

      if (foundIndex !== -1) {
        const rawJsonString = campaignStateMarticleJson[foundIndex][keyName];

        try {
          const parsed = JSON.parse(rawJsonString);
          const parsedWeek = { weekKey: keyName, ...parsed };
          dispatch(
            setCampaignMasterArticleWeekevent({
              campaignMasterWeekEvent: parsedWeek,
            })
          );
          setWeekDetails(parsedWeek);
          renderData();
        } catch (error) {
          console.error(`Failed to parse ${keyName}`, error);
        }
      }
    }
  };

  const handleGeneratePost = (platform: string, postIndex?: number) => {
    showInfoToast(
      "Be mindful that image & video generation might take few moments."
    );
    handleGeneratePostForPlatform(platform, postIndex);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          const binary = new Uint8Array(reader.result);
          let binaryString = "";
          for (let i = 0; i < binary.byteLength; i++) {
            binaryString += String.fromCharCode(binary[i]);
          }
          resolve(btoa(binaryString));
        } else if (typeof reader.result === "string") {
          // Remove the Data URL prefix if present
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to convert file to base64."));
        }
      };
      reader.onerror = () => reject(new Error("Error reading the file."));
      reader.readAsDataURL(file);
    });
  };

  const handleGeneratePostForPlatform = async (
    platform: string,
    postIndex?: number
  ) => {
    try {
      let base64Image = null;
      if (generatePostModal.productImage) {
        try {
          base64Image = await convertFileToBase64(
            generatePostModal.productImage
          );
        } catch (error) {
          console.error("Error converting image to base64:", error);
          showErrorToast("Error processing the image");
          return;
        }
      }

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
              postIndex: [postIndex || 1],
              ...(base64Image && { file: base64Image }),
            },
          }),
        }
      );

      const result = await response.json();

      if (result[0].output.status === "fail") {
        showErrorToast("Failed to generate post");
        return false;
      }

      showSuccessToast("Post generation initiated successfully");
      renderData()
    } catch (error) {
      console.error("Error triggering webhook:", error);
      showErrorToast("Error generating post");
    }
  };


  const publishPerPost = async(
      platform: string,
    postIndex?: number
  ) =>{
     showInfoToast(
      "Initated the process to publish the post"
    );
try{
    const response = await fetch(
        "https://innovasense.app.n8n.cloud/webhook/smcc/brain",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId,
            campaignId: campaignId,
            intent: "Schedule Post",
            content: {
            
              weekNumber: weekId,
              platform: platform,
              postIndexes: [postIndex || 1]
            },
          }),
        }
      );
       const result = await response.json();

      if (result[0].output.status === "fail") {
        showErrorToast("Failed to Publish post");
        return false;
      }

      showSuccessToast("Publishing post initiated successfully");
}catch(error){
 console.error("Error triggering webhook:", error);
      showErrorToast("Error in publishing post");
}
  }
  const renderData = async () => {
    const { data } = await supabase
      .from("postList")
      .select("*")
      .eq("campaignId", campaignId)
      .eq("companyId", companyId)
      .eq("week", weekId)
     

      console.log("change in table",data)
    if (data) {
      setPostList(data);

      if (weekDetails?.platforms) {
        const combinedSchedule = combineScheduleWithPosts(
          data,
          weekDetails?.platforms
        );
        setWeekDetails((prev: any) => ({
          ...prev,
          schedule: combinedSchedule,
        }));
      }
    }
  };

//  useEffect(() => {
//   let channel: any;

//   const subscribeRole = async () => {
//     if (!campaignId) return;

//     channel = supabase
//       .channel("row-listener")
//       .on(
//         "postgres_changes",
//         {
//           event: "*", // can be INSERT, UPDATE, DELETE, or "*"
//           schema: "public",
//           table: "postlist", // ⚠️ make sure your table name is lowercase unless quoted
//           // filter: `campaignId=eq.${campaignId}`, // optional filter if you only want one campaign
//         },
//         (payload) => {
//           console.log("Realtime event:", payload);
//           renderData(); // refresh data
//         }
//       )
//       .subscribe((status) => {
//         if (status === "SUBSCRIBED") {
//           console.log("✅ Realtime subscription active on postlist");
//         }
//       });
//   };

//   // const unsubscribeRole = () => {
//   //   if (channel) {
//   //     supabase.removeChannel(channel);
//   //     console.log("❌ Realtime unsubscribed");
//   //   }
//   // };

//   const handleVisibility = () => {
//     if (document.visibilityState === "visible") {
//       // unsubscribeRole();
//       subscribeRole();
//     }
//   };

//   subscribeRole();
//   document.addEventListener("visibilitychange", handleVisibility);

//   return () => {
//     // unsubscribeRole();
//     document.removeEventListener("visibilitychange", handleVisibility);
//   };
// }, []); // re-run if campaignId changes


useEffect(() => {
      let channel: any;
  
      const subscribeRole = () => {
        if (campaignId) {
          channel = supabase
            .channel("row-listener")
            .on(
        "postgres_changes",
        {
          event: "*", // can be INSERT, UPDATE, DELETE, or "*"
          schema: "public",
          table: "postlist", // ⚠️ make sure your table name is lowercase unless quoted
          filter: `campaignId=eq.${campaignId}`, // optional filter if you only want one campaign
        },
        (payload) => {
          console.log("Realtime event:", payload);
          renderData(); // refresh data
        }
      )
            .subscribe((status) => {
              if (status === "SUBSCRIBED") {
                console.log("✅ Subscribed to row changes");
                 renderData(); // refresh data
              } else if (status === "CHANNEL_ERROR") {
                console.error("❌ Error subscribing to row");
              }
            });
        }
      };
  console.log("Realtime event:");
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
const [activePostKey, setActivePostKey] = useState<any>(null);



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

    console.log("platformData",platformData)

      const postListKey = toCamelCase(platformKey);
      const generatedPosts = postListData?.[postListKey] || [];

      // if (generatedPosts.length === 0) {
      //   result[platformKey] = {
      //     ...platformData,
      //   };
      //   return;
      // }

      const mergedPosts = scheduledPosts.map((scheduledPost: any) => {
        const index =
          Number(
            scheduledPost?.index
              ? scheduledPost?.index
              : scheduledPost?.indexType
          ) - 1;


           const generated = postListData.find((gen: any) => gen.postIndex == Number(scheduledPost.index));
        
if (!generated || Object.keys(generated).length === 0) {
  return {
      ...scheduledPost, // 👈 return instead of leaving `undefined`
    };
}
        // const generated = index >= 0 ? generatedPosts[index] : undefined;

        return {
          ...scheduledPost,
          url: generated[`${postListKey}`]?.url || "",
          caption: generated[`${postListKey}`]?.caption || "",
          hashtags: generated[`${postListKey}`]?.hashtags || ""
        };
      });

      result[platformKey] = {
        ...platformData,
        ["Post Schedule"]: mergedPosts,
      };
    });

    return result;
  };

// Utility: Convert ArrayBuffer → Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // safer for large files

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as any);
  }

  return btoa(binary);
};

// Generic converter for image/video
const convertFileUrlToBase64 = async (url: string): Promise<string | false> => {
  if (!url) return false;


  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch file");

  const contentType =
    response.headers.get("content-type") || "application/octet-stream";

  const buffer = await response.arrayBuffer();
  const base64 = arrayBufferToBase64(buffer);

  return `data:${contentType};base64,${base64}`;
};

const [loadingPosts, setLoadingPosts] = useState<{ [key: string]: boolean }>({});


// Main handler
const handleRegenerate = async (data: {
  platforms: string[];
  events: string[];
  contentType: string;
  command: string;
  selectedPosts?: any;
  file?: string;
  url?: string;
}) => {
  console.log("Regenerating:", data);
  showInfoToast(
    "Be mindful that image & video generation might take few moments."
  );

  try {
    console.log(
      "dataaaaa",
      campaignId,
      data.command,
      weekId,
      data.contentType,
      data.platforms[0],
      data.selectedPosts
    );

    let binaryData: string | false = "";

    
    if (data?.url && useExisting) {
      if(data?.url.endsWith(".mp4")){
        binaryData = data.url
      }else{
binaryData = await convertFileUrlToBase64(data.url);
      }
      
    }

    
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
            campaignPostComments: data.command || "",
            weekNumber: weekId,
            subTask:
              data.contentType === "text"
                ? "regenerateText"
                : "regenerateMedia",
            platform: data.platforms[0],
            postIndex: Array.isArray(data?.selectedPosts)
              ? data.selectedPosts
              : [data.selectedPosts],
            useExisting: useExisting,
            ...((data.file || useExisting) && {
              file: useExisting ? binaryData : data.file,
            }),
          },
        }),
      }
    );
    console.log("Regenerating response:", response);

    const result = await response.json();

    if (result[0].output.status === "fail") {
      showErrorToast("Failed to regenerate content");
      return false;
    }

    // Wait a bit for the backend to process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    renderData();
    setLoadingPosts((prev) => ({ ...prev, [activePostKey]: false }));
    setActivePostKey(null); // clear active post
    showInfoToast("Content regeneration initiated successfully");
  } catch (error) {
    console.error("Error triggering webhook:", error);
    renderData();
    showErrorToast("Error during regeneration");
  }
};

// // Convert ArrayBuffer to Base64
// const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
//   let binary = "";
//   const bytes = new Uint8Array(buffer);
//   const len = bytes.byteLength;

//   for (let i = 0; i < len; i++) {
//     binary += String.fromCharCode(bytes[i]);
//   }

//   return btoa(binary);
// };


// // Complete example: fetch image URL → ArrayBuffer → Base64
// const convertImageUrlToBase64 = async (url: string): Promise<string | false> => {
//   if (!url || url.length === 0) {
//     return false;
//   }
//   const response = await fetch(url);
//   if (!response.ok) throw new Error("Failed to fetch the image");
//   const buffer = await response.arrayBuffer();
//   return arrayBufferToBase64(buffer);
// };



//   const handleRegenerate = async (data: {
//     platforms: string[];
//     events: string[];
//     contentType: string;
//     command: string;
//     selectedPosts?: any;
//     file?: string;
//     url?:string
//   }) => {
//     console.log("Regenerating:", data);
//     showInfoToast(
//       "Be mindful that image & video generation might take few moments."
//     );
//     try {
//       console.log(
//         "dataaaaa",
//         campaignId,
//         data.command,
//         weekId,
//         data.contentType,
//         data.platforms[0],
//         data.selectedPosts
//       );
//   const imageUrl = "";
// let binaryData:any =""
//        if (data?.url && useExisting) {
//    binaryData = await convertImageUrlToBase64(data.url);
//   // use binaryData...
// }



//       const response = await fetch(
//         "https://innovasense.app.n8n.cloud/webhook/smcc/brain",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             companyId,
//             campaignId: campaignId,
//             intent: "Campaign post",
//             content: {
//               campaignPostComments: data.command || "",
//               weekNumber: weekId,
//               subTask:
//                 data.contentType === "text"
//                   ? "regenerateText"
//                   : "regenerateMedia",
//               platform: data.platforms[0],
//               postIndex: Array.isArray(data?.selectedPosts)
//                 ? data.selectedPosts
//                 : [data.selectedPosts],
//               useExisting:useExisting,
//               ...((data.file || useExisting) && { file: useExisting ? binaryData:data.file }),
//             },
//           }),
//         }
//       );
//       console.log("Regenerating response:", response);

//       const result = await response.json();

//       if (result[0].output.status === "fail") {
//         showErrorToast("Failed to regenerate content");
//         return false;
//       }

//       // Wait a bit for the backend to process
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//       renderData();
//       showInfoToast("Content regeneration initiated successfully");
//     } catch (error) {
//       console.error("Error triggering webhook:", error);
//       renderData();
//       showErrorToast("Error during regeneration");
//     }
//   };



  const [showAssistant, setShowAssistant] = useState(false);
  const [ useExisting , setExisting] = useState(false)
  useEffect(()=>{

  },[useExisting])

  const navigate = useNavigate()
  return (
    <Box sx={{ height: "-webkit-fill-available", borderRadius: "10px", }}>
     

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          // p: 4,
          maxHeight: "calc(85vh - 200px)",
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        {weekDetails &&
          (weekDetails.schedule || weekDetails.platforms) &&
          Object.entries(
            weekDetails.schedule || weekDetails.platforms || {}
          ).map(([platformKey, platformData]: [any, any]) => {
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

                  {/* Generate Button - Temporarily Commented Out
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
                  */}
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
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          background: "#404040",
                          borderRadius: 2,
                          color: "white",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                          p: 2,
                          position: "relative",
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 2,
                            display: "flex",
                            gap: 1,
                          }}
                        >
                          {/* Previous Text and Media buttons
                          <Button onClick={(e) => {...}}>
                            <Typography sx={{ fontSize: "12px" }}>
                              🔄 Text
                            </Typography>
                          </Button>
                          {post.mediaType !== "text" && (
                            <Button onClick={(e) => {...}}>
                              <Typography sx={{ fontSize: "12px" }}>
                                🔄 Media
                              </Typography>
                            </Button>
                          )}
                          */}
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setAnchorEl({ [postKey]: e.currentTarget });
                            }}
                            sx={{
                              backgroundColor: "rgba(0, 0, 0, 0.5)",
                              backdropFilter: "blur(4px)",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.7)",
                              },
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl[postKey]}
                            open={Boolean(anchorEl[postKey])}
                            onClose={() =>
                              setAnchorEl({ ...anchorEl, [postKey]: null })
                            }
                            PaperProps={{
                              sx: {
                                backgroundColor: "#2a2a2a",
                                color: "white",
                                "& .MuiMenuItem-root": {
                                  fontSize: "14px",
                                  "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                  },
                                },
                              },
                            }}
                          >
                            {/* <MenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setGeneratePostModal({
                                  open: true,
                                  platform: platformKey,
                                  productImage: null,
                                  postIndex: idx + 1,
                                });
                                setAnchorEl({ ...anchorEl, [postKey]: null });
                              }}
                            >
                              🎯 Generate Post
                            </MenuItem> */}
                            <MenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setExisting(false)
                              setActivePostKey(postKey);

                                setRegenerateMediaModal({
                                  open: true,
                                  platform: platformKey,
                                  postIndex: idx + 1,
                                  productImage: null,
                                  prompt: "",
                                  url:post.url
                                });
                                setAnchorEl({ ...anchorEl, [postKey]: null });
                              }}
                            >
                              🔄 Regenerate Media
                            </MenuItem>
                            <MenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setRegenerateTextModal({
                                  open: true,
                                  platform: platformKey,
                                  postIndex: idx + 1,
                                  prompt: "",
                                });
                                setAnchorEl({ ...anchorEl, [postKey]: null });
                              }}
                            >
                              🔄 Regenerate Text
                            </MenuItem>
                            {/* <MenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement publish functionality
                                publishPerPost(platformKey,idx + 1)
                                setAnchorEl({ ...anchorEl, [postKey]: null });
                              }}
                            >
                              📤 Publish
                            </MenuItem> */}
                          </Menu>
                        </Box>
                        <Box
                          // onClick={() =>
                          //   post?.url &&
                          //   setExpandedPost({ post, platform: platformKey })
                          // }
                          sx={{
                            // cursor: post?.url ? "pointer" : "default",
                            width: "100%",
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
                                  // height: "200px",
                                    // aspectRatio:"2/3",
                                  objectFit: "cover",
                                  filter: loadingPosts[postKey] ? "blur(20px)" : "none", // 👈 blur when loading
                                }}
                              />
                            ) : (
                              <img
                                src={post.url}
                                alt={post.caption || ""}
                                // height="200px"
                                style={{
                                  //  height: "200px",
                                  width: "100%",
                                  borderRadius: "8px",
                                  // aspectRatio:"2/3",
                                  objectFit: "cover",
                                }}
                              />
                            )
                          ) : (
                            <Skeleton
                            animation="wave"
                              variant="rectangular"
                              height={200}
                              width="100%"
                              sx={{
                                textAlign:"center",
                                display:"flex",
                                justifyContent:"center",
                                alignItems:"center"
                              }}
                            >
                            <div className="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                            </Skeleton>
                          )}

  {loadingPosts[postKey] && (
    <Box
    //  height={200}
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(0,0,0,0.4)",
        borderRadius: "8px",
        height:"43vh",
          width: "100%",
          
      }}
    >
        <div className="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>

    </Box>
  )}

                          {post.caption ? (
                           <> <Typography variant="body2" mt={1}  sx={{fontSize: "14px",
            opacity: 0.8,
            lineHeight: "1.4em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",}}>
                              {post.caption}
                            </Typography>
                            <Typography sx={{color:"#8359e5",cursor:"pointer",width:"max-content"}}  onClick={() =>
                            post?.url &&
                            setExpandedPost({ post, platform: platformKey })
                          }>Read More</Typography>
                            </>
                          ) : (
                            <Skeleton
                              variant="rectangular"
                              animation="wave"
                              height={30}
                              width="100%"
                              sx={{ mt: 1 }}
                            />
                          )}

                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              📅{" "}
                              <strong>
                                {post.day}, {post.date}
                              </strong>
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
                                  sx={{
                                    color: "white",
                                    borderColor: "white",
                                  }}
                                />
                              ))}
                            </Box>
                          )}

                          {post.url && 
   <AppButton
   sx={{mt:2}}
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement publish functionality
                                publishPerPost(platformKey,idx + 1)
                                setAnchorEl({ ...anchorEl, [postKey]: null });
                              }}
                            >
                             Publish
                            </AppButton>
                          }

                          

                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ) : null;
          })}
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
              {/* {expandedPost.post.mediaType === "video" ? (
                <video
                  src={expandedPost.post.url}
                  autoPlay
                  muted
                  controls
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    // height: "auto",
                    //  aspectRatio:"2/3",
                    // maxHeight: "400px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <img
                  src={expandedPost.post.url}
                  alt={expandedPost.post.caption}
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    // height: "auto",
                    //  aspectRatio:"2/3",
                    // maxHeight: "400px",
                    objectFit: "cover",
                  }}
                />
              )} */}

              <Typography variant="h6" mt={2}>
                {expandedPost.post.caption}
              </Typography>

              {/* <Box mt={2}>
                <Typography variant="body2">
                  📅{" "}
                  <strong>
                    {expandedPost.post.day}, {expandedPost.post.date}
                  </strong>
                </Typography>
                <Typography variant="body2">
                  🕒 <strong>{expandedPost.post.time}</strong>
                </Typography>
                <Typography variant="body2">
                  📝 <strong>{expandedPost.post.type}</strong>
                </Typography>
              </Box> */}

              {!!expandedPost.post.hashtags?.length && (
                <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                  {expandedPost.post.hashtags.map((tag, i) => (
                    <Chip
                      key={i}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ color: "white" }}
                    />
                  ))}
                </Box>
              )}

              <Button
                onClick={() => setExpandedPost(null)}
                sx={{
                  mt: 3,
                  color: "white",
                  borderColor: "white",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
                variant="outlined"
              >
                Close
              </Button>
            </motion.div>
          </Box>
        )}
      </AnimatePresence>

      {/* Regeneration Modal */}
      <Dialog
        open={regenerateModal.open}
        onClose={() => setRegenerateModal({ ...regenerateModal, open: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#2a2a2a",
            color: "white",
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle>
          Regenerate {regenerateModal.contentType === "text" ? "Text" : "Media"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Custom Instructions (Optional)"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={regenerateModal.command}
            onChange={(e) =>
              setRegenerateModal({
                ...regenerateModal,
                command: e.target.value,
              })
            }
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.4)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#007bff",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() =>
              setRegenerateModal({ ...regenerateModal, open: false })
            }
            sx={{
              color: "white",
              borderColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": {
                borderColor: "rgba(255, 255, 255, 0.5)",
              },
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
                       if (activePostKey) {
      setLoadingPosts((prev) => ({ ...prev, [activePostKey]: true })); // start loader
    }
              handleRegenerate({
                platforms: [regenerateModal.platform],
                events: [],
                contentType: regenerateModal.contentType,
                command: regenerateModal.command,
                selectedPosts: [regenerateModal.postIndex],
              });
              setRegenerateModal({ ...regenerateModal, open: false });
      
            }}
            variant="contained"
            sx={{
              bgcolor: "#007bff",
              color: "white",
              "&:hover": {
                bgcolor: "#0056b3",
              },
            }}
          >
            Regenerate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Regenerate Text Modal */}
      <Dialog
        open={regenerateTextModal.open}
        onClose={() =>
          setRegenerateTextModal({ ...regenerateTextModal, open: false })
        }
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#2a2a2a",
            color: "white",
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle>Regenerate Text</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              AI Instructions
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: 2, color: "rgba(255,255,255,0.7)" }}
            >
              Provide instructions for the AI to generate the text
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="E.g., Make it more engaging, focus on benefits, use a professional tone..."
              value={regenerateTextModal.prompt}
              onChange={(e) =>
                setRegenerateTextModal({
                  ...regenerateTextModal,
                  prompt: e.target.value,
                })
              }
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.23)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#007bff",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() =>
              setRegenerateTextModal({ ...regenerateTextModal, open: false })
            }
            sx={{
              color: "white",
              borderColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": {
                borderColor: "rgba(255, 255, 255, 0.5)",
              },
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleRegenerate({
                platforms: [regenerateTextModal.platform],
                events: [],
                contentType: "text",
                command: regenerateTextModal.prompt,
                selectedPosts: [regenerateTextModal.postIndex],
              });
              setRegenerateTextModal({ ...regenerateTextModal, open: false });
            }}
            variant="contained"
            sx={{
              bgcolor: "#007bff",
              color: "white",
              "&:hover": {
                bgcolor: "#0056b3",
              },
            }}
          >
            Regenerate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Regenerate Media Modal */}
      <Dialog
        open={regenerateMediaModal.open}
        onClose={() =>
          setRegenerateMediaModal({ ...regenerateMediaModal, open: false })
        }
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#2a2a2a",
            color: "white",
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle>Regenerate Media</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              AI Instructions
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: 2, color: "rgba(255,255,255,0.7)" }}
            >
              Provide instructions for the AI to generate the media
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="E.g., Make the image more vibrant, focus on the product, use a light background..."
              value={regenerateMediaModal.prompt}
              onChange={(e) =>
                setRegenerateMediaModal({
                  ...regenerateMediaModal,
                  prompt: e.target.value,
                })
              }
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.23)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#007bff",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
            />

<Box sx={{
  display:'flex',
  justifyContent:"space-between",
  alignItems:"center"
}}>
 <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Reference Image (Optional)
            </Typography>
              {regenerateMediaModal?.url?.endsWith(".mp4") ? <></> :  <FormGroup>
            
  <FormControlLabel control={<Checkbox checked={useExisting} sx={{color:"white"}} onChange={()=> setExisting(!useExisting)}/>} label="Use the Existing image" />
</FormGroup>}
          
</Box>
           
            <Typography
              variant="body2"
              sx={{ mb: 2, color: "rgba(255,255,255,0.7)" }}
            >
              Upload a reference image to guide the AI
            </Typography>

            {!regenerateMediaModal.productImage ? (
            !useExisting &&  <Box
                sx={{
                  border: "2px dashed rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  },
                }}
                onClick={() =>
                  document
                    .getElementById("regenerate-media-image-upload")
                    ?.click()
                }
              >
                <CloudUploadIcon
                  sx={{
                    fontSize: 36,
                    color: "rgba(255, 255, 255, 0.7)",
                    mb: 1,
                  }}
                />
                <Typography sx={{ color: "rgba(255, 255, 255, 0.9)", mb: 0.5 }}>
                  Drop your image here or click to browse
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: "0.75rem",
                  }}
                >
                  Accepted: .jpg, .png, .gif | Max: 5MB
                </Typography>
              </Box>
            ) : (
            
              <>  
               <Box
                sx={{
                  border: "2px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  p: 2,
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <FileIcon
                    sx={{ fontSize: 24, color: "rgba(255, 255, 255, 0.8)" }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        color: "white",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                      }}
                    >
                      {regenerateMediaModal.productImage.name}
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "0.75rem",
                      }}
                    >
                      {(
                        regenerateMediaModal.productImage.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setRegenerateMediaModal({
                        ...regenerateMediaModal,
                        productImage: null,
                      });
                    }}
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      "&:hover": { color: "#ff4444" },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box></>
           
            )}

            <input
              id="regenerate-media-image-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    showErrorToast("File size must be less than 5MB");
                    return;
                  }
                  setRegenerateMediaModal({
                    ...regenerateMediaModal,
                    productImage: file,
                  });
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() =>
              setRegenerateMediaModal({ ...regenerateMediaModal, open: false })
            }
            sx={{
              color: "white",
              borderColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": {
                borderColor: "rgba(255, 255, 255, 0.5)",
              },
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
                if (activePostKey) {
      setLoadingPosts((prev) => ({ ...prev, [activePostKey]: true })); // start loader
    }
              const base64Image = regenerateMediaModal.productImage
                ? await convertFileToBase64(regenerateMediaModal.productImage)
                : null;

              handleRegenerate({
                platforms: [regenerateMediaModal.platform],
                events: [],
                contentType: "media",
                command: regenerateMediaModal.prompt,
                selectedPosts: [regenerateMediaModal.postIndex],
                file: base64Image || undefined,
                url:regenerateMediaModal?.url
              });
              setRegenerateMediaModal({ ...regenerateMediaModal, open: false });
            }}
            variant="contained"
            sx={{
              bgcolor: "#007bff",
              color: "white",
              "&:hover": {
                bgcolor: "#0056b3",
              },
            }}
          >
            Regenerate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Post Modal */}
      <Dialog
        open={generatePostModal.open}
        onClose={() =>
          setGeneratePostModal({ ...generatePostModal, open: false })
        }
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#2a2a2a",
            color: "white",
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle>Generate Post</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Product Image (Optional)
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: 2, color: "rgba(255,255,255,0.7)" }}
            >
              Upload a product image to be featured in the generated post
            </Typography>

            {!generatePostModal.productImage ? (
              <Box
                sx={{
                  border: "2px dashed rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  },
                }}
                onClick={() =>
                  document.getElementById("product-image-upload")?.click()
                }
              >
                <CloudUploadIcon
                  sx={{
                    fontSize: 36,
                    color: "rgba(255, 255, 255, 0.7)",
                    mb: 1,
                  }}
                />
                <Typography sx={{ color: "rgba(255, 255, 255, 0.9)", mb: 0.5 }}>
                  Drop your image here or click to browse
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: "0.75rem",
                  }}
                >
                  Accepted: .jpg, .png, .gif | Max: 5MB
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  border: "2px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  p: 2,
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <FileIcon
                    sx={{ fontSize: 24, color: "rgba(255, 255, 255, 0.8)" }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        color: "white",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                      }}
                    >
                      {generatePostModal.productImage.name}
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "0.75rem",
                      }}
                    >
                      {(
                        generatePostModal.productImage.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setGeneratePostModal({
                        ...generatePostModal,
                        productImage: null,
                      });
                    }}
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      "&:hover": { color: "#ff4444" },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            )}

            <input
              id="product-image-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    showErrorToast("File size must be less than 5MB");
                    return;
                  }
                  setGeneratePostModal({
                    ...generatePostModal,
                    productImage: file,
                  });
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() =>
              setGeneratePostModal({ ...generatePostModal, open: false })
            }
            sx={{
              color: "white",
              borderColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": {
                borderColor: "rgba(255, 255, 255, 0.5)",
              },
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleGeneratePost(
                generatePostModal.platform,
                generatePostModal.postIndex
              );
              setGeneratePostModal({ ...generatePostModal, open: false });
              showInfoToast(
                "Be mindful that post generation might take a few moments."
              );
            }}
            variant="contained"
            sx={{
              bgcolor: "#007bff",
              color: "white",
              "&:hover": {
                bgcolor: "#0056b3",
              },
            }}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* {true && (
        <RegenerateAssistant
          schedule={(weekDetails?.schedule || weekDetails?.platforms) ?? {}}
          onRegenerate={handleRegenerate}
        />
      )} */}
    </Box>
  );
};

export default PostList;
