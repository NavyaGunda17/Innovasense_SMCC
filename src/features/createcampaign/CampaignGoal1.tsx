import React, { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
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
import { render } from "@testing-library/react";
import ReactMarkdown from "react-markdown";
import AnimatedLoader from "../../components/AnimatedLoader";
import { useNavigate } from "react-router-dom";

import SendIcon from "@mui/icons-material/Send";

type CamapignGoal1Props = {
  handleShowCampaignstrure: () => void;
};
const CampaignGoal1: React.FC<CamapignGoal1Props> = ({
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

  useEffect(() => {
    dispatch(fetchCampaignEnumerations());
  }, [dispatch]);

  useEffect(() => {
    renderData();
  }, []);

  useEffect(() => {
    const templatelisy: any = template?.filter(
      (t: any) => t.enumName === "goalTemplates"
    );
    if (templatelisy && templatelisy.length > 0) {
      setTemplateList(templatelisy[0].options);
    }
  }, [template]);

  useEffect(() => {
    setHasGenerated(!!campaignState?.generatedCampaignGoal?.trim());
  }, [campaignState?.generatedCampaignGoal]);

  const [editGoal, setEditGoal] = useState(true);
  const handleEditCampaignGoal = () => {
    //  dispatch(setGeneratedCampaignGoal({ generatedCampaignGoal:"" }));
    dispatch(
      setGeneratedCampaignstructure({
        campaignStructureSummary: "",
        campaignStructureJson: "",
        campaignMasterArticle: [],
        campaignMasterArticleJson: [],
      })
    );
    setTemplateText(campaignState?.generatedCampaignGoal);
    setEditGoal(false);
    setTimeout(() => {
      // setHasGenerated(false);
    }, 1000);
  };

  const navigate = useNavigate();
  const campaignId = useSelector(
    (state: RootState) => state.campaign.campaignId
  );

  const handleApproveGoals = async () => {
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
            intent: "Campaign structure",
            content: {
              campaignStructureComments: "",
            },
          }),
        }
      );

      const result = await response.json();

      if (result[0].output.status == "fail") {
        // showErrorToast("Error in generating the campaign structure.");
        setShowLoader(false);
        return false;
      }
      // showSuccessToast('Webhook triggered successfully');
      setShowLoader(false);
      renderData();
      handleShowCampaignstrure();
      navigate(`/creatCampaign/${campaignId}#Structure`);
      //   setShowCampaignGoal(true)
    } catch (error) {
      setShowLoader(false);
      // showErrorToast("Error in generating the campaign structure.");
    }
  };

  useEffect(() => {}, [showLoader]);
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
    setGeneratedGoal(data?.data?.campaignGoal);
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
    console.log("generateGoal", generateGoal);
  }, [generateGoal]);

  const handleSaveModifedGoal = () => {
    setShowLoader(true);
    setGeneratedGoal(generateGoal);
    setEditGoal(true);
    dispatch(setGeneratedCampaignGoal({ generatedCampaignGoal: generateGoal }));
    handleSaveRegeKnowledge();
  };

  const handleSaveRegeKnowledge = async () => {
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
            content: { campaignGoal: generateGoal, edit: true },
          }),
        }
      );

      const result = await response.json();

      if (result[0].output.status == "fail") {
        setShowLoader(false);
        showErrorToast("Error in generating the campaign goal");
        return false;
      }
      setShowLoader(false);
      // showSuccessToast('Webhook triggered successfully');
      renderData();
    } catch {
      showErrorToast("Error in generating the campaign goal");
    }
  };

  const handleNext = () => {
    console.log("sds");
    navigate(`/creatCampaign/${campaignId}#Structure`, { replace: false });
  };

    const [screenHeight, setScreenHeight] = useState(window.innerHeight);

     useEffect(() => {
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
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
            Generated Campaign Goal
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ position: "relative", overflow: "hidden" }}>
            <Box
              className="campaign-detail-rectangle"
              sx={{
                maxHeight: screenHeight<1000 ? "50vh":"60vh",
                padding: "16px", // limit height
                overflowY: "auto", // enable scroll
                scrollbarWidth: "none",
                background: "#ffffffbd !important",
              }}
            >
              <AnimatePresence mode="wait">
                {
                  <motion.div
                    key="generated"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    style={{ position: "relative" }}
                  >
                    {!editGoal ? (
                      <div data-color-mode="light">
                        <MDEditor
                          value={generateGoal}
                          onChange={(value) => setGeneratedGoal(value || "")}
                          preview="edit"
                          height={300}
                          hideToolbar={false}
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                          }}
                          textareaProps={{
                            placeholder: "Generated campaign goal",
                            style: {
                              backgroundColor: "transparent",
                              color: "#2e2e2e",
                            },
                          }}
                        />
                      </div>
                    ) : (
                      <Box
                        sx={{
                          borderRadius: "8px",
                          // backgroundColor: '#fafafa',
                          padding: 2,
                          minHeight: "120px",
                          // border: '1px solid #ccc',
                          fontSize: "14px",
                          // color: '#2e2e2e',
                          whiteSpace: "pre-wrap",
                          //      color: "white",
                          // borderRadius: 2,
                          lineHeight: 1.7,
                          "& strong": { color: "#2e2e2e" },
                          "& h1, & h2, & h3": { color: "#1d34a0" },
                          "& ul, & ol": { color: "#2e2e2e" },
                          "& p": { color: "#2e2e2e" ,margin:"0px"},
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
                          {/* <br>

<br/>

<br />

<br />

<br ></br> */}
                          {generateGoal.replace(/<br\s*\/?>/gi, "\n")}
                        </ReactMarkdown>
                      </Box>
                    )}
                  </motion.div>
                }
              </AnimatePresence>
            </Box>

            {editGoal && (
              <Tooltip title="Edit Generated Goal">
                <IconButton
                  onClick={handleEditCampaignGoal}
                  sx={{
                    background: "#6B73FF",
                    borderRadius: "4px",
                    position: "absolute",
                    right: "20px",
                    top: "20px",
                    zIndex:9,
                    "&.MuiIconButton-root:hover": {
                      background: "#6B73FF",
                    },
                  }}
                >
                  <EditIcon sx={{ color: "white" }} />
                </IconButton>
              </Tooltip>
            )}

            {!editGoal && (
              <Box
                sx={{
                  position: "absolute",
                  right: "20px",
                  top: "20px",
                  display: "flex",
                  gap: 1,
                  zIndex:9
                }}
              >
                <Tooltip title="save">
                  <IconButton
                    onClick={() => handleSaveModifedGoal()}
                    sx={{
                      background: "#6B73FF",
                      borderRadius: "4px",
                      "&.MuiIconButton-root:hover": {
                        background: "#6B73FF",
                      },
                    }}
                  >
                    <Save sx={{ color: "white" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="save">
                  <IconButton
                    onClick={() => (
                      setGeneratedGoal(campaignState.generatedCampaignGoal),
                      setEditGoal(true)
                    )}
                    sx={{
                      background: "#6B73FF",
                      borderRadius: "4px",
                      "&.MuiIconButton-root:hover": {
                        background: "#6B73FF",
                      },
                    }}
                  >
                    <Clear sx={{ color: "white" }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {!(hasGenerated && campaignState?.generatedCampaignGoal) ? (
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}></Box>
      ) : (
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <AppButton
            variantType="primary"
            sx={{ mt: 2 }}
            onClick={handleApproveGoals}
          >
            Approve Campaign Goals
          </AppButton>
          {campaignState?.campaignStructureSummary && (
            // <AppButton
            //   variantType="secondary"
            //   endIcon={<SendIcon />}
            //   onClick={handleNext}
            //   sx={{
            //     height: "56px",
            //     mt: 3,
            //     float: "right",
            //     position: "fixed",
            //     bottom: "100px",
            //     right: "100px",
            //   }} // match TextField height
            // >
            //   Continue
            // </AppButton>

              <button
            onClick={handleNext}
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
      )}

      {showLoader && <AnimatedLoader />}
    </Box>
  );
};

export default CampaignGoal1;
