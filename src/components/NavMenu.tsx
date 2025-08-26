import React, { useRef, useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import "./NavMenu.css";
import {
  Box,
  Typography,
  TextField,
  Collapse,
  Button,
  Autocomplete,
} from "@mui/material";
import AppButton from "./AppButton";
import { useDispatch, useSelector } from "react-redux";
import { fetchCampaignEnumerations } from "../reducer/campaignThunk";
import { AppDispatch, RootState } from "../store/store";
import StergteicObjective, {
  StrategicObjectiveHandle,
} from "../features/createcampaign/StrategicObjective";
import TargetSegments, {
  TargetSegmentsHandle,
} from "../features/createcampaign/TargetSegments";
import GaurdRails, {
  GaurdRailsHandle,
} from "../features/createcampaign/GaurdRails";
import CampaignCalendar from "../features/createcampaign/CampaignCalendar";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { setGeneratedCampaignDetails } from "../reducer/campaignSlice";
import AnimatedLoader from "./AnimatedLoader";
import SendIcon from "@mui/icons-material/Send";
import FileUpload, { FileUploadHandle } from "./FileUpload";
import FileUploadSummary from "../features/createcampaign/FileUploadSummary";
import { useError } from "../context/ErrorToastContext";
import { selectIsGenerateEnabled } from "../selectors/campaignSelectors";
const items = [
  {
    title: "File Upload",
    objective: "FileUpload",
  },
  {
    title: "File Summary",
    objective: "FileSummary",
  },

  {
    title: "Stragtegic Objective",
    objective: "StrategicObjective",
  },
  {
    title: "Target Segments",
    objective: "TargetSegments",
  },

  {
    title: "Campaign Calendar",
    objective: "KeyDates",
  },
];

type CarouselDropdownProps = {
  showCampaignKnowledgeBase: () => void;
  selectedMenu: string;
};
const CarouselDropdown: React.FC<CarouselDropdownProps> = ({
  showCampaignKnowledgeBase,
  selectedMenu,
}) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showLoader, setShowLoader] = useState(false);
  const [calendarModified, setCalendarModified] = useState(false);

  const nodeRef = useRef(null);
  const { showErrorToast } = useError();

  const dispatch = useDispatch<AppDispatch>();
  const campaign = useSelector(
    (state: RootState) => state.campaign.enumerations
  );
  console.log("campaign", campaign);
  useEffect(() => {
    dispatch(fetchCampaignEnumerations());
  }, []);

  useEffect(() => {
    if (selectedMenu) {
      const index = items.findIndex(
        (item: any) =>
          item.objective.toLowerCase() === selectedMenu.toLowerCase()
      );
      setIndex(index);
      console.log("selectedMenu", selectedMenu, index);
    }
  }, [selectedMenu]);

  useEffect(() => {}, [index]);
  const prev = () => {
    if (index > 0) {
      setDirection("left");
      let newIndex = index - 1;

      // If we're on Strategic Objective (index 2) and going back to File Summary (index 1)
      // and there's no file uploaded, skip to File Upload (index 0)
      if (index === 2 && !campaignState?.generatedFileSummary) {
        newIndex = 0;
      }

      setIndex(newIndex);
      setDropdownOpen(false);
      handlePreviousStep();

      const nextItem = items[newIndex];
      navigate(`/creatCampaign/${campaignId}#${nextItem.objective}`);
    }
  };
  const campaignState = useSelector((state: RootState) => state.campaign);
  const campaignId = useSelector(
    (state: RootState) => state.campaign.campaignId
  );
  const navigate = useNavigate();

  const companyId = useSelector((state: RootState) => state.auth.companyId);
  const next = async () => {
    const nextvalue = await handleSaveButton();
    if (!nextvalue) {
      return false;
    }

    handleNextStep();
    setDirection("right");
    setDropdownOpen(false);

    // Special handling for File Upload step
    if (index === 0) {
      if (campaignState?.fileUpload?.length > 0) {
        setIndex(1); // Go to File Summary
        navigate(`/creatCampaign/${campaignId}#FileSummary`);
      } else {
        setIndex(2); // Skip to Strategic Objective
        navigate(`/creatCampaign/${campaignId}#StrategicObjective`);
      }
      return;
    }

    // Normal flow for other steps
    if (index < items.length - 1) {
      const newIndex = index + 1;
      const nextItem = items[newIndex];
      setIndex(newIndex);
      navigate(`/creatCampaign/${campaignId}#${nextItem.objective}`);
    }

    // Handle last step
    if (index === items.length - 1) {
      setShowLoader(true);
      handleSaveKnowledge();
    }
  };

  const handleSaveKnowledge = async () => {
    console.log(campaignState, "handleSaveKnowledge");
    try {
      const response = await fetch("https://innovasense.app.n8n.cloud/webhook/smcc/brain", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
         companyId:companyId,
         campaignId:campaignState?.campaignId ? campaignState?.campaignId :  20,
         intent:"Fill info manually",
         content:{
          strategicObjective:campaignState?.strategicObjective,
          segment:campaignState?.segment,
          psychographics:campaignState?.psychographics,
          startDate:campaignState?.startDate,
          campaignDuration:campaignState?.campaignDuration,
          guardrails:campaignState?.guardrails,
          demographics:campaignState?.demographics,
          // ...showCampaignGoal ? {campaignGoal:""}:{}
         }
        }),
      });

      const result = await response.json();

      if (result[0].output.status == "fail") {
        showErrorToast("Error in craeting the knowledge base");
        setShowLoader(false);
        return false;
      }
      showCampaignKnowledgeBase();
      setShowLoader(false);
      // showErrorToast("Error in craeting the knowledge base");
      navigate(`/creatCampaign/${campaignId}#AIGeneratedBase`);
    } catch (error) {
      setShowLoader(false);
      showErrorToast("Error in craeting the knowledge base");
    }
  };

  const closeDrodpownOpen = () => {
    setDropdownOpen(false);
  };

  const { id } = useParams();

  const fileUploadRef = useRef<FileUploadHandle>(null); // for StrategicObjective
  const fileSumamryRef = useRef<FileUploadHandle>(null); // for StrategicObjective
  const strategicRef = useRef<StrategicObjectiveHandle>(null); // for StrategicObjective

  const targetSegmentsRef = useRef<TargetSegmentsHandle>(null); // for targetSegments
  const campaignCalendarRef = useRef<any>(null); // for targetSegments
  const gaurdrailsRef = useRef<GaurdRailsHandle>(null); // for gaurdrailsRef

  const handleSaveButton = async () => {
    let saveRetunValue;
    if (items[index].title === "File Upload") {
      // For File Upload, we don't need to enforce saving if there are no files
      
      if (campaignState?.fileUpload?.length > 0) {
        saveRetunValue = await fileUploadRef.current?.save(); // call child's exposed method
        setCurrentStep("File Summary");
      } else {
        // If no files uploaded, we consider it as successful and skip to Strategic Objective
        saveRetunValue = true;
        setCurrentStep("Stragtegic Objective");
      }
    } else if (items[index].title === "File Summary") {
      saveRetunValue = await fileSumamryRef.current?.save(); // call child's exposed method
      setCurrentStep("Stragtegic Objective");
    } else if (items[index].title === "Stragtegic Objective") {
      saveRetunValue = await strategicRef.current?.save(); // call child's exposed method
      setCurrentStep("Target Segments");
    } else if (items[index].title === "Target Segments") {
      saveRetunValue = await targetSegmentsRef.current?.save(); // call child's exposed method
      setCurrentStep("Campaign Calendar");
    } else if (items[index].title === "Campaign Calendar") {
      saveRetunValue = await campaignCalendarRef.current?.save(); // call child's exposed method
    }

    return saveRetunValue;
  };

  const [is3DTransitioning, setIs3DTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState("idle"); // 'idle', 'shrinking', 'growing'
  const [currentStep, setCurrentStep] = useState("objective"); // 'objective' or 'segments'

  const handleNextStep = () => {
    if (is3DTransitioning) return;

    if (index < items.length - 1) {
      setIs3DTransitioning(true);
      setTransitionPhase("shrinking");

      setTimeout(() => {
        // setIndex((prev) => prev + 1);

        setTimeout(() => {
          setTransitionPhase("growing");

          setTimeout(() => {
            setIs3DTransitioning(false);
            setTransitionPhase("idle");
          }, 300);
        }, 30);
      }, 300);
    } else {
      // Final submission or summary
      console.log("Finished last step:", items[index].title);
    }
  };

  const handlePreviousStep = () => {
    if (is3DTransitioning) return;

    if (index > 0) {
      setIs3DTransitioning(true);
      setTransitionPhase("shrinking");

      setTimeout(() => {
        // setIndex((prev) => prev - 1);

        setTimeout(() => {
          setTransitionPhase("growing");

          setTimeout(() => {
            setIs3DTransitioning(false);
            setTransitionPhase("idle");
          }, 300);
        }, 30);
      }, 300);
    } else {
      // Optional: onBack() to go to previous page
      console.log("Reached first step");
    }
  };

  const hanldeNextCalendar = () => {
    console.log("sds");
    navigate(`/creatCampaign/${campaignId}#AIGeneratedBase`, {
      replace: false,
    });
  };

  const handleFormWizardClick = (title:string) =>{
    console.log("handleFormWizardClick",title)
    if(title == "File Upload" ){
setIndex(0)
    }else if(title == "File Summary" && campaignState?.generatedFileSummary){
setIndex(1)
    }else if(title =="Stragtegic Objective" && campaignState?.strategicObjective){
setIndex(2)
    }else if(title =="Target Segments"  && campaignState?.segment){
setIndex(3)
    }else if(title =="Campaign Calendar"  && campaignState?.campaignDuration){
setIndex(4)
    }
    
  }


useEffect(()=>{
  console.log("calendarModified",calendarModified)
},[calendarModified])



const isGenerateEnabled = useSelector((state: RootState) =>
    selectIsGenerateEnabled(state)
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        color: "#fff",
      }}
      ref={dropdownRef}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            // backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: "12px 24px",
            borderRadius: "12px",
            // backdropFilter: "blur(8px)",
            // boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: idx === index ? "#fff" : "rgba(255, 255, 255, 0.6)",
                  transition: "all 0.3s ease",
                }}
              >
                <Box
                  sx={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: idx === index ? "#00000075" : "transparent",
                    border:
                      idx === index
                        ? "none"
                        : "1px solid rgba(255, 255, 255, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "8px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {idx + 1}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                  onClick={()=>handleFormWizardClick(item.title)}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: idx === index ? "600" : "400",
                      color:
                        idx === index ? "white" : "rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>
              </Box>
              {idx < items.length - 1 && (
                <Box
                  sx={{
                    width: "40px",
                    height: "1px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    margin: "0 8px",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Box>
      </Box>
      <Box sx={{ position: "relative" }}>
        {items[index].title == "File Upload" && (
          <FileUpload
            ref={fileUploadRef}
            transitionPhase={transitionPhase}
            is3DTransitioning={is3DTransitioning}
          />
        )}

        {items[index].title == "File Summary" && (
          <FileUploadSummary
            ref={fileSumamryRef}
            transitionPhase={transitionPhase}
            is3DTransitioning={is3DTransitioning}
          />
        )}

        {items[index].title == "Stragtegic Objective" && (
          <StergteicObjective
            ref={strategicRef}
            transitionPhase={transitionPhase}
            is3DTransitioning={is3DTransitioning}
          />
        )}

        {items[index].title == "Target Segments" && (
          <TargetSegments
            ref={targetSegmentsRef}
            next={next}
            transitionPhase={transitionPhase}
            is3DTransitioning={is3DTransitioning}
          />
        )}
        {items[index].title == "Guardrails" && (
          <GaurdRails
            ref={gaurdrailsRef}
            next={next}
            transitionPhase={transitionPhase}
            is3DTransitioning={is3DTransitioning}
          />
        )}
        {items[index].title == "Campaign Calendar" && (
          <>
            {" "}
            <CampaignCalendar
              ref={campaignCalendarRef}
              closeDrodpownOpen={closeDrodpownOpen}
                onModifiedChange={setCalendarModified}
            />
          </>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "20px",
            width: "100%",
            mt: 4,
            mb: 2,
            paddingRight: "100px",
          }}
        >
          {/* <button
      style={{
        padding: "10px 20px",
        backgroundColor: isGenerateEnabled ? "#4CAF50" : "#2196F3",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
      }}
    >
      {isGenerateEnabled ? "Generate" : "Next"}
    </button> */}
          <button
            onClick={prev}
            style={{
              padding: "10px 32px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              cursor: is3DTransitioning ? "not-allowed" : "pointer",
              fontSize: "16px",
              transition: "all 0.3s ease",
              opacity: is3DTransitioning ? 0.3 : 1,
              pointerEvents: is3DTransitioning ? "none" : "auto",
              backdropFilter: "blur(8px)",
              boxShadow:
                "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
              letterSpacing: "0.5px",
              fontWeight: "500",
            }}
            onMouseOver={(e) => {
              if (!is3DTransitioning) {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)";
            }}
          >
            Back
          </button>
        
{items[index].title === "Campaign Calendar" ? (
    <button
      onClick={
        campaignState?.messagingPillars ? hanldeNextCalendar : next
      }
      style={{
        padding: "10px 32px",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        color: "white",
        border: "1px solid rgba(0, 123, 255, 0.3)",
        borderRadius: "8px",
        cursor: is3DTransitioning ? "not-allowed" : "pointer",
        fontSize: "16px",
        transition: "all 0.3s ease",
        opacity: is3DTransitioning ? 0.3 : 1,
        pointerEvents: is3DTransitioning ? "none" : "auto",
        backdropFilter: "blur(8px)",
        boxShadow:
          "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        letterSpacing: "0.5px",
        fontWeight: "500",
      }}
    >
      {campaignState?.messagingPillars  ? "Next" : "Generate"}
    </button>
  ) : (
    <button
      onClick={next}
      style={{
        padding: "10px 32px",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        color: "white",
        border: "1px solid rgba(0, 123, 255, 0.3)",
        borderRadius: "8px",
        cursor: is3DTransitioning ? "not-allowed" : "pointer",
        fontSize: "16px",
        transition: "all 0.3s ease",
        opacity: is3DTransitioning ? 0.3 : 1,
        pointerEvents: is3DTransitioning ? "none" : "auto",
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
        
 {/* <button
            onClick={next}
            style={{
              padding: "10px 32px",
              backgroundColor: "rgba(0, 123, 255, 0.2)",
              color: "white",
              border: "1px solid rgba(0, 123, 255, 0.3)",
              borderRadius: "8px",
              cursor: is3DTransitioning ? "not-allowed" : "pointer",
              fontSize: "16px",
              transition: "all 0.3s ease",
              opacity: is3DTransitioning ? 0.3 : 1,
              pointerEvents: is3DTransitioning ? "none" : "auto",
              backdropFilter: "blur(8px)",
              boxShadow:
                "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
              letterSpacing: "0.5px",
              fontWeight: "500",
            }}
            onMouseOver={(e) => {
              if (!is3DTransitioning) {
                e.currentTarget.style.backgroundColor =
                  "rgba(0, 123, 255, 0.3)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 123, 255, 0.2)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)";
            }}
          >
           Next
          </button> */}
       
         
        </Box>
        {/* {items[index].title == "Campaign Calendar" &&
          campaignState?.brandTone && (
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
          )} */}
      </Box>
      {showLoader && <AnimatedLoader />}

      {/* </Collapse> */}
    </Box>
  );
};
export default CarouselDropdown;
