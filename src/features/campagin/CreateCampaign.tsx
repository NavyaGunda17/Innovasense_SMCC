import { Accordion, Box, Typography,AccordionSummary,AccordionDetails } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useEffect, useState } from "react";
import "./CreateCampaign.css";
import NavMenu from "../../components/NavMenu";
import AppButton from "../../components/AppButton";
import { useError } from "../../context/ErrorToastContext";
import { useSuccess } from "../../context/SuccessToastContext";
import CampaignGoal from "../createcampaign/CampaignGoal";
import CampaignStructure from "../createcampaign/CampaignStructure";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useDispatch } from "react-redux";
import { calendar, campaignDetails, gaurdRails, segments, setCampaignGoal, setCampaignID, setGeneratedCampaignDetails, setGeneratedCampaignGoal, setGeneratedCampaignstructure, stretegyObjectives } from "../../reducer/campaignSlice";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CampaignGoal1 from "../createcampaign/CampaignGoal1";
import CampaignStructureDetails from "../createcampaign/CampaignStructureDetails";
import TabNavigation from "../../components/TabNavigation";
import LogoutIcon from '@mui/icons-material/Logout';
import { logout } from "../../reducer/authSlice";
import TopControls from "../../components/TopControl";
import HamburgerMenu from "../../components/HamburgerMenu";
import CampaignGoalTemplate from "../createcampaign/CampaignGoalTemplate";


