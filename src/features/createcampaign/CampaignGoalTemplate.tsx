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

type CamapignGoal1Props = {
  handleShowCampaignstrure: () => void;
};
const CampaignGoalTemplate: React.FC<CamapignGoal1Props> = ({
  handleShowCampaignstrure,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateText, setTemplateText] = useState("");
  const [rawTemplate, setRawTemplate] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const { showErrorToast } = useError();
  const { showSuccessToast } = useSuccess();

  const template = useSelector(
    (state: RootState) => state.campaign.enumerations
  );
  console.log("template", template);
  const [templateList, setTemplateList] = useState<any>([]);
  const dispatch = useDispatch<AppDispatch>();
  const campaignState: any = useSelector((state: RootState) => state.campaign);
  const companyId = useSelector((state: RootState) => state.auth.companyId);

  const handleTemplateSelect = (template: string) => {
    setRawTemplate(template);
    setTemplateText(template);
    setDialogOpen(false);
  };

  useEffect(() => {
    dispatch(fetchCampaignEnumerations());
  }, [dispatch]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value;
    const protectedPattern = /\{\{.*?\}\}/g;
    const originalVars = rawTemplate.match(protectedPattern) || [];
    const currentVars = userInput.match(protectedPattern) || [];

    let newText = userInput;
    originalVars.forEach((originalVar, index) => {
      const currentVar = currentVars[index];
      if (currentVar !== originalVar) {
        newText = newText.replace(currentVar || "", originalVar);
      }
    });

    setTemplateText(newText);
  };

  useEffect(() => {
    const templatelisy: any = template?.filter(
      (t: any) => t.enumName === "goalTemplates"
    );
    if (templatelisy && templatelisy.length > 0) {
      setTemplateList(templatelisy[0].options);
    }
  }, [template]);

  const handleGeneraeGoal = (structure: any) => {
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

  const handleClosePopup = () => {
    setDialogOpen(true);
  };

  const hanldeNextCalendar = () => {
    console.log("sds");
    navigate(`/creatCampaign/${campaignId}#AIGneeratedGoal`, {
      replace: false,
    });
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
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {true && (
            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <AppButton
                variantType="primary"
                onClick={() => setDialogOpen(true)}
                sx={{ mb: 2, width: "max-content" }}
              >
                Select Templates
              </AppButton>
            </Box>
          )}
          <Box sx={{ position: "relative", overflow: "hidden" }}>
            <Box
              className="campaign-detail-rectangle"
              sx={{
                maxHeight: "200px",
                padding: "16px",
                overflowY: "auto",
                scrollbarWidth: "none",
                background: "#ffffffbd !important",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <AnimatePresence mode="wait">
                {true && (
                  <>
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TextField
                        multiline
                        minRows={4}
                        maxRows={4}
                        fullWidth
                        value={templateText}
                        disabled
                        placeholder="Select campaign goal from the template...."
                        InputProps={{
                          sx: {
                            color: "#2e2e2e !important",
                            fontSize: "0.9rem",
                            lineHeight: "1.5",
                            padding: "12px 16px",
                            "& input": { color: "#2e2e2e" },
                            "& .Mui-disabled": {
                              WebkitTextFillColor: "#2e2e2e",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: "none",
                            },
                          },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            minHeight: "120px",
                            maxHeight: "120px",
                            overflow: "auto",
                          },
                          "& .Mui-disabled": {
                            WebkitTextFillColor: "#2e2e2e !important",
                            opacity: 1,
                          },
                          "& .MuiInputBase-multiline": {
                            padding: "0",
                          },
                        }}
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </Box>
          </Box>
        </Box>
      </Box>

      <CustomModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Select a Campaign Template"
        onConfirm={handleClosePopup}
        confirmText="Close"
        titleColor="black"
        showCancel={false}
        customcolor={{
          background: "rgb(210 201 201 / 71%)!important",
        }}
        body={
          <List>
            {templateList.map((tpl: any, index: any) => {
              const [key, value] = Object.entries(tpl)[0];
              return (
                <ListItemButton
                  key={index}
                  onClick={() => handleTemplateSelect(value as string)}
                  sx={{
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#1019462e", // <-- your custom hover color here
                    },
                  }}
                >
                  <ListItemText
                    primary={key.charAt(0).toUpperCase() + key.slice(1)}
                    secondary={value as string}
                    primaryTypographyProps={{ sx: { color: "#2e2e2e" } }}
                    secondaryTypographyProps={{
                      sx: { color: "#2e2e2e", opacity: 0.7 },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        }
      />

      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <AppButton
          variantType="primary"
          sx={{ mt: 2 }}
          onClick={() =>
            handleGeneraeGoal(campaignState?.generatedCampaignGoal)
          }
        >
          Generate Campaign Goals
        </AppButton>
        {/* <AppButton
             variantType="secondary"
              endIcon={<SendIcon />}
              onClick={hanldeNextCalendar}
              disabled={campaignState?.generatedCampaignGoal ? false :  true}
              sx={{ height: "56px" ,mt:3,float:"right",}} // match TextField height
            >
              Next</AppButton> */}
      </Box>

      {showLoader && <AnimatedLoader />}

      {campaignState?.generatedCampaignGoal && (
        <AppButton
          variantType="secondary"
          endIcon={<SendIcon />}
          onClick={hanldeNextCalendar}
          sx={{
            height: "56px",
            mt: 3,
            float: "right",
            position: "fixed",
            bottom: "100px",
            right: "100px",
          }} // match TextField height
        >
          Continue
        </AppButton>
      )}
    </Box>
  );
};

export default CampaignGoalTemplate;
