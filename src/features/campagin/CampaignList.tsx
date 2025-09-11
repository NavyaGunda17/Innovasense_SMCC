import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import AppButton from "../../components/AppButton";
import CustomModal from "../../components/CustomModal";
import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import {
  campaignDetails,
  resetCampaign,
  setCampaignID,
} from "../../reducer/campaignSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useError } from "../../context/ErrorToastContext";
import { useSuccess } from "../../context/SuccessToastContext";
import { supabase } from "../../lib/supabaseClient";
import React from "react";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import "./CampaignList.css";
import TopControls from "../../components/TopControl";
import { Add, Done } from "@mui/icons-material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import { SvgIcon } from "@mui/material";
import HamburgerMenu from "../../components/HamburgerMenu";
import AnimatedLoader from "../../components/AnimatedLoader";

const TikTokIcon = (props: any) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0011.14-4.02v-7a8.16 8.16 0 004.65 1.48V7.1a4.79 4.79 0 01-1.2-.41z" />
  </SvgIcon>
);
const validationSchema = Yup.object({
  campaignName: Yup.string().required("campaignName is required"),
  targetMarket: Yup.string().required("targetMarket is required"),
  brandIndustry: Yup.string().required("brandIndustry is required"),
  brandName: Yup.string().required("brandName is required"),
});

