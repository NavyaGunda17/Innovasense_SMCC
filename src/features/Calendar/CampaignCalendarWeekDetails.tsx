import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import {
  Paper,
  Typography,
  Divider,
  Box,
  TextField,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import AppButton from "../../components/AppButton";
import SendIcon from "@mui/icons-material/Send";
import { supabase } from "../../lib/supabaseClient";
import {
  setCampaignMasterArticleWeekevent,
  setCampaignWeeksEvent,
  setGeneratedCampaignstructure,
} from "../../reducer/campaignSlice";
import HamburgerMenu from "../../components/HamburgerMenu";
import TopControls from "../../components/TopControl";
import CustomModal from "../../components/CustomModal";
import AnimatedLoader from "../../components/AnimatedLoader";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PostList from "../posts/PostList";

type ContentItem = {
  day: string;
  date: string;
  time: string;
  content_type: string;
};

type Schedule = Record<string, ContentItem[]>;

const platformColors: Record<string, string> = {
  LinkedIn: "#0077b5",
  X: "#058AE5",
  Instagram: "#d6249f",
  TikTok: "#000",
};

// Helper to convert hex to rgba
const hexToRGBA = (hex: string, opacity: number) => {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};


const CamapignCalendarWeekDetails = () => {
  const { weekId, campaignId } = useParams();
  const dispatch = useDispatch();

  const location = useLocation()
  useEffect(()=>{

  },[location])
  const navigate = useNavigate()
  const [weekDetails, setWeekDetails] = useState<any>({});
  const [weekDetailsArticle, setWeekDetailsArticle] = useState<string>("");
  const [command, setCommand] = useState("");

  const campaignState = useSelector(
    (state: RootState) => state.campaign.campaignWeekEvent
  );
  const campaignStateMarticleJson = useSelector(
    (state: RootState) => state.campaign.campaignMasterArticleJson
  );
  const campaignStateAll = useSelector((state: RootState) => state.campaign);
  const companyId = useSelector((state: RootState) => state.auth.companyId);

  // Set week details based on weekId & campaignState
  useEffect(() => {
    console.log("campaignWeekEvent",campaignState)
    console.log("campaignStateMarticleJson",campaignStateMarticleJson)
    if (weekId && campaignState?.length) {
      const index = parseInt(weekId, 10);
      
      const selectedWeek = campaignState[index - 1];



console.log(index); // 👉 Output: 1
      if (selectedWeek) {
        setWeekDetails(selectedWeek);
      }
    }
  }, [weekId, campaignState]);

  // Fetch campaign data from Supabase when campaignId changes
  useEffect(() => {
    if (campaignId && weekId) {
      renderData();
    }
  }, [campaignId,weekId]);

const alreadyApprovedRef = useRef(false); // ✅ Guard



// useEffect(()=>{
//   console.log("checkExisting")
// checkExisting()
// },[campaignStateMarticleJson])

useEffect(() => {
  // Transform week JSON
  transformMasterArtickeJSON();

  // Only run checkExisting once per weekId
  if (!alreadyApprovedRef.current) {
    checkExisting();
  }
}, [campaignStateMarticleJson]);

  const [allWeeks, setAllWeeks] = useState<any>({});


// useEffect(() => {
 
// transformMasterArtickeJSON()

// }, [campaignStateMarticleJson]);

const transformMasterArtickeJSON = () => {
 if(weekId){
 const index = parseInt(weekId, 10);
  const keyName = `week_${index}`
  if (!campaignStateMarticleJson || !keyName) return;

  const foundIndex = campaignStateMarticleJson.findIndex(
    (obj: Record<string, any>) => Object.keys(obj)[0] === keyName
  );

  if (foundIndex !== -1) {
    const rawJsonString = campaignStateMarticleJson[foundIndex][keyName];

    try {
      const parsed = JSON.parse(rawJsonString);
      const parsedWeek = { weekKey: keyName, ...parsed };
      console.log("parsedWeek",parsedWeek)
      dispatch(setCampaignMasterArticleWeekevent({ campaignMasterWeekEvent: parsedWeek }));
      setAllWeeks(parsedWeek); // still using array to reuse rendering logic
    } catch (error) {
      console.error(`Failed to parse ${keyName}`, error);
    }
  }
  }
}

useEffect(()=>{

},[allWeeks])

  // Set article details based on weekId & campaignMasterArticle
  useEffect(() => {
    if (
      weekId &&
      campaignStateAll?.campaignMasterArticle && campaignStateAll?.campaignMasterArticle?.length > 0
    ) {
      const keyToFind = `week_${weekId}`;
      console.log("campaignStateAll.campaignMasterArticle.",campaignStateAll.campaignMasterArticle,keyToFind)
      const index = campaignStateAll.campaignMasterArticle.findIndex(
        (obj: any) => keyToFind in obj
      );

      if (index >= 0) {
        setWeekDetailsArticle(
          campaignStateAll.campaignMasterArticle[index][keyToFind]
        );
      }
    }

    console.log("campaignMasterArticleJson",campaignStateAll.campaignMasterArticleJson)
  }, [ campaignStateAll?.campaignMasterArticle]);

  // Debug only
  useEffect(() => {
   
  }, [weekDetailsArticle]);

  const renderData = async () => {
    const response: any = await supabase
      .from("campaignInput")
      .select("*")
      .eq("campaignId", campaignId)
      .single();

    const campaignStructureSummary = response?.data?.campaignStructureSummary;
    const campaignStructureJsonRaw = response?.data?.campaignStructureJson;
    const campaignMasterArticle = response?.data?.campaignMasterArticle;
    const campaignMasterArticleJson = response?.data?.campaignMasterArticleJson;
    console.log("campaignStructureSummary",campaignStructureSummary,campaignMasterArticle)
    const campaignStructureJson =
      typeof campaignStructureJsonRaw === "string"
        ? JSON.parse(campaignStructureJsonRaw)
        : campaignStructureJsonRaw;

    dispatch(
      setGeneratedCampaignstructure({
        campaignStructureSummary,
        campaignStructureJson,
        campaignMasterArticle,
        campaignMasterArticleJson
      })
    );
transformMasterArtickeJSON()
    // const campaign = campaignMasterArticleJson["campaign Structure"];
    // dispatch(setCampaignWeeksEvent({ campaignWeekEvent: campaign?.weeks }));
  };

  const [showLoader, setShowLoader] = useState(false)
  const handleRegenerateKnowledge = async () => {
    setShowLoader(true)
    setCommand("")
    handleCloseMoreDetails()
    try {
      const response = await fetch(
        "https://innovasense.app.n8n.cloud/webhook/smcc/brain",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId,
            campaignId: campaignId,
            intent: "Campaign master article",
            content: {
              campaignMasterArticleComments: command,
              weekNumber: weekId,
            },
          }),
        }
      );

       const result = await response.json();

      if (result[0].output.status == "fail") {
        console.error("Failed in regenarting the master article");
        setShowLoader(false)
        return false
      }
       renderData();
        setShowLoader(false)
    } catch (error) {
       setShowLoader(false)
      console.error("Error triggering webhook:", error);
    }
  };
  const campaignStateWeekEvent:any = useSelector(
    (state: RootState) => state.campaign.campaignMasterWeekEvent
  );


const [showViewPost, setShowPost] = useState(false)

  const checkExisting = async () => {
    const { data } = await supabase
      .from("postList")
      .select("*")
      .eq("campaignId", campaignId)
      .eq("companyId", companyId)
      .eq("week", weekId)
     

      console.log("change in table",data)
      if(data && data.length > 0){
        setShowPost(true)
      }else{
         alreadyApprovedRef.current = true;
          handleApproveMasterArticle1()
      }
    
  };
  const toCamelCase = (str: string): string => {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
      .replace(/^(.)/, (c) => c.toLowerCase());
  };

type PlatformData = {
  "Platform name": string;
  "The Narrative": string;
  "Visual Prompt": string;
  "Post Schedule": any[];
};

type Platforms = {
  [platformKey: string]: PlatformData;
};



// useEffect(()=>{
//   handleApproveMasterArticle1()
// },[])
const handleApproveMasterArticle1 = () => {
  if (!campaignStateWeekEvent?.platforms) return;

  const weekPlatforms = campaignStateWeekEvent.platforms;
  console.log("weekPlatforms",weekPlatforms)

let delay = 0;


for (const [platformKey, platformData] of Object.entries(weekPlatforms)) {
  const platform = platformKey;
  const platformData1 = platformData as any;

  for (const post of platformData1["Post Schedule"]) {
    const postIndex = post.index;
   const payload = {
        companyId,
        campaignId: campaignStateWeekEvent.campaignId,
        intent: "Campaign post",
        content: {
          campaignPostComments: "",
          weekNumber: weekId,
          subTask: "generate",
          platform,
          postIndex: [postIndex || 1],
        },
      };

      fetch("https://innovasense.app.n8n.cloud/webhook/smcc/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((err) => console.error("Failed to send webhook", err));
    // setTimeout(() => {
   
    // }, delay);

    delay += 5000; // ⏱ increase delay by 5s for next call
  }
}

  // Navigate immediately
  // navigate(`/posts/${campaignId}/${weekId}`);
};


  const [moreDetails, setMoreDetails] = useState(false)
  const handleCloseMoreDetails = () =>{
    setMoreDetails(false)
  }
  return (
    <Box sx={{ m: 4, }}>


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
                  
                   {campaignStateAll.campaignName}
                  </Typography>
                </Box>
         <HamburgerMenu />
</Box>


{/* logout */}


       
      </Box >
      {/* <Typography variant="h4" fontWeight="bold" sx={{ color: "white", mb: 3 }}>
        {campaignStateAll.campaignName}
      </Typography> */}

      

      <Box sx={{
        p:"10px 40px",justifyContent:"center",margin:"auto"
      }}>

    


    
      <Box
        sx={{
          // border: "1px solid #545557",
       
          borderRadius: "4px",
          position: "relative",
        
          
        }}
      >
        <Box sx={{display:"flex",justifyContent:"space-between"}}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: "white",fontFamily: 'Orbitron, sans-serif',mb:2,flex:1 }}>
          Week {allWeeks.Week}: {weekDetails.theme}
        </Typography>
        <Box sx={{display:"flex",gap:2}}>
 <AppButton variantType="secondary" onClick={()=> setMoreDetails(true)} sx={{minWidth:"fit-content",height:"max-content"}}> View Master Article</AppButton>
             {/* <AppButton
        variant="contained"
        color="primary"
        onClick={() => handleApproveMasterArticle1}
        sx={{ minWidth:"fit-content",height:"max-content",display:"none"}}
      >
        {showViewPost ? "View Post": "Generate Post "}
       
      </AppButton> */}
        </Box>
       
        </Box>

         <Typography variant="body1" sx={{ color: "white",fontFamily: 'Orbitron, sans-serif',mb:1 }}>
          <strong>Focus:</strong> 
        </Typography>

       


        <Typography variant="body1" sx={{ color: "white",mb:2,overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", }}>
        {allWeeks['Campaign Strategy']}
        </Typography>

       

  
       

        {/* Regenerate Input Box */}
     
      </Box>
<Box sx={{mt:2}}>
  <PostList />
</Box>

<Box sx={{
       maxHeight: '50vh', // limit height
        overflowY: 'auto',  // enable scroll
         scrollbarWidth: "none",mb:2,
         display:"none"
      }}>
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4,  }}>
     {Object.entries(allWeeks?.platforms || {}).map(([key, value]) => {
  const platform = value as {
    "Platform name": string;
    "The Narrative": string;
    "Visual Prompt": string;
    "Post Schedule": {
      day: string;
      date: string;
      time: string;
      mediaType: string;
      index: string;
      content_type:string,type:string,
      url:string,
    }[];
  };

  return (
    <>
      {/* <h2>{platform["Platform name"]}</h2>

      <p><strong>Narrative:</strong> {platform["The Narrative"]}</p>
      <p><strong>Visual Prompt:</strong> {platform["Visual Prompt"]}</p> */}
          
  
 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4,  }}>
      {platform["Post Schedule"]?.length > 0 && (
        

          <Box
          key={platform["Platform name"]}
          sx={{
            backgroundColor: '#1e1e1e',
            borderRadius: 2,
            p: 3,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            transition: '0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            },
          }}
        >
          {/* Platform Title */}
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              textTransform: 'uppercase',
              mb: 4,
              pb: 1,
              borderBottom: `1px solid #404040`,
            }}
          >
            {platform["Platform name"]}
          </Typography>

          {/* Post Grid */}
          <Box display="flex" flexWrap="wrap" gap={2}>

         
          {platform["Post Schedule"].map((post,idx) => (
            <Box
                key={idx}
                sx={{
                  backgroundColor:' #404040',
                  borderRadius: 2,
                  width: 280,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                  transition: '0.3s ease',
                  '&:hover': {
                    boxShadow: `0 6px 16px rgba(0,0,0,0.2)`,
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                {/* Date & Time */}
                <Typography
                  variant="body2"
                  sx={{ color: '#fff', display: 'flex', alignItems: 'center' }}
                >
                  📅&nbsp;<strong>{post.day}, {post.date}</strong>&nbsp;at&nbsp;
                </Typography>
                 <Typography
                  variant="body2"
                  sx={{ color: '#fff', display: 'flex', alignItems: 'center' }}
                >
                  <AccessTimeIcon fontSize="small" sx={{mr:"5px"}} />
               <strong>{post.time}</strong>
                </Typography>

                {/* Content Type */}
                <Typography
                  variant="body2"
                  sx={{ color: '#ccc', display: 'flex', alignItems: 'center' }}
                >
                  📝&nbsp;<strong>{post?.mediaType}</strong>
                </Typography>

                
              </Box>
          ))}
           </Box>
           </Box>
      
      )}
      </Box>
      
    </>
  );
})}
</Box>
</Box>
  




 <CustomModal
  open={moreDetails}
  onClose={() => setMoreDetails(false)}
  title={`Week ${weekId} Master Article`}
  onConfirm={handleCloseMoreDetails}
  confirmText="Close"
 
        titleColor="black"
        showCancel={false}
    customcolor={{
            background:"rgb(210 201 201 / 71%)!important"
        }}
  body={
    <Box>
    <Box
      sx={{
        height: 'calc(75vh - 100px)',
        overflowY: "auto",
        scrollbarWidth: "none",
        pb:"20px",
        color: "white",
        borderRadius: 2,
        lineHeight: 1.7,
        '& strong': { color: '#2e2e2e' },
        '& h1, & h2, & h3': { color: '#1d34a0',mt:0 },
        '& ul, & ol': { color: '#2e2e2e' },
        '& p': { color: '#2e2e2e' },
        '& li strong':{color:'#1d34a0'},
        '& blockquote': {
          borderLeft: '4px solid #ccc',
          pl: 2,
          color: '#ccc',
          fontStyle: 'italic',
        },
        "& hr": {
          borderColor: "#444",
        },
      }}
    >
      <ReactMarkdown>{weekDetailsArticle.replace(/<br\s*\/?>/gi, "\n\n")}</ReactMarkdown>
      
    </Box>
    <Box sx={{display:"flex",flexDirection:"row",gap:2,pt:2}}> 
  <textarea
  value={command}
 style={{
      height: "44px",           // fixed height
      maxHeight: "44px",
      minHeight: "44px",
      resize: "none",           // prevent user from resizing
      padding: "10px",          // adjust for alignment
      fontSize: "14px",         // optional for better compactness
      borderRadius: "4px",      // optional for better style
     backdropFilter:"none",
      flex: 1,    
      border:"1px solid #171835",
      color:"#171835"              // allows it to grow
    }}
   onChange={(e) => setCommand(e.target.value)}
                
                    placeholder="Provide the comments to regenerate the campaign master article"
                    className="custom-objective-input"
                    rows={1}
                  />
                   
                   <AppButton sx={{width:"max-content",whiteSpace:"nowrap",minWidth:"fit-content"}} variantType="secondary"
                    onClick ={handleRegenerateKnowledge}>Regenerate Master Article</AppButton>
</Box>
    </Box>
  }
/> {/* ✅ Removed children block */}


      {/* Markdown Article View */}
   




  <Box sx={{display:"flex",justifyContent:"space-between",mt:1}}>
             {/* <AppButton
        variant="contained"
        color="primary"
        onClick={handleApproveMasterArticle1}
        sx={{ height: "56px"}}
      >
       Continue
      </AppButton> */}
{/* 
           <AppButton
                variantType="secondary"
                endIcon={<SendIcon />}
                onClick={handleApproveMasterArticle1}
                sx={{ height: "56px", mt: 3,position:"absolute",bottom:"100px",right:"70px" }} // match TextField height
                className="next-button"
              >
                Continue
              </AppButton>

         */}
          </Box>

      
       
  </Box>
  {showLoader && <AnimatedLoader />}

    </Box>
  );
};

export default CamapignCalendarWeekDetails;
