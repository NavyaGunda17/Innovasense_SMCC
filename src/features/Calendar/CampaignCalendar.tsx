import { Box, Button, ButtonGroup, Popover, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import { logout } from "../../reducer/authSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../../store/store";
import { supabase } from "../../lib/supabaseClient";
import {
  setCampaignWeeksEvent,
  setGeneratedCampaignstructure,
  setWeekId,
} from "../../reducer/campaignSlice";

import { CalendarComponent1 } from "../../components/CalendarComponent1";
import HamburgerMenu from "../../components/HamburgerMenu";
import TopControls from "../../components/TopControl";

// Setup date-fns localizer
type Platform = "LinkedIn" | "Instagram" | "TikTok";

type ContentItem = {
  day: string;
  date: string;
  time: string;
  content_type: string;
};

type CampaignWeek = {
  week_number: string;
  theme: string;
  content_focus: string;
  schedule: Record<Platform | "X", ContentItem[]>;
};

type CampaignStructure = {
  name: string;
  duration: string;
  Summary: string;
  weeks: CampaignWeek[];
};

type CampaignData = {
  "campaign Structure": CampaignStructure;
};

// ========== Main Component ==========
const CampaignCalendar: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const { id} = useParams()
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleAnimation = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    renderData();
  }, []);
  let campaignState: any = useSelector((state: RootState) => state.campaign);
  console.log(campaignState, "campaignState");

  const renderData = async () => {
    const data: any = await supabase
      .from("campaignInput")
      .select("*")
      .eq("campaignId", id)
      .single();
    console.log("renderData",data.data);
    const campaignStructureSummary = data?.data?.campaignStructureSummary;
    dispatch(
      setGeneratedCampaignstructure({
        campaignStructureSummary: campaignStructureSummary,
        campaignStructureJson: data?.data?.campaignStructureJson,
        campaignMasterArticle:data?.data?.campaignMasterArticle,
        campaignMasterArticleJson:data?.data?.campaignMasterArticleJson,
      })
    );
  };

  useEffect(() => {}, [dispatch]);

  const campaignData: any = useSelector(
    (state: RootState) => state.campaign.campaignStructureJson
  );

  const [campaignWeeks, setCampaignWeeks] = useState<any>(0);

  useEffect(() => {
    if(typeof campaignData === "string" && campaignData.length > 0){

   
    const data =
      typeof campaignData === "string"
        ? JSON.parse(campaignData)
        : campaignData;
    console.log("data", data);
    const campaign = data?.["campaign Structure"];

    console.log("campaign", campaign);

    if (campaign?.weeks) {
      setCampaignWeeks(campaign?.weeks);
      dispatch(setCampaignWeeksEvent({ campaignWeekEvent: campaign?.weeks }));
    }
 }
  }, [campaignData]);


  const handleViewCampaign = (weekId:any) => {
    dispatch(setWeekId({weekId:weekId}))
    navigate(`/campaignWeekDetails/${weekId}/${id}`)
    
  }


  return (
    <Box
      sx={{
        backdropFilter: "blur(2px)",

        borderRadius: "10px",
        position: "relative",
        color: "white",
          p: 5,
      }}
    >
      {/* Header */}
          <Box
        sx={{
          display: "flex",
          //   justifyContent: "space-between",
          alignItems: "center",
           p:"10px 20px",
          // pb: "0px",
          // borderBottom: "1px solid rgb(84 85 87)",
          justifyContent:"space-between"
        }}
      >
        <Box sx={{display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative"}}>
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
            onClick={() => navigate('/campaignList')}
          >
          
            Campaign List
          </Typography>

          <Typography
            sx={{
              fontSize: "16px",
              color: "white",
            }}
          >
          
            {campaignState.campaignName}
          </Typography>
        </Box>

         <HamburgerMenu />
</Box>


{/* logout */}

       
      </Box>

      {/* Calendar Section */}

      <CalendarComponent1 campaignWeeks={campaignState?.campaignWeekEvent} handleViewCampaign={handleViewCampaign} />

    </Box>
  );
};

export default CampaignCalendar;
