import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Box, Typography } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import AppButton from "../../components/AppButton";
import { setGeneretedFileSummary } from "../../reducer/campaignSlice";
import { useError } from "../../context/ErrorToastContext";
import { useSuccess } from "../../context/SuccessToastContext";
import { supabase } from "../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCampaignEnumerations } from "../../reducer/campaignThunk";
import ReactMarkdown from "react-markdown";
import AnimatedLoader from "../../components/AnimatedLoader";
import { useNavigate } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import oneAIStar from "../../assests/oneAIStar.svg"


type CamapignGoal1Props = {
  is3DTransitioning?: boolean;
  transitionPhase?: string;
};

export type FileUploadHandle = {
  save: () => Promise<boolean>;
  getFiles: () => File[];
  clearFiles: () => void;
};

const FileUploadSummary = forwardRef<FileUploadHandle, CamapignGoal1Props>(
  ({}, ref) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [templateText, setTemplateText] = useState("");
    const [rawTemplate, setRawTemplate] = useState("");
    const [hasGenerated, setHasGenerated] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [generatedFileSummary, setGeneeratedFileSummary] = useState<any>("");

    const { showErrorToast } = useError();
    const { showSuccessToast } = useSuccess();
    const dispatch = useDispatch<AppDispatch>();
    const campaignState: any = useSelector(
      (state: RootState) => state.campaign
    );
    const companyId = useSelector((state: RootState) => state.auth.companyId);
    const campaignId = useSelector(
      (state: RootState) => state.campaign.campaignId
    );
    const navigate = useNavigate();

    useEffect(() => {
      renderData();
    }, []);

    useEffect(() => {

    }, [generatedFileSummary]);
    useEffect(() => {
      setHasGenerated(!!campaignState?.generatedCampaignGoal?.trim());
    }, [campaignState?.generatedCampaignGoal]);

    const renderData = async () => {
      const data: any = await supabase
        .from("campaignInput")
        .select("*")
        .eq("campaignId", campaignState?.campaignId)
        .single();

      dispatch(
        setGeneretedFileSummary({
          generatedFileSummary: data?.data?.clientFiles,
        })
      );
      setGeneeratedFileSummary(data?.data?.clientFiles);
    };

    const handleNext = () => {
      navigate(`/creatCampaign/${campaignId}#StrategicObjective`, {
        replace: false,
      });
    };

    /**
     * Expose functions to parent via ref
     */
    useImperativeHandle(ref, () => ({
      save: async () => {
        // Example: add your saving logic here
        console.log("Saving from FileUploadSummary...");
        return true;
      },
      getFiles: () => {
        // Example: return the files you want parent to access
        return [];
      },
      clearFiles: () => {
        // Example: clear your file state
        console.log("Clearing files...");
      },
    }));
 const [screenHeight, setScreenHeight] = useState(window.innerHeight);

     useEffect(() => {
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
    return (
      <Box sx={{}}>
        <Box
          sx={{
            display: "flex",
            width: "96vw",
          
            justifyContent: "space-between",
            flexDirection: "column",
            alignItems: "center",
          }}
        >

          
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
             
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                mb: 1,
                color: "white",
                fontFamily: "Orbitron, sans-serif",
                fontSize: "24px",
                position: "fixed",
                top: "67px",
                left: "0",
                right: "0",
                margin: "auto",
                display: "inline-table",
                 width:"90%",
                 textAlign:"center"
              }}
            >
              Generated Summary
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column" ,width:"100%"}}>
                   <Box sx={{ position: "relative", overflow: "hidden",width:"100%" }}>
              <Box
                className="campaign-detail-rectangle"
                sx={{
                 width: "60%",
    margin: "auto",
                    maxWidth:"93vw",
                  maxHeight: screenHeight<1000 ? "50vh":"60vh",
                  p: 3,
                  overflowY: "auto",
                  scrollbarWidth: "none",
                  background: "#f9f7f1 !important",
                      borderRadius:"16px"
                }}
              >
                 <Box
    sx={{
      position: "absolute",
      top: "16px",
      left: "16px",
      right: "16px",
      bottom: "16px",
      border: "1px solid #a870b8",
      pointerEvents: "none", // so it won’t block content
      zIndex: 2,
    }}
  >
    {/* Decorative star at bottom center */}
    <Box
      sx={{
        position: "absolute",
        bottom: "-10px", // move outside border slightly
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "18px",
        color: "#333",
        background: "#f9f7f1",
        px: 1,
      }}
    >
      <img src={oneAIStar} width={20}/>
    </Box>
  </Box>
  <Box
    sx={{
      width: "100%",
      height: "100%",
      overflowY: "auto",
     
      zIndex: 1,
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": { display: "none" },
    }}
  >
                <AnimatePresence mode="wait">
                  <motion.div
                    key="generated"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    style={{position: "relative",margin:"auto"  }}
                  >
                    <Box
                      sx={{
                        borderRadius: "8px",
                        padding: 2,
                        minHeight: "120px",
                        fontSize: "14px",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.7,
                        "& strong": { color: "#2e2e2e" },
                        "& h1, & h2, & h3": { color: "#1d34a0" },
                        "& ul, & ol": { color: "#2e2e2e" },
                        "& p": { color: "#2e2e2e",margin:"0px" },
                        "& li strong": { color: "#1d34a0" },
                        "& blockquote": {
                          borderLeft: "4px solid #ccc",
                          pl: 2,
                          color: "#ccc",
                          fontStyle: "italic",
                        },
                        "& hr": {
                          borderColor: "#444",
                        },
                       
                      }}
                    >
                      <ReactMarkdown>
                        
                        {generatedFileSummary
                          ? generatedFileSummary?.replace(/<br\s*\/?>/gi, "\n\n")
                          : "No file summary available. You can upload a file in the previous step or continue without file upload."}
                      </ReactMarkdown>
                    </Box>
                  </motion.div>
                </AnimatePresence>
               </Box>
              </Box>
              
            </Box>
          </Box>
        </Box>


        {showLoader && <AnimatedLoader />}
      </Box>
    );
  }
);

FileUploadSummary.displayName = "FileUploadSummary";

export default FileUploadSummary;