const CreateCampaign = () => {
  const campaignName = useSelector(
    (state: RootState) => state.campaign.campaignName
  );
  const { id } = useParams();

  const location = useLocation()

  const { showErrorToast} = useError()
  const { showSuccessToast} = useSuccess()
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const naviagte = useNavigate()


  const campaignState = useSelector((state: RootState) => state.campaign);

  
  const companyId = useSelector((state: RootState) => state.auth.companyId);
  const [ showCampaignGoal, setShowCampaignGoal] = useState(false)
    const [ showGeneratedCampaognGoal, setShowGeneratedCampaognGoal] = useState(false)
   const [ showcmapiagnStructure, setShowcmapiagnStructure] = useState(false)
   const [showCriteria, showShowCriteria] = useState(true)
    const [ saveKnowledge, setSaveKnowledge] = useState(false)
  const [ selectedMenu, setSelectedMenu] = useState("")
 useEffect(() => {
    const menuElement = location.hash.replace('#', '');
   if(menuElement == "StrategicObjective" || menuElement == "TargetSegments"  || menuElement == "KeyDates" || menuElement == "FileUpload" || menuElement == "FileSummary" ){
    setSelectedMenu(menuElement)
showDefaultStrtegic()

   }
   if(menuElement == "AIGeneratedBase"){
    handleShowCampignStruccture()
   }
   if(menuElement == "Goal"){
handleShowCampaoignGoal()
   }
    if(menuElement == "AIGneeratedGoal"){
handleShowCampaignstrure()
   }
   if(menuElement == "Structure"){
handleshowCampaignGenerated()
   }
 
  }, [location]);
  useEffect(()=>{

  },[selectedMenu])

const dispatch = useDispatch()
  const renderCampaignDetials = async() => {
    const data:any= await supabase
    .from('campaignInput') // ✅ make sure the table name matches exactly
  .select('*')
  .eq('campaignId', id) 
  .single();


  dispatch(campaignDetails({
    campaignName:data?.data?.campaignName,
    targetMarket: data?.data?.targetMarket,
    brandIndustry: data?.data?.brandIndustry,
    brandName: data?.data?.brandName,
   
  }))
dispatch(setCampaignGoal({campaignGoal:data?.data?.campaignGoalUser}))
dispatch(setGeneratedCampaignGoal({generatedCampaignGoal:data?.data?.campaignGoal}))
dispatch(setGeneratedCampaignstructure({
  campaignStructureSummary:data?.data?.campaignStructureSummary,
  campaignStructureJson:data?.data?.campaignStructureJson,
  campaignMasterArticle:data?.data?.campaignMasterArticle,
  campaignMasterArticleJson:data?.data?.campaignMasterArticleJson,
}))
dispatch(stretegyObjectives({strategicObjective:data?.data?.strategicObjective}))
dispatch(segments({ segment: data?.data?.segment,
          demographics: data?.data?.demographics,
          psychographics: data?.data?.psychographics}))
dispatch(calendar({ startDate: data?.data?.startDate,campaignDuration:data?.data?.campaignDuration}))

    dispatch(gaurdRails({gaurdRails:[data?.data?.guardrails]}))     
    dispatch(setCampaignID({campaignId:data?.data?.campaignId})) 
       
        dispatch(setGeneratedCampaignDetails({
                  brandValue: data?.data?.brandValue, 
                  brandSupport: data?.data?.brandSupport,
                   messagingPillars: data?.data?.messagingPillars, 
                   constraints: data?.data?.constraints,
                  brandTone: data?.data?.brandTone
              }));
 setShowCampaignDetails(true)

  }
  useEffect(() =>{
    if(id){
      renderCampaignDetials()
    }
  },[id])

  useEffect(() =>{

  },[dispatch])


  const handleShowCampaoignGoal = () => {
    setShowCampaignGoal(true)
    setShowKnowledgeBase(false)
     setShowcmapiagnStructure(false)
      showShowCriteria(false);
       setShowGeneratedCampaognGoal(false)
     
  }
  const handleShowCampaignstrure = () =>{
     setShowCampaignGoal(false)
    setShowKnowledgeBase(false)
    setShowcmapiagnStructure(false)
     showShowCriteria(false)
       setShowGeneratedCampaognGoal(true)

  }

  const handleshowCampaignGenerated = () => {
      setShowGeneratedCampaognGoal(false)
     setShowCampaignGoal(false)
    setShowKnowledgeBase(false)
    setShowcmapiagnStructure(true)
     showShowCriteria(false)
  }
  const [ activeTab, setActiveTab] = useState(0)
  const handleTableActive = (tab:any) =>{
setActiveTab(tab)
  }

  const handleLogout = () => {
    dispatch(logout())
        naviagte('/login');
  }

  const [ showKnowledgeBase, setShowKnowledgeBase] = useState<any>(false)
  const handleShowCampignStruccture = () => {
      setShowKnowledgeBase(true)
       setShowCampaignGoal(false)
    setShowcmapiagnStructure(false)
    showShowCriteria(false)
     setShowGeneratedCampaognGoal(false)
  }

  const showDefaultStrtegic = () =>{
     setShowKnowledgeBase(false)
       setShowCampaignGoal(false)
    setShowcmapiagnStructure(false)
    showShowCriteria(true)
     setShowGeneratedCampaognGoal(false)
  }
  useEffect(()=>{
  },[showCampaignGoal,showcmapiagnStructure,showKnowledgeBase,showCriteria,showGeneratedCampaognGoal])
  return (
    <>
  
    <Box
      sx={{
        // backdropFilter: "blur(2px)",
        height: "-webkit-fill-available",
        // p: 3,
        borderRadius: "10px",
        position:"relative",
          p: 5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          //   justifyContent: "space-between",
          alignItems: "center",
           p:"10px 20px",
          // pb: "0px",
          // borderBottom: "1px solid rgb(84 85 87)",
         
        }}
      >
        <Box sx={{display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",zIndex:99999}}>
        {/* campaign carete */}
        <Box
          sx={{
            // borderRight: "1px solid rgb(84 85 87)",
            p: "20px",
            pr:"0px",
            display:"flex",gap:6
          }}

        >
           <Typography
            sx={{
              fontSize: "16px",
              color: "white",
              cursor:"pointer"
            }}
            onClick={() => naviagte('/campaignList')}
          >
          
            Campaign List
          </Typography>

          <Typography
            sx={{
              fontSize: "16px",
              color: "white",
            }}
          >
          
            {campaignName}
          </Typography>
        </Box>
         <HamburgerMenu />
</Box>

<Box sx={{position:"absolute",width:"94%",textAlign:"center"}}>
  {showcmapiagnStructure &&   <Typography
              sx={{ color: "white", fontSize: "28px", fontWeight: "bold" , fontFamily: 'Orbitron, sans-serif'}}
            >
              Generated Campaign Structure
            </Typography>}
 
</Box>
{/* logout */}


       
      </Box>

      <Box>
                    {/* menu */}
            <Box>
                {showCriteria &&  <NavMenu showCampaignKnowledgeBase={handleShowCampignStruccture} selectedMenu={selectedMenu}/>}
                
              
            </Box>
      </Box>


      <Box >
        {showKnowledgeBase &&    <CampaignStructureDetails handleShowCampaoignGoal={handleShowCampaoignGoal} />}


        {showCampaignGoal && 
        
           <Box >
      {/* <CampaignGoal /> */}
      <CampaignGoalTemplate  handleShowCampaignstrure={handleShowCampaignstrure}/>
   
      </Box>
      }

       {showGeneratedCampaognGoal  && 
      <Box >
      {/* <CampaignGoal /> */}
      <CampaignGoal1  handleShowCampaignstrure={handleshowCampaignGenerated}/>
   
      </Box>
      } 

           {showcmapiagnStructure && 
       <CampaignStructure />}
     
  
      </Box>
     
    
    </Box>
     {/* <TabNavigation  handleTableActive={handleTableActive}/> */}
      </>
  );
};

export default CreateCampaign;
