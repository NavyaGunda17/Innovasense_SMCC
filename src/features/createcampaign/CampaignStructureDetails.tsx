import {
  Accordion,
  Box,
  Typography,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Tooltip,
  IconButton,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useEffect, useState } from "react";
import AppButton from "../../components/AppButton";
import { useError } from "../../context/ErrorToastContext";
import { useSuccess } from "../../context/SuccessToastContext";
import CustomModal from "../../components/CustomModal";
import { supabase } from "../../lib/supabaseClient";
import { useDispatch } from "react-redux";
import {
  setCampaignGoal,
  setGeneratedCampaignDetails,
  setGeneratedCampaignGoal,
  setGeneratedCampaignstructure,
} from "../../reducer/campaignSlice";
import CachedIcon from "@mui/icons-material/Cached";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from "@mui/icons-material/EditOff";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import AiVariablesCards from "./AiVariable";
import { useNavigate } from "react-router-dom";
import AnimatedLoader from "../../components/AnimatedLoader";
import AI_lgo from "../../assests/AI_logo.png"
import BreadCrumnb from "../../components/BreadCrumb"
import loader from "../../assests/loading-v2.gif";

type CampaignStructureDetailsProps = {
  handleShowCampaoignGoal: () => void;
};

const gradientInputSx = {
  "& .MuiInputBase-root": {
    background: "linear-gradient(90deg, #9854CB 0%, #E1644A 100%)",
    color: "white",
    borderRadius: 2,
    fontWeight: 400,
    fontSize: 16,
    width: "100%",
    marginBottom: "15px",
    "& input": {
      color: "white",
    },
    "& .MuiAutocomplete-tag": {
      background: "#2d2363",
      color: "white",
      fontWeight: 700,
      fontSize: 14,
      borderRadius: 2,
    },
    "& .MuiChip-filled": {
      backgroundColor: "#fff",
      color: "#000",
      fontWeight: 700,
      borderRadius: 2,
      "& .MuiChip-deleteIcon": {
        color: "#000",
        "&:hover": {
          color: "#ffeb3b",
        },
      },
    },
  },
  "& label": {
    color: "white",
  },
};
const CampaignStructureDetails: React.FC<CampaignStructureDetailsProps> = ({
  handleShowCampaoignGoal,
}) => {
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const campaignState = useSelector((state: RootState) => state.campaign);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saveKnowledge, setSaveKnowledge] = useState(false);
  const [command, setCommand] = useState("");
  const { showErrorToast } = useError();
  const { showSuccessToast } = useSuccess();
  const companyId = useSelector((state: RootState) => state.auth.companyId);
  const [showCampaignGoal, setShowCampaignGoal] = useState(true);

  const [showLoader, setShowLoader] = useState(false);

  const handleRegenerateKnowledge = async () => {
    setShowLoader(true);
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
            intent: "Fill info manually",
            content: {
              knowledgeBaseComments: command,
            },
          }),
        }
      );
  const result = await response.json();


        
      if (result[0].output.status == "fail") {
         setShowLoader(false);
        showErrorToast("Error in generating the AI Brand Strategy");
        return false
      }
      // showSuccessToast("Webhook triggered successfully");
      setShowLoader(false);
      //   setShowCampaignGoal(true)
      renderData();
      setCommand("");
    } catch (error) {
      showErrorToast("Error in generating the AI Brand Strategy");
    }
  };

  const dispatch = useDispatch();
  const renderData = async () => {
    try {
      const { data, error } = await supabase
        .from("campaignInput")
        .select("*")
        .eq("campaignId", campaignState?.campaignId)
        .single();

      if (error) {
        console.error("Supabase error:", error.message);
        return;
      }

      if (!data) {
        console.warn("No campaign data found.");
        return;
      }

      dispatch(
        setGeneratedCampaignDetails({
          brandValue: data.brandValue || "",
          brandSupport: data.brandSupport || "",
          messagingPillars: Array.isArray(data.messagingPillars)
            ? data.messagingPillars
            : [],
          constraints: Array.isArray(data.constraints) ? data.constraints : [],
          brandTone: data.brandTone || "",
        })
      );
      dispatch(setCampaignGoal({ campaignGoal: data?.data?.campaignGoalUser }));
      dispatch(
        setGeneratedCampaignGoal({
          generatedCampaignGoal: data?.data?.campaignGoal,
        })
      );
      dispatch(
        setGeneratedCampaignstructure({
          campaignStructureSummary: data?.data?.campaignStructureSummary,
          campaignStructureJson: data?.data?.campaignStructureJson,
          campaignMasterArticle: data?.data?.campaignMasterArticle,
          campaignMasterArticleJson: data?.data?.campaignMasterArticleJson,
        })
      );
    } catch (err) {
      console.error("Unexpected error fetching campaign data:", err);
    }
  };

  useEffect(() => {}, [dispatch]);
  useEffect(() => {
    if (campaignState.brandValue) {
      setSaveKnowledge(true);
    }
  }, [campaignState.brandValue]);

  const [editStrcutureData, setEditStruturedata] = useState(true);

  const naviagte = useNavigate();
  const campaignId = useSelector(
    (state: RootState) => state.campaign.campaignId
  );
  const handleNextStep = () => {
    // navigate
    handleShowCampaoignGoal();
    naviagte(`/creatCampaign/${campaignId}#Goal`);
  };
  useEffect(() => {}, [saveKnowledge]);
  const steps = ["Brand Positioning", "Messaging Pillars", "Constraints"];
  const [activeStep, setActiveStep] = useState(0);

  return (
    <>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          flexDirection:"row",
          mt:2,
          height:"80vh"
        }}
      >
         <Box sx={{display:"flex",flexDirection:"column"}}>
        <Typography
          sx={{
            color: "white",
            fontSize: "2.75rem",
            fontWeight: "500",
            margin: "0 0 2rem 0",
            letterSpacing: "0.02em",
            lineHeight: "1.1",
            textShadow: "none",
            textAlign: "left",
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          {/* <img src={AI_lgo} style={{width:"40px",marginRight:"20px"}}/> */}
          AI Generated <br />
          Brand Strategy
         
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
       <Box>
          <AiVariablesCards />
          <Box sx={{ mt: 5 }}>
            <textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Provide the comments to regenerate the AI Brand Strategy"
              className="custom-objective-input"
              rows={1}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <AppButton
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                onClick={handleRegenerateKnowledge}
                sx={{ height: "56px", mt: 3 }} // match TextField height
              >
                Regenrate Brand Strategy
              </AppButton>
              {/* <AppButton
                variantType="secondary"
                // endIcon={<SendIcon />}
                onClick={handleNextStep}
                sx={{  mt: 3 , padding: "10px 32px",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        color: "white",
        border: "1px solid rgba(0, 123, 255, 0.3)",
        borderRadius: "8px",
       
        fontSize: "16px",
        transition: "all 0.3s ease",
      
        backdropFilter: "blur(8px)",
        boxShadow:
          "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        letterSpacing: "0.5px",
        fontWeight: "500",}} // match TextField height
                className="next-button"
              >
                Next
              </AppButton> */}


                 <button
      onClick={handleNextStep}
      style={{
        height:"max-content",
        marginTop:"20px",
        padding: "10px 32px",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        color: "white",
        border: "1px solid rgba(0, 123, 255, 0.3)",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        transition: "all 0.3s ease",
        opacity:1,
        pointerEvents: "auto",
        backdropFilter: "blur(8px)",
        boxShadow:
          "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        letterSpacing: "0.5px",
        fontWeight: "500",
      }}
    >
      Next
    </button>

            </Box>
          </Box>
          </Box>
        </Box>
     

      <Box sx={{ m: 4, gap: 2, display: "flex" }}>
        {/* {saveKnowledge ? 
                <AppButton variantType="primary" onClick={handleRegenerateKnowledgeButton} >Regenrate Knowledge Base</AppButton> :
         <AppButton variantType="primary" onClick={handleSaveKnowledge}>Save Knowledge Base</AppButton>
                }
         */}
      </Box>

      <CustomModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Regenerate Campaign Struture"
        onConfirm={handleRegenerateKnowledge}
        body={
          <TextField
            multiline
            minRows={4}
            fullWidth
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter campaign goal..."
            InputProps={{
              sx: {
                color: "black", // for input text
              },
            }}
            sx={{
              background: "transparent",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  color: "white",
                  borderColor: "rgb(84 85 87)",
                },
                "&:hover fieldset": {
                  color: "white",
                  borderColor: "rgb(84 85 87)",
                },
                "&.Mui-focused fieldset": {
                  color: "white",
                  borderColor: "rgb(84 85 87)",
                },
              },
            }}
          />
        }
      />

      {showLoader && <AnimatedLoader />}
    </>
  );
};
export default CampaignStructureDetails;
