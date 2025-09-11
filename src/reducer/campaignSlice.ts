import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchCampaignEnumerations } from './campaignThunk';


export interface CampaignState {
   initialCampaignValues?: Partial<CampaignState>; // track initial values
  campaignName: string | null;
  targetMarket: string | null;
  brandIndustry: string | null;
  campaignId:string | null;
  brandName:string | null;
  error: string | null;
  enumerations:any[] | null;
  strategicObjective:string | null;
  segment:any[] | null;
   demographics:any[] | null;
    psychographics:any[] | null;
    campaignDuration:string | null;
    startDate:string | null,
    guardrails:any[] | null,
    campaignGoal:string | null,
    generatedCampaignGoal:string|null,
    campaignStructureSummary:string | null,
    campaignStructureJson:object | null,
    campaignMasterArticle:any[]|null,
    campaignWeekEvent:any[]|null,
    xTwitterPostList:any[] | null,
    brandValue: string | null,brandSupport:string | null,brandTone:string | null,messagingPillars:any[] | null,constraints:any[] | null,
    weekId:any,
    campaignMasterArticleJson:any[] | null,
    campaignMasterWeekEvent:object,
    fileUpload:any[],
    generatedFileSummary:string
    
}


const initialState: CampaignState =
{ campaignName: null, targetMarket: null,campaignId:null, brandIndustry: null,brandName:null,error:null,enumerations:null,strategicObjective:null,segment:null,demographics:null,psychographics:null,
  campaignDuration:null,startDate:null,guardrails:null,campaignGoal:null,generatedCampaignGoal:'',campaignStructureSummary:null,brandValue: null,brandSupport:null,brandTone:null,messagingPillars:[],constraints:[],
  campaignStructureJson:{},campaignWeekEvent:[],campaignMasterArticle:[],xTwitterPostList:[],weekId:"",campaignMasterArticleJson:[],campaignMasterWeekEvent:{},fileUpload:[],generatedFileSummary:"",initialCampaignValues:{}
 };

const campaignSlice = createSlice({
  name: 'campaignCreate',
  initialState,
  reducers: {
setInitialCampaignValues: (state, action) => {
  state.initialCampaignValues = {
    startDate: action.payload.startDate,
    campaignDuration: action.payload.campaignDuration,
    strategicObjective:action.payload.strategicObjective,
    segment: action.payload.segment,
    demographics:action.payload.demographics,
    psychographics: action.payload.psychographics,
  };
},
    campaignDetails: (
      state,
      action: PayloadAction<{ campaignName: string; targetMarket: string,brandIndustry:string ,brandName:string}>
    ) => {
      state.campaignName = action.payload.campaignName;
      state.targetMarket = action.payload.targetMarket;
      state.brandIndustry = action.payload.brandIndustry;
        state.brandName = action.payload.brandName;
    },
     setFileUploads: (
      state,
      action: PayloadAction<{ fileUpload: any[]}>
    ) => {
      state.fileUpload = action.payload.fileUpload;
    },
      setGeneretedFileSummary: (
      state,
      action: PayloadAction<{ generatedFileSummary: string}>
    ) => {
      state.generatedFileSummary = action.payload.generatedFileSummary;
    },
     setCampaignID: (
      state,
      action: PayloadAction<{ campaignId: string}>
    ) => {
      state.campaignId = action.payload.campaignId;
    },
     setCampaignGoal: (
      state,
      action: PayloadAction<{ campaignGoal: string}>
    ) => {
      state.campaignGoal = action.payload.campaignGoal;
    },
     setGeneratedCampaignGoal: (
      state,
      action: PayloadAction<{ generatedCampaignGoal: string}>
    ) => {
      state.generatedCampaignGoal = action.payload.generatedCampaignGoal;
    },
     setGeneratedCampaignstructure: (
      state,
      action: PayloadAction<{ campaignStructureSummary: string,campaignStructureJson:Object,campaignMasterArticle:any[],campaignMasterArticleJson:any[]}>
    ) => {
      state.campaignStructureSummary = action.payload.campaignStructureSummary;
      state.campaignStructureJson = action.payload.campaignStructureJson;
      state.campaignMasterArticle = action.payload.campaignMasterArticle;
       state.campaignMasterArticleJson = action.payload.campaignMasterArticleJson;
    },
     stretegyObjectives: (
      state,
      action: PayloadAction<{ strategicObjective: string }>
    ) => {
      state.strategicObjective = action.payload.strategicObjective;
    },
      setGeneratedXTwitter: (
      state,
      action: PayloadAction<{ xTwitterPostList: any[] }>
    ) => {
      state.xTwitterPostList = action.payload.xTwitterPostList;
    },
   
     segments: (
      state,
      action: PayloadAction<{ segment: Array<any>,demographics :Array<any>,psychographics:Array<any>}>
    ) => {
      state.segment = action.payload.segment;
       state.demographics = action.payload.demographics;
        state.psychographics = action.payload.psychographics;
    },
     calendar: (
      state,
      action: PayloadAction<{ startDate:string,campaignDuration: any}>
    ) => {

      state.campaignDuration = action.payload.campaignDuration;
        state.startDate = action.payload.startDate;
    },
     setGeneratedCampaignDetails: (
      state,
      action: PayloadAction<{ brandValue: string,brandSupport:string,brandTone:string,messagingPillars:Array<any>,constraints:Array<any>}>
    ) => {

      state.brandValue = action.payload.brandValue;
        state.brandSupport = action.payload.brandSupport;
        state.messagingPillars = action.payload.messagingPillars;
        state.constraints = action.payload.constraints;
         state.brandTone = action.payload.brandTone;
    },
     gaurdRails: (
      state,
      action: PayloadAction<{ gaurdRails: Array<any>}>
    ) => {
 
      state.guardrails = action.payload.gaurdRails;
    },
     setCampaignWeeksEvent: (
      state,
      action: PayloadAction<{ campaignWeekEvent: Array<any> }>
    ) => {
      state.campaignWeekEvent = action.payload.campaignWeekEvent;
    }, 
     setCampaignMasterArticleWeekevent: (
      state,
      action: PayloadAction<{ campaignMasterWeekEvent: {} }>
    ) => {
      state.campaignMasterWeekEvent = action.payload.campaignMasterWeekEvent;
    }, 
     setWeekId: (
      state,
      action: PayloadAction<{ weekId:String  }>
    ) => {
      state.weekId = action.payload.weekId;
    },
  resetCampaign: () => initialState

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaignEnumerations.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchCampaignEnumerations.fulfilled, (state, action) => {

        state.enumerations = action.payload;
      })
      .addCase(fetchCampaignEnumerations.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { campaignDetails,setGeneratedXTwitter,setWeekId,resetCampaign, setFileUploads,setGeneretedFileSummary, setInitialCampaignValues,setCampaignMasterArticleWeekevent, stretegyObjectives,segments,calendar,gaurdRails,setCampaignID,setCampaignGoal,setGeneratedCampaignGoal,setGeneratedCampaignstructure,setGeneratedCampaignDetails,setCampaignWeeksEvent} = campaignSlice.actions;
export default campaignSlice.reducer;