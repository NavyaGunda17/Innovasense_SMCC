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
import StergteicObjective, { StrategicObjectiveHandle } from "../features/createcampaign/StrategicObjective";
import TargetSegments, { TargetSegmentsHandle } from "../features/createcampaign/TargetSegments";
import GaurdRails, { GaurdRailsHandle } from "../features/createcampaign/GaurdRails";
import CampaignCalendar from "../features/createcampaign/CampaignCalendar";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { setGeneratedCampaignDetails } from "../reducer/campaignSlice";
import AnimatedLoader from "./AnimatedLoader";
import SendIcon from "@mui/icons-material/Send";
import FileUpload, { FileUploadHandle } from "./FileUpload";
import FileUploadSummary from "../features/createcampaign/FileUploadSummary";
import { useError } from "../context/ErrorToastContext";
const items = [
   {
    title: "File Upload",
    objective:"FileUpload",
  },
  {
    title: "File Summary",
    objective:"FileSummary",
  },
  
  {
    title: "Stragtegic Objective",
    objective:"StrategicObjective",
  },
  {
    title: "Target Segments",
    objective:"TargetSegments"
  },
 
  {
    title: "Campaign Calendar",
     objective:"KeyDates"
  },
];

type CarouselDropdownProps = {
  showCampaignKnowledgeBase:()=> void;
  selectedMenu:string
}
const CarouselDropdown:React.FC<CarouselDropdownProps> = ({showCampaignKnowledgeBase,selectedMenu}) =>  {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showLoader, setShowLoader] = useState(false)

  const nodeRef = useRef(null);
  const { showErrorToast} =useError()

  const dispatch = useDispatch<AppDispatch>();
  const campaign = useSelector(
    (state: RootState) => state.campaign.enumerations
  );
  console.log("campaign", campaign);
  useEffect(() => {
    dispatch(fetchCampaignEnumerations());
  }, []);


  useEffect(()=>{
    if(selectedMenu){
        const index = items.findIndex(
  (item:any) => item.objective.toLowerCase() === selectedMenu.toLowerCase()
);
 setIndex(index);
        console.log("selectedMenu",selectedMenu,index)
    }
  },[selectedMenu])


  useEffect(()=>{

  },[index])
  const prev = () => {
    
    if (index > 0) {
      setDirection("left");
      setIndex((i) => i - 1);
      setDropdownOpen(false); // Close dropdown when changing
      handlePreviousStep()


      const newIndex = index - 1;
      const nextItem = items[newIndex];
      navigate(`/creatCampaign/${campaignId}#${nextItem.objective}`);

    }
  };
const campaignState = useSelector((state: RootState) => state.campaign)
const campaignId = useSelector((state: RootState) => state.campaign.campaignId)
const navigate = useNavigate()

const companyId = useSelector((state: RootState) => state.auth.companyId)
  const next = async() => {
    const nextvalue = await handleSaveButton()
    if(!nextvalue){
      return false
    }
    console.log("next====>",nextvalue)
    if (index < items.length - 1) {
      const newIndex = index + 1;
    const nextItem = items[newIndex];

      handleNextStep()
      setDirection("right");
      setIndex((i) => i + 1);
      setDropdownOpen(false);
      navigate(`/creatCampaign/${campaignId}#${nextItem.objective}`);

    }
    if(index == items.length-1){
      setShowLoader(true)
   handleSaveKnowledge()
   

    }
  };
  
  
  const handleSaveKnowledge = async()=>{
        console.log(campaignState,"handleSaveKnowledge")
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
        showErrorToast('Error in craeting the knowledge base');
         setShowLoader(false)
        return false
      }
     showCampaignKnowledgeBase()
        setShowLoader(false)
         showErrorToast('Error in craeting the knowledge base');
      navigate(`/creatCampaign/${campaignId}#AIGeneratedBase`);
    } catch (error) {
       setShowLoader(false)
      showErrorToast('Error in craeting the knowledge base');
    }
  }



  const closeDrodpownOpen = () => {
     setDropdownOpen(false);
  }


  const {id} =useParams()

    const fileUploadRef = useRef<FileUploadHandle>(null); // for StrategicObjective
     const fileSumamryRef = useRef<FileUploadHandle>(null); // for StrategicObjective
    const strategicRef = useRef<StrategicObjectiveHandle>(null); // for StrategicObjective
    
const targetSegmentsRef = useRef<TargetSegmentsHandle>(null); // for targetSegments
const campaignCalendarRef = useRef<any>(null); // for targetSegments
const gaurdrailsRef = useRef<GaurdRailsHandle>(null); // for gaurdrailsRef

  const handleSaveButton = async() => {
    let saveRetunValue;
    if (items[index].title === "File Upload") {
     saveRetunValue =  await fileUploadRef.current?.save(); // call child's exposed method
     setCurrentStep("File Summary")
     
    }
     if (items[index].title === "File Summary") {
     saveRetunValue =  await fileSumamryRef.current?.save(); // call child's exposed method
     setCurrentStep("Stragtegic Objective")
     
    }

    if (items[index].title === "Stragtegic Objective") {
     saveRetunValue =  await strategicRef.current?.save(); // call child's exposed method
     setCurrentStep("Target Segments")
     
    }
     if (items[index].title === "Target Segments") {
      saveRetunValue = await targetSegmentsRef.current?.save(); // call child's exposed method
        setCurrentStep("Campaign Calendar")
      
      
    }
     if (items[index].title === "Campaign Calendar") {
      saveRetunValue = await campaignCalendarRef.current?.save(); // call child's exposed method
     
    }
    
    return saveRetunValue
  };

   

  const [is3DTransitioning, setIs3DTransitioning] = useState(false)
  const [transitionPhase, setTransitionPhase] = useState('idle') // 'idle', 'shrinking', 'growing'
   const [currentStep, setCurrentStep] = useState('objective') // 'objective' or 'segments'

const handleNextStep = () => {
  if (is3DTransitioning) return;

  if (index < items.length - 1) {
    setIs3DTransitioning(true);
    setTransitionPhase('shrinking');

    setTimeout(() => {
      // setIndex((prev) => prev + 1);

      setTimeout(() => {
        setTransitionPhase('growing');

        setTimeout(() => {
          setIs3DTransitioning(false);
          setTransitionPhase('idle');
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
    setTransitionPhase('shrinking');

    setTimeout(() => {
      // setIndex((prev) => prev - 1);

      setTimeout(() => {
        setTransitionPhase('growing');

        setTimeout(() => {
          setIs3DTransitioning(false);
          setTransitionPhase('idle');
        }, 300);
      }, 30);
    }, 300);
  } else {
    // Optional: onBack() to go to previous page
    console.log("Reached first step");
  }
};


const hanldeNextCalendar = () =>{
  console.log("sds")
     navigate(`/creatCampaign/${campaignId}#AIGeneratedBase`, { replace: false });

}

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
   

        <Box sx={{position:"relative"}}
        >
           <div 
            onClick={prev}
            className={`nav-arrow nav-arrow-up ${is3DTransitioning ? 'transitioning-3d' : ''} ${transitionPhase !== 'idle' ? `phase-${transitionPhase}` : ''}`}
            style={{
              pointerEvents: is3DTransitioning ? 'none' : 'auto',
              opacity: is3DTransitioning ? 0.3 : 1,
               width:"min-content",
              margin:"auto"
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </div>
          {items[index].title == "File Upload" && (
           <FileUpload ref={fileUploadRef} transitionPhase={transitionPhase} is3DTransitioning={is3DTransitioning} />
          )}

            {items[index].title == "File Summary" && (
           <FileUploadSummary ref={fileSumamryRef} transitionPhase={transitionPhase} is3DTransitioning={is3DTransitioning}  />
          )}


          {items[index].title == "Stragtegic Objective" && (
            <StergteicObjective  ref={strategicRef}  transitionPhase={transitionPhase} is3DTransitioning={is3DTransitioning}/> 
          )}

          {items[index].title == "Target Segments" && <TargetSegments  ref={targetSegmentsRef} next={next} transitionPhase={transitionPhase} is3DTransitioning={is3DTransitioning} />}
          {items[index].title == "Guardrails" && <GaurdRails ref={gaurdrailsRef} next={next} transitionPhase={transitionPhase} is3DTransitioning={is3DTransitioning}/>}
          {items[index].title == "Campaign Calendar" && 
          <> <CampaignCalendar ref={campaignCalendarRef} closeDrodpownOpen={closeDrodpownOpen} />
         
          </>
         
          
          }
           {/* Next Arrow - always show, enabled based on selections */}
          <div 
          onClick={next}
            className={`nav-arrow nav-arrow-down ${
              (currentStep === 'objective') || 
              (currentStep === 'segments' ) 
                ? 'enabled' : 'dimmed'
            } ${is3DTransitioning ? 'transitioning-3d' : ''} ${transitionPhase !== 'idle' ? `phase-${transitionPhase}` : ''}`}
      
            style={{
              pointerEvents: is3DTransitioning ? 'none' : 'auto',
              opacity: is3DTransitioning ? 0.3 : 1,
                width:"min-content",
              margin:"auto"
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
 {items[index].title == "Campaign Calendar" && campaignState?.brandTone && 

            <AppButton
       variantType="secondary"
        endIcon={<SendIcon />}
        onClick={hanldeNextCalendar}
       
        sx={{ height: "56px" ,mt:3,float:"right",position:"fixed",bottom:"100px",right:"100px"}} // match TextField height
      >
        Continue</AppButton>
}
        </Box>
        {showLoader &&  <AnimatedLoader /> }
       
      {/* </Collapse> */}
    </Box>
  );
}
export default CarouselDropdown