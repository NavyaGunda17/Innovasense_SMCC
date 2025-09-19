import { Box, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import AppButton from "../../components/AppButton";
import CustomModal from "../../components/CustomModal";
import { useEffect, useState } from "react";
import { useError } from "../../context/ErrorToastContext";
import { useSuccess } from "../../context/SuccessToastContext";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import {
  setGeneratedCampaignGoal,
  setGeneratedCampaignstructure,
} from "../../reducer/campaignSlice";
import { useDispatch } from "react-redux";
import AnimatedLoader from "../../components/AnimatedLoader";
import oneAIStar from "../../assests/oneAIStar.svg"
import loader from "../../assests/loading-v2.gif";

const CampaignStructure = () => {
  let campaignState: any = useSelector((state: RootState) => state.campaign);
 
  const { showErrorToast } = useError();
  const { showSuccessToast } = useSuccess();
  const [command, setCommand] = useState("");

  const companyId = useSelector((state: RootState) => state.auth.companyId);
  const dispatch = useDispatch<AppDispatch>();
  const renderData = async () => {
    const data: any = await supabase
      .from("campaignInput")
      .select("*")
      .eq("campaignId", campaignState?.campaignId)
      .single();

    dispatch(
      setGeneratedCampaignstructure({
        campaignStructureSummary: data?.data?.campaignStructureSummary,
        campaignStructureJson: data?.data?.campaignStructureJson,
        campaignMasterArticle: data?.data?.campaignMasterArticle,
         campaignMasterArticleJson:data?.data?.campaignMasterArticleJson,
      })
    );
  };

  useEffect(() => {}, [dispatch]);

  const [showLoader, setShowLoader] = useState(false);
  const handleSabeRegenartedCommand = async () => {
    setShowLoader(true);
    setCommand("")
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
            intent: "Campaign structure",
            content: {
              campaignStructureComments: command,
            },
          }),
        }
      );

       const result = await response.json();


      if (result[0].output.status == "fail") {
         setShowLoader(false);
        showErrorToast("Error in generating the campaign structure");
        return false
      }
      // showSuccessToast("Webhook triggered successfully");
      //   setShowCampaignGoal(true)
      renderData();
      setShowLoader(false);
    } catch (error) {
      showErrorToast("Error in generating the campaign structure");
    }
  };

  const naviagte = useNavigate();

  const handleApproveStructure = async () => {
    naviagte(`/campaignCalendar/${campaignState?.campaignId}`);
  };
   const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  
       useEffect(() => {
      const handleResize = () => setScreenHeight(window.innerHeight);
      window.addEventListener("resize", handleResize);
  
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  return (
    <>
      <Box
        sx={{
          display: "flex",
          // gap: 2,
          flexDirection: "column",
          margin: "auto",
          width: "96vw",
          justifyContent: "center",
        }}
      >
          <Box sx={{ display: "none", gap: 2 ,justifyContent:"flex-end",width:'60vw',margin:"auto",mb:2}}>
          {/* <AppButton sx={{width:"max-content"}} variantType="secondary" onClick ={handleregenerateStruture}>Regenerate Struture</AppButton> */}
          <AppButton
            sx={{ width: "max-content" }}
            onClick={() => handleApproveStructure()}
          >
            Approve Structure
          </AppButton>
        </Box>
        <Box sx={{display:"flex",justifyContent:"center",alignItems:"center",gap:2}}>
          <Box>
   <Typography
              sx={{ color: "white",  fontSize: "2.75rem", fontWeight: "bold" , fontFamily: 'Orbitron, sans-serif'}}
            >
              Generated <br />Campaign <br /> Structure
            </Typography>
         <img
          src={loader}
          style={{
            width: "200px",
            height: "auto",
            maxWidth: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
        </Box>
     
        {/* <Typography
              sx={{ color: "white", fontSize: "28px", fontWeight: "bold" , fontFamily: 'Orbitron, sans-serif'}}
            >
              Generated Campaign Strcuture:{" "}
            </Typography> */}
            <Box>
              <Box sx={{ display: "flex", gap: 2 ,justifyContent:"flex-end",margin:"auto",mb:2}}>
          {/* <AppButton sx={{width:"max-content"}} variantType="secondary" onClick ={handleregenerateStruture}>Regenerate Struture</AppButton> */}
          <AppButton
            sx={{ width: "max-content" }}
            onClick={() => handleApproveStructure()}
          >
            Approve Structure
          </AppButton>
        </Box>
        <Box
          sx={{
              width:"55vw",
               margin: "auto",
                maxWidth:"93vw",
            maxHeight: screenHeight<1000 ? "50vh":"60vh",
            position:"relative",
            scrollbarWidth: "none",
            background: "#f9f7f1 !important",
            p: 3,
          
            display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius:"16px 16px 0px 0px"
             
          }}
        >
          {/* Border frame */}
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
    
      maxHeight: screenHeight<1000 ? "45vh":"55vh",
      overflowY: "auto",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": { display: "none" },
      p: 3,
      zIndex: 1,
    }}
  >
          <Box
             sx={{
      color: "#2e2e2e",
      fontSize: "14px",
     
      margin: "auto",
      borderRadius: 2,
      lineHeight: 1.7,
      "& strong": { color: "#2e2e2e" },
      "& h1, & h2, & h3": { color: "#1d34a0" },
      "& ul, & ol": { color: "#2e2e2e" },
      "& p": { color: "#2e2e2e" },
      "& li strong": { color: "#1d34a0" },
      "& blockquote": {
        borderLeft: "4px solid #ccc",
        pl: 2,
        color: "#ccc",
        fontStyle: "italic",
      },
      "& hr": { borderColor: "#444" },
    }}
          >
            <ReactMarkdown>
              {campaignState?.campaignStructureSummary?.replace(/<br\s*\/?>/gi, "\n\n")}

             
            </ReactMarkdown>
          </Box>
          </Box>
        </Box>
<Box sx={{background:"#9f9f9f",padding:"10px 25px",width:"55vw", margin: " auto", borderRadius:" 0px 0px 16px 16px" }}>
        <Box sx={{ display: "flex", flexDirection: "row", gap: 2,margin:"auto" }}>
          <textarea
         
            value={command}
            style={{
              height: "44px", // fixed height
              maxHeight: "44px",
              minHeight: "44px",
              resize: "none", // prevent user from resizing
              padding: "10px", // adjust for alignment
              fontSize: "14px", // optional for better compactness
              borderRadius: "4px", // optional for better style
              // background:"#6761e3",
              border:"1px solid #555555",
              color:"#555555",
              flex: 1, // allows it to grow
            }}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Provide the comments to regenerate the campaign structure"
            className="custom-objective-input custom-textarea"
            rows={1}
          />

          <AppButton
            sx={{
              width: "max-content",
              whiteSpace: "nowrap",
              minWidth: "fit-content",
            }}
            variantType="primary"
            onClick={handleSabeRegenartedCommand}
          >
            Regenerate Structure
          </AppButton>
        </Box>
      </Box>
       </Box>
      </Box>
      </Box>
      
      
      {showLoader && <AnimatedLoader />}
    </>
  );
};
export default CampaignStructure;