const CampaignList = () => {
  const [open, setOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const dispatch = useDispatch();
  const { showErrorToast } = useError();
  const { showSuccessToast } = useSuccess();
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(false);

  const formik = useFormik({
    initialValues: {
      campaignName: "",
      targetMarket: "",
      brandIndustry: "",
      brandName: "",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
    
      handleCreate(values);
      resetForm();
    },
  });
  const companyId = useSelector((state: RootState) => state.auth.companyId);

  const campaignWebhook = async (values: any) => {
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
            intent: "Create campaign",
            content: values,
          }),
        }
      );
      const data = await response.json();
      //  const result = await response.json();

      if (data[0].output.status == "fail") {
        showErrorToast("Failed to trigger webhook");
        setShowLoader(false);
        return false;
      }

      // Assuming the response is an array like:
      // [ { output: { companyId: "1", campaignId: "21", status: "success" } } ]
      const campaignId = data[0]?.output?.campaignId;

    
      dispatch(setCampaignID({ campaignId: campaignId }));

      // showSuccessToast('Webhook triggered successfully');
      // navigate(`/creatCampaign/${campaignId}`)
      // Refresh list and scroll to it
      setShowLoader(false);
      scrollIntoRecords(campaignId);
    } catch (error) {
      setShowLoader(false);
      showErrorToast("Error in generating the campaign.");
    }
  };

  const lastCampaignRef = useRef<HTMLDivElement | null>(null);

  const scrollIntoRecords = async (highlightId?: string) => {
    const { data, error } = await supabase
      .from("campaignList")
      .select("*")
      .eq("companyId", companyId)
      .order("createdAt", { ascending: false }); // Sort by latest first

    setCampaignList(data || []);

    // Wait for DOM update, then scroll
    // setTimeout(() => {
    //   if (highlightId && lastCampaignRef.current) {
    //     lastCampaignRef.current.scrollIntoView({
    //       behavior: "smooth",
    //       block: "center",
    //     });
    //   }
    // }, 100);
  };

  const handleCreate = (values: {
    campaignName: string;
    targetMarket: string;
    brandIndustry: string;
    brandName: string;
  }) => {
    setShowLoader(true);
  
    dispatch(campaignDetails(values));
    campaignWebhook(values);
  };

  const handleCreateNew = (event: any) => {
    setOpen(true);
  };

  const formRef = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setOpen(false);
        setConnectOpen(false);
      }
    };

    if (open || connectOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, connectOpen]);

  const gradientInputSx = {
    // background: "rgba(255, 255, 255, 0.08)",
     background:"transparent",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "white",
    borderRadius: 2,
    transition: "all 0.2s ease",
    fontWeight: 400,
    fontSize: 16,
    width: "100%",
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: "none",
      },
      "&:hover fieldset": {
        border: "none",
      },
      "&.Mui-focused fieldset": {
        border: "none",
      },
      "&:hover": {
        background: "rgba(255, 255, 255, 0.12)",
        border: "1px solid rgba(255, 255, 255, 0.4)",
      },
      "&.Mui-focused": {
        background: "rgba(255, 255, 255, 0.15)",
        border: "1px solid rgba(107, 76, 200, 0.6)",
        boxShadow: "0 0 0 3px rgba(107, 76, 200, 0.1)",
      },
    },

    "& .MuiInputBase-input": {
      color: "white",
      "&::placeholder": {
        color: "rgba(255, 255, 255, 0.6)",
        opacity: 1,
      },
    },

    "& .MuiInputLabel-root": {
      color: "rgba(255, 255, 255, 0.8)",
    },
    "& .MuiSelect-icon": {
      color: "rgba(255, 255, 255, 0.8)",
    },
    "& .MuiChip-root": {
      background: "#2d2363",
      color: "white",
      fontWeight: 700,
      fontSize: 14,
      borderRadius: 2,
    },
  };

  const [campaignList, setCampaignList] = useState<any>([]);
  const fetchRecords = async () => {
    const data: any = await supabase
      .from("campaignList")
      .select("*")
      .eq("companyId", companyId) // Filter by companyId
      .order("createdAt", { ascending: false }); // Sort by latest first
  
    setCampaignList(data.data);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleVieDetails = (id: any) => {
    dispatch(resetCampaign()); // ✅ clear Redux state

    navigate(`/creatCampaign/${id}/#FileUpload`);
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const moreIconOpen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const ITEM_HEIGHT = 48;
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: "grid" | "list" | null
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  return (
    <Box
      sx={{
        // backdropFilter: "blur(2px)",
        height: "-webkit-fill-available",
        p: 5,
        borderRadius: "10px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: "10px 20px",
        }}
      >
        <Box sx={{ display: "flex", gap: 3, position: "relative" }}>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              // border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                // border: "1px solid rgba(255, 255, 255, 0.6)",
                // background: "rgba(255, 255, 255, 0.1)",
              },
            }}
            onClick={handleCreateNew}
          >
            <Add sx={{ color: "rgb(255 255 255 )", fontSize: "18px" }} />
            <Typography
              sx={{
                fontSize: "16px",
                color: "white",
              }}
            >
              New Campaign
            </Typography>
          </Box>
         
          {/* Not required in campaign page */}
          {/* <HamburgerMenu /> */}
         
          {open && (
            <div className="campaign-form-container">
              <form
                className="campaign-form"
                ref={formRef}
                onSubmit={formik.handleSubmit}
                style={{ width: "100%" }}
              >
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    id="campaignName"
                    name="campaignName"
                    placeholder="Campaign Name"
                    fullWidth
                    InputProps={{
                      sx: gradientInputSx,
                    }}
                    FormHelperTextProps={{
                      sx: { color: "red", mt: 0 },
                    }}
                    value={formik.values.campaignName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.campaignName &&
                      Boolean(formik.errors.campaignName)
                    }
                  />

                  <TextField
                    id="brandIndustry"
                    name="brandIndustry"
                    placeholder="Industry"
                    fullWidth
                    InputProps={{
                      sx: gradientInputSx,
                    }}
                    value={formik.values.brandIndustry}
                    FormHelperTextProps={{
                      sx: { color: "red", mt: 0 },
                    }}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.brandIndustry &&
                      Boolean(formik.errors.brandIndustry)
                    }
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 3, mt: "20px" }}>
                  <TextField
                    id="brandName"
                    name="brandName"
                    placeholder="Brand Name"
                    fullWidth
                    InputProps={{
                      sx: gradientInputSx,
                    }}
                    value={formik.values.brandName}
                    FormHelperTextProps={{
                      sx: { color: "red", mt: 0 },
                    }}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.targetMarket &&
                      Boolean(formik.errors.targetMarket)
                    }
                  />

                  <TextField
                    id="targetMarket"
                    name="targetMarket"
                    placeholder="Market"
                    fullWidth
                    InputProps={{
                      sx: gradientInputSx,
                    }}
                    value={formik.values.targetMarket}
                    FormHelperTextProps={{
                      sx: { color: "red", mt: 0 },
                    }}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.targetMarket &&
                      Boolean(formik.errors.targetMarket)
                    }
                  />
                  <Box
                    onClick={() => {
                      formik.handleSubmit(); // manually trigger submit
                      setOpen(false); // close the form
                    }}
                    sx={{
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      p: "15px 12px",
                      cursor: "pointer",
                      height: "max-content",
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "10px",
                      "&:hover": {
                        background: "#6b4cc8",
                      },
                    }}
                  >
                    <Done sx={{ color: "rgba(255, 255, 255, 0.8)" }} />
                  </Box>
                </Box>
              </form>
            </div>
          )}
        </Box>
      </Box>

      {/* View Mode Toggle - Positioned at top right of campaign list area */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 2,
          px: "10px",
          width: "80vw", // Match the width of the campaign list container
        }}
      >
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              color: "rgba(255, 255, 255, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              fontSize: "12px",
              padding: "4px 8px",
              minWidth: "32px",
              height: "28px",
              "&.Mui-selected": {
                backgroundColor: "rgba(107, 76, 200, 0.8)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(107, 76, 200, 0.9)",
                },
              },
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            },
          }}
        >
          <ToggleButton value="grid" aria-label="grid view">
            <ViewModuleIcon sx={{ fontSize: "16px" }} />
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ViewListIcon sx={{ fontSize: "16px" }} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box
        className="campaigns-grid"
        sx={{
          display: viewMode === "grid" ? "grid" : "flex",
          flexDirection: viewMode === "list" ? "column" : "row",
          gridTemplateColumns:
            viewMode === "grid"
              ? {
                  xs: "repeat(auto-fill, minmax(300px, 1fr))",
                }
              : "none",
          gap: 3,
          width: "80vw",
          mt: 2,
        }}
      >
        {campaignList.length > 0 &&
          campaignList.map((campaign: any, index: any) => (
            <Box
              ref={index === campaignList.length - 1 ? lastCampaignRef : null}
              onClick={() => handleVieDetails(campaign.id)}
              key={campaign.id}
              sx={{
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                boxShadow: "0px 10px 20px #2e3a3e",
                p: 3,
                color: "white",
                borderRadius: 4,
                position: "relative",
                display: "flex",
                cursor:"pointer",
                flexDirection: viewMode === "list" ? "row" : "column",
                gap: viewMode === "list" ? 3 : 1,
                width: "auto",
                alignItems: viewMode === "list" ? "flex-start" : "stretch",
                "&:hover": {
                  background: "rgba(0, 0, 53, 0.5)",
                  borderColor: "rgba(255, 255, 255, 0.35)",
                },
              }}
            >
              <IconButton
                aria-label="more"
                id="long-button"
                aria-controls={moreIconOpen ? "long-menu" : undefined}
                aria-expanded={moreIconOpen ? "true" : undefined}
                aria-haspopup="true"
                onClick={(e) => handleClick(e)}
                sx={{ position: "absolute", right: "10px", p: "5px" }}
              >
                <MoreVertIcon sx={{ color: "rgb(255 255 255 / 54%)" }} />
              </IconButton>

              {/* Campaign Name - Fixed width for list view */}
              <Box
                sx={{
                  boxShadow: "0 0px 0px rgba(99, 102, 241, 0.3)",
                  borderRadius: "4px",
                  padding: "7px 12px",
                  width: viewMode === "list" ? "200px" : "auto",
                  maxWidth: viewMode === "list" ? "200px" : "80%",
                  mb: viewMode === "list" ? 0 : 1,
                  flexShrink: 0,
                  wordWrap: "break-word",
                  background:
                    "linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.8))",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    whiteSpace: "normal",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: viewMode === "list" ? 2 : "unset",
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {campaign.campaignName}
                </Typography>
              </Box>

              {viewMode === "list" && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    flex: 1,
                    minWidth: 0, // Allow flex items to shrink below content size
                    ml: 2, // Add margin between campaign name and BRAND section
                  }}
                >
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Box sx={{ minWidth: "100px" }}>
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          textTransform: "uppercase",
                          fontSize: "12px",
                          mb: 0.5,
                        }}
                      >
                        Brand
                      </Typography>
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.9)",
                          fontSize: "14px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {campaign.brandName}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: "100px" }}>
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          textTransform: "uppercase",
                          fontSize: "12px",
                          mb: 0.5,
                        }}
                      >
                        Market
                      </Typography>
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.9)",
                          fontSize: "14px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {campaign.targetMarket}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: "100px" }}>
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          textTransform: "uppercase",
                          fontSize: "12px",
                          mb: 0.5,
                        }}
                      >
                        Industry
                      </Typography>
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.9)",
                          fontSize: "14px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {campaign.brandIndustry}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {viewMode === "grid" && (
                <>
                  <Box sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    <Typography sx={{ mt: 2 }}>
                      <span
                        style={{
                          color: "rgba(255, 255, 255, 0.6)",
                          textTransform: "uppercase",
                        }}
                      >
                        Brand{" "}
                      </span>
                    </Typography>
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                      {campaign.brandName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ mt: 2 }}>
                      <span
                        style={{
                          color: "rgba(255, 255, 255, 0.6)",
                          textTransform: "uppercase",
                        }}
                      >
                        {" "}
                        Market{" "}
                      </span>
                    </Typography>
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                      {campaign.targetMarket}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ mt: 2 }}>
                      <span
                        style={{
                          color: "rgba(255, 255, 255, 0.6)",
                          textTransform: "uppercase",
                        }}
                      >
                        {" "}
                        Industry{" "}
                      </span>
                    </Typography>
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                      {campaign.brandIndustry}
                    </Typography>
                  </Box>
                </>
              )}

              <Chip
                label="Active"
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))",
                  margin: viewMode === "list" ? "0 0 0 auto" : "auto",
                  mt: viewMode === "list" ? 0 : 3,
                  marginRight: viewMode === "list" ? "40px" : 0,
                  color: "rgba(34, 197, 94, 0.9)",
                  width: "max-content",
                  textTransform: "uppercase",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  flexShrink: 0,
                }}
              />

              {/* <AppButton variantType="primary" sx={{mt:3,width:"max-content"}} >View Details</AppButton> */}
            </Box>
          ))}
      </Box>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={moreIconOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {},
          list: {
            "aria-labelledby": "long-button",
          },
        }}
      >
        <MenuItem key="delete" onClick={handleClose}>
          <DeleteIcon sx={{ color: "red" }} />
          Delete
        </MenuItem>
      </Menu>
      {showLoader && <AnimatedLoader />}
    </Box>
  );
};
export default CampaignList;
