import React, { ReactNode, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  campaignDetails,
  setCampaignGoal,
  setGeneratedCampaignGoal,
  setGeneratedCampaignstructure,
  stretegyObjectives,
  segments,
  calendar,
  gaurdRails,
  setCampaignID,
  setGeneratedCampaignDetails,
  setGeneretedFileSummary,
  setFileUploads,
  setInitialCampaignValues,
  setCampaignMasterArticleWeekevent
} from '../reducer/campaignSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '../store/store';
interface GlobalCampaignDataProviderProps {
  children?: ReactNode;
}const GlobalCampaignDataProvider: React.FC<GlobalCampaignDataProviderProps> = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const campaignId = useSelector((state: RootState) => state.campaign.campaignId);
  const [loaded, setLoaded] = useState(false);
 console.log("GlobalCampaignDataProvider",campaignId)
  useEffect(() => {
    if (!campaignId) return; // If no campaignId in redux, skip

    const fetchCampaignData = async () => {
      const { data, error } = await supabase
        .from("campaignInput")
        .select("*")
        .eq("campaignId", campaignId)
        .single();
        console.log("GlobalCampaignDataProvider",data)
      if (data) {
        dispatch(campaignDetails({
          campaignName: data.campaignName,
          targetMarket: data.targetMarket,
          brandIndustry: data.brandIndustry,
          brandName: data.brandName,
        }));

        
        dispatch(setCampaignGoal({ campaignGoal: data.campaignGoalUser }));
        if(data.clientFileName != null){
 dispatch(setFileUploads({ fileUpload: [data.clientFileName] }));
        }
        
        dispatch(setGeneretedFileSummary({ generatedFileSummary: data.clientFiles }));
        dispatch(setGeneratedCampaignGoal({ generatedCampaignGoal: data.campaignGoal }));
        dispatch(setGeneratedCampaignstructure({
          campaignStructureSummary: data.campaignStructureSummary,
          campaignStructureJson: data.campaignStructureJson,
          campaignMasterArticle: data.campaignMasterArticle,
          campaignMasterArticleJson:data.campaignMasterArticleJson
        }));

       if (data.strategicObjective)
    dispatch(stretegyObjectives({ strategicObjective: data.strategicObjective }));

  if (data.segment && data.demographics && data.psychographics)
    dispatch(segments({
      segment: data.segment,
      demographics: data.demographics,
      psychographics: data.psychographics,
    }));

  if (data.startDate && data.campaignDuration)
    dispatch(calendar({
      startDate: data.startDate,
      campaignDuration: data.campaignDuration,
    }));

dispatch(setInitialCampaignValues({
  startDate: data.startDate,
  campaignDuration: data.campaignDuration,
  strategicObjective: data.strategicObjective,
   segment: data.segment,
      demographics: data.demographics,
      psychographics: data.psychographics,
}));
    
dispatch(setCampaignMasterArticleWeekevent({ campaignMasterWeekEvent: {} }))

        dispatch(gaurdRails({ gaurdRails: [data.guardrails] }));
        // You may not need to setCampaignID here again if it's already in redux

        dispatch(setGeneratedCampaignDetails({
          brandValue: data.brandValue,
          brandSupport: data.brandSupport,
          messagingPillars: data.messagingPillars,
          constraints: data.constraints,
          brandTone: data.brandTone,
        }));

        setLoaded(true);
      } else {
        console.error("Error fetching campaign:", error);
      }
    };

    // Fetch data if not loaded or campaignId changes or path changes
    
      fetchCampaignData();
   
  }, [ campaignId]);

 return <>{children}</>;
};

export default GlobalCampaignDataProvider;
