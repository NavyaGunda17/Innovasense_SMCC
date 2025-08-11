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
  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: "column",
          margin: "auto",
          width: "70vw",
          justifyContent: "center",
        }}
      >
          <Box sx={{ display: "flex", gap: 2 ,justifyContent:"flex-end"}}>
          {/* <AppButton sx={{width:"max-content"}} variantType="secondary" onClick ={handleregenerateStruture}>Regenerate Struture</AppButton> */}
          <AppButton
            sx={{ width: "max-content" }}
            onClick={() => handleApproveStructure()}
          >
            Approve Structure
          </AppButton>
        </Box>
        {/* <Typography
              sx={{ color: "white", fontSize: "28px", fontWeight: "bold" , fontFamily: 'Orbitron, sans-serif'}}
            >
              Generated Campaign Strcuture:{" "}
            </Typography> */}
        <Box
          sx={{
            height: "calc(73vh - 100px)",
            overflowY: "auto",
            scrollbarWidth: "none",
            background: "#ffffffbd !important",
            p: 3,
            pt: 0,
            borderRadius: "16px",
          }}
        >
          <Box
            sx={{
              color: "#2e2e2e",
              // backgroundColor: '#121212',
              // p: 3,
              borderRadius: 2,
              lineHeight: 1.7,
              //  whiteSpace: 'pre-wrap',
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

              "& hr": {
                borderColor: "#444",
              },
            }}
          >
            <ReactMarkdown>
              {campaignState?.campaignStructureSummary}
            </ReactMarkdown>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
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

              flex: 1, // allows it to grow
            }}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Provide the comments to regenerate the campaign structure"
            className="custom-objective-input"
            rows={1}
          />

          <AppButton
            sx={{
              width: "max-content",
              whiteSpace: "nowrap",
              minWidth: "fit-content",
            }}
            variantType="secondary"
            onClick={handleSabeRegenartedCommand}
          >
            Regenerate Structure
          </AppButton>
        </Box>
      
      </Box>
      
      {showLoader && <AnimatedLoader />}
    </>
  );
};
export default CampaignStructure;
