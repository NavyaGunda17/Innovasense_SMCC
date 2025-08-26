import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Tooltip,
} from "@mui/material";
import CustomModal from "../../components/CustomModal";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import AppButton from "../../components/AppButton";
import {
  setCampaignGoal,
  setGeneratedCampaignGoal,
  setGeneratedCampaignstructure,
} from "../../reducer/campaignSlice";
import { useError } from "../../context/ErrorToastContext";
import { useSuccess } from "../../context/SuccessToastContext";
import { supabase } from "../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import { fetchCampaignEnumerations } from "../../reducer/campaignThunk";
import { Clear, Save } from "@mui/icons-material";
import AnimatedLoader from "../../components/AnimatedLoader";
import { useNavigate } from "react-router-dom";

import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

type CamapignGoal1Props = {
  handleShowCampaignstrure: () => void;
};
const CampaignGoalTemplate: React.FC<CamapignGoal1Props> = ({
  handleShowCampaignstrure,
}) => {
  const [templateText, setTemplateText] = useState("");
  const [rawTemplate, setRawTemplate] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const { showErrorToast } = useError();
  const { showSuccessToast } = useSuccess();

  const template = useSelector(
    (state: RootState) => state.campaign.enumerations
  );
  const [templateList, setTemplateList] = useState<any>([]);
  const dispatch = useDispatch<AppDispatch>();
  const campaignState: any = useSelector((state: RootState) => state.campaign);
  const companyId = useSelector((state: RootState) => state.auth.companyId);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const handleTemplateSelect = (template: string, key: string) => {
    setRawTemplate(template);
    setTemplateText(template);

    setSelectedKey(key);
  };

  useEffect(() => {
    dispatch(fetchCampaignEnumerations());
  }, [dispatch]);

  useEffect(() => {
    const templatelisy: any = template?.filter(
      (t: any) => t.enumName === "goalTemplates"
    );
    if (templatelisy && templatelisy.length > 0) {
      setTemplateList(templatelisy[0].options);
    }
  }, [template]);

  useEffect(() => {
    if (campaignState?.campaignGoal && templateList.length > 0) {
      const index = templateList.findIndex(
        (obj: any) => Object.values(obj)[0] === campaignState?.campaignGoal
      );
      if (index !== -1) {
        const matchedObj = templateList[index];
        const [key, value] = Object.entries(matchedObj)[0];
        setSelectedKey(key);
      }
    }
  }, [templateList, campaignState]);

  useEffect(() => {}, [selectedKey]);

  const handleGeneraeGoal = (structure: any) => {
    console.log("templateText",templateText)
    if(!templateText){
      showErrorToast("Please select the one of camapign goal. ")
      return;
    }
    dispatch(setCampaignGoal({ campaignGoal: templateText }));
    handleSaveKnowledge(templateText);
    setShowLoader(true);
  };

  const navigate = useNavigate();
  const campaignId = useSelector(
    (state: RootState) => state.campaign.campaignId
  );

  const handleSaveKnowledge = async (templateText: any) => {
    try {
      const response = await fetch(
        "https://innovasense.app.n8n.cloud/webhook/smcc/brain",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId: companyId,
            campaignId: campaignState?.campaignId,
            intent: "Campaign goal",
            content: { campaignGoalUser: templateText, edit: false },
          }),
        }
      );

      // Convert response to JSON
      const result = await response.json();

      if (result[0].output.status == "fail") {
        setShowLoader(false);
        showErrorToast("Error in generating the campaign goal.");
        return false;
      }
      navigate(`/creatCampaign/${campaignId}#AIGneeratedGoal`);
      handleShowCampaignstrure();
      // showSuccessToast('Webhook triggered successfully');
      renderData();
      setShowLoader(false);
    } catch {
      showErrorToast("Error in generating the campaign goal.");
    }
  };

  const renderData = async () => {
    const data: any = await supabase
      .from("campaignInput")
      .select("*")
      .eq("campaignId", campaignState?.campaignId)
      .single();

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
  };

  const [generateGoal, setGeneratedGoal] = useState<any>("");

  useEffect(() => {
    setTemplateText(campaignState?.campaignGoal);

    setGeneratedGoal(campaignState?.generatedCampaignGoal);
  }, []);

  const hanldeNextCalendar = () => {
    navigate(`/creatCampaign/${campaignId}#AIGneeratedGoal`, {
      replace: false,
    });
  };

  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const renderCard = (tpl: any) => {
    const [key, value] = Object.entries(tpl)[0];

    return (
      <Box
        key={key}
        component={motion.div}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        sx={{
          width: 300,
          height: 200,
          borderRadius: 2,
          background:
            selectedKey === key
              ? "rgba(0, 0, 53, 0.5)"
              : "rgba(255, 255, 255, 0.05)",
          color: "white",
          cursor: "pointer",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          "&:hover": {
            background: "rgba(0, 0, 53, 0.12)",
          },
        }}
        // onClick={() => setSelectedCard(key)}
        onClick={() => handleTemplateSelect(value as string, key)}
      >
        <Typography
          sx={{ fontFamily: "Orbitron, sans-serif", fontWeight: 600, mb: 1 }}
        >
          {key.toUpperCase()}
        </Typography>
        <Box
          sx={{
            fontSize: "14px",
            opacity: 0.8,
            lineHeight: "1.4em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
          }}
        >
          {value as string}
        </Box>
        <Typography sx={{ mt: 1 }} onClick={() => setSelectedCard(key)}>
          Click to expand
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          width: "inherit",
          gap: "20px",
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
            }}
          >
            {!hasGenerated ? "Campaign Goal" : "Generated Campaign Goal"}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "center",
            width: "70vw",
            mt: 4,
          }}
        >
          {templateList.map(renderCard)}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mt: 6, justifyContent: "center" }}>
        <AppButton
          variantType="primary"
          sx={{ mt: 2 }}
          onClick={() =>
            handleGeneraeGoal(campaignState?.generatedCampaignGoal)
          }
        >
          Generate Campaign Goals
        </AppButton>
        {campaignState?.generatedCampaignGoal && (
          <button
            onClick={hanldeNextCalendar}
            style={{
              height: "max-content",
              marginTop: "20px",
              padding: "10px 32px",
              backgroundColor: "rgba(0, 123, 255, 0.2)",
              color: "white",
              border: "1px solid rgba(0, 123, 255, 0.3)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              transition: "all 0.3s ease",
              opacity: 1,
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
        )}
      </Box>

      {showLoader && <AnimatedLoader />}

      <AnimatePresence>
        {selectedCard && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              // backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2000,
              padding: "20px",
            }}
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(0,0,53,0.9)",
                borderRadius: "16px",
                padding: "2rem",
                maxWidth: "600px",
                width: "100%",
                maxHeight: "80vh",
                overflowY: "auto",
                color: "white",
                position: "relative",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedCard.toUpperCase()}
              </Typography>
              <Typography>
                {
                  templateList.find(
                    (t: any) => Object.keys(t)[0] === selectedCard
                  )?.[selectedCard]
                }
              </Typography>
              <IconButton
                onClick={() => setSelectedCard(null)}
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  color: "white",
                }}
              >
                <CloseIcon />
              </IconButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default CampaignGoalTemplate;
