import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import CustomModal from "../../components/CustomModal";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import AppButton from "../../components/AppButton";
import { useDispatch } from "react-redux";
import {
  setCampaignGoal,
  setGeneratedCampaignGoal,
  setGeneratedCampaignstructure,
} from "../../reducer/campaignSlice";
import { useError } from "../../context/ErrorToastContext";
import { useSuccess } from "../../context/SuccessToastContext";
import { supabase } from "../../lib/supabaseClient";

const templates = [
  "Our goal is to promote {{product}} to the {{targetAudience}} by {{campaignEndDate}}.",
  "Drive awareness for {{eventName}} across {{region}} before {{deadline}}.",
  "Encourage signups for {{platformName}} through targeted ads to {{audienceType}}.",
];

const CampaignGoal = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateText, setTemplateText] = useState("");
  const [rawTemplate, setRawTemplate] = useState(""); // keeps original for reference

  const { showErrorToast } = useError();
  const { showSuccessToast } = useSuccess();

  const handleTemplateSelect = (template: string) => {
    setRawTemplate(template);
    setTemplateText(template);
    setDialogOpen(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value;

    // Lock variable parts: remove user edits inside {{ }} and restore original
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

  const template = useSelector(
    (state: RootState) => state.campaign.enumerations
  );
  const [templateList, setTemplateList] = useState<any>([]);

  useEffect(() => {
    const templatelisy: any = template?.filter(
      (template: any) => template.enumName == "goalTemplates"
    );
  
    if (templatelisy && templatelisy.length > 0) {
      setTemplateList(templatelisy[0].options);
    }
  }, [template]);

  const dispatch = useDispatch();
  const handleGeneraeGoal = () => {
    // templateText

    dispatch(setCampaignGoal({ campaignGoal: templateText }));
    handleSaveKnowledge(templateText);
  };

  let campaignState: any = useSelector((state: RootState) => state.campaign);


  const companyId = useSelector((state: RootState) => state.auth.companyId);

  const handleSaveKnowledge = async (templateText: any) => {
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
            intent: "Campaign goal",
            content: {
              campaignGoal: templateText,
            },
          }),
        }
      );

      const result = await response.json();

      if (result[0].output.status == "fail") {
        showErrorToast("Error in generating the campaign goal.");
        return false;
      }
      // showSuccessToast('Webhook triggered successfully');
      renderData();
      //   setShowCampaignGoal(true)
    } catch (error) {
      showErrorToast("Error in generating the campaign goal.");
    }
  };

  const renderData = async () => {
    const data: any = await supabase
      .from("campaignInput")
      .select("*")
      .eq("campaignId", campaignState?.campaignId)
      .single();

    const generatedCampaignGoal = data?.data?.campaignGoal;
    dispatch(
      setGeneratedCampaignGoal({ generatedCampaignGoal: generatedCampaignGoal })
    );
    const campaignStructureSummary = data?.data?.campaignStructureSummary;
    dispatch(
      setGeneratedCampaignstructure({
        campaignStructureSummary: campaignStructureSummary,
        campaignStructureJson: data?.data?.campaignStructureJson,
        campaignMasterArticle: data?.data?.campaignMasterArticle,
        campaignMasterArticleJson: data?.data?.campaignMasterArticleJson,
      })
    );
  };

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

  const handleApproveGoals = async () => {
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
              campaignStructureComments: "",
            },
          }),
        }
      );

      const result = await response.json();

      if (result[0].output.status == "fail") {
        showErrorToast("Error in generating the campaign strcuture");
        return false;
      }
      // showSuccessToast('Webhook triggered successfully');
      renderData();
      //   setShowCampaignGoal(true)
    } catch (error) {
      showErrorToast("Error in generating the campaign strcuture");
    }
  };

  useEffect(() => {
    setTemplateText(campaignState?.campaignGoalUser);
  }, []);
  useEffect(() => {}, [templateText]);
  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{ fontSize: 16, fontWeight: 600, mb: 1, color: "white" }}
        >
          Campaign Goal
        </Typography>

        <Button
          variant="outlined"
          onClick={() => setDialogOpen(true)}
          sx={{ mb: 2 }}
        >
          View Templates
        </Button>
      </Box>

      <TextField
        multiline
        minRows={3}
        maxRows={3}
        fullWidth
        value={templateText}
        onChange={handleTextChange}
        placeholder="Enter campaign goal..."
        InputProps={{
          sx: {
            color: "white",
            fontSize: "0.9rem",
            lineHeight: "1.5",
            padding: "8px 14px",
          },
        }}
        sx={{
          background: "transparent",
          borderRadius: 2,
          marginTop: 1,
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

      <CustomModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Select a Campaign Template"
        onConfirm={() => {}}
        body={
          <>
            <List>
              {templateList.length > 0 &&
                templateList.map((tpl: any, index: any) => {
                  const [key, value] = Object.entries(tpl)[0]; // value is type 'unknown' by default

                  return (
                    <ListItemButton
                      key={index}
                      onClick={() => handleTemplateSelect(value as string)}
                    >
                      <ListItemText
                        primary={key.charAt(0).toUpperCase() + key.slice(1)}
                        secondary={value as string}
                      />
                    </ListItemButton>
                  );
                })}
            </List>
          </>
        }
      />

      <AppButton
        variantType="primary"
        sx={{ mt: 2 }}
        onClick={handleGeneraeGoal}
      >
        Generate Campaign Goals
      </AppButton>

      {campaignState?.generatedCampaignGoal &&
      campaignState?.generatedCampaignGoal.length > 0 ? (
        <>
          <TextField
            multiline
            minRows={3}
            maxRows={3}
            fullWidth
            value={campaignState?.generatedCampaignGoal}
            disabled
            placeholder="Enter campaign goal..."
            InputProps={{
              sx: {
                color: "white",
                fontSize: "0.9rem",
                lineHeight: "1.5",
                padding: "8px 14px",
              },
            }}
            sx={{
              background: "transparent",
              borderRadius: 2,
              marginTop: 1,
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
        </>
      ) : (
        <></>
      )}

      <AppButton
        variantType="primary"
        sx={{ mt: 2 }}
        onClick={handleApproveGoals}
      >
        Approve Campaign Goals
      </AppButton>
    </Box>
  );
};

export default CampaignGoal;
