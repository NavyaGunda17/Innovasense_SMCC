import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle
} from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import AppButton from '../../components/AppButton';
import {
  setGeneretedFileSummary
} from '../../reducer/campaignSlice';
import { useError } from '../../context/ErrorToastContext';
import { useSuccess } from '../../context/SuccessToastContext';
import { supabase } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCampaignEnumerations } from "../../reducer/campaignThunk";
import ReactMarkdown from 'react-markdown';
import AnimatedLoader from '../../components/AnimatedLoader';
import { useNavigate } from 'react-router-dom';
import SendIcon from "@mui/icons-material/Send";

type CamapignGoal1Props = {

    is3DTransitioning?: boolean;
  transitionPhase?: string;
}

export type FileUploadHandle = {
  save: () => Promise<boolean>;
  getFiles: () => File[];
  clearFiles: () => void;
};

const FileUploadSummary = forwardRef<FileUploadHandle, CamapignGoal1Props>(
  ({  }, ref) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [templateText, setTemplateText] = useState('');
    const [rawTemplate, setRawTemplate] = useState('');
    const [hasGenerated, setHasGenerated] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [generatedFileSummary, setGeneeratedFileSummary] = useState<any>("");

    const { showErrorToast } = useError();
    const { showSuccessToast } = useSuccess();
    const dispatch = useDispatch<AppDispatch>();
    const campaignState: any = useSelector((state: RootState) => state.campaign);
    const companyId = useSelector((state: RootState) => state.auth.companyId);
    const campaignId = useSelector((state: RootState) => state.campaign.campaignId);
    const navigate = useNavigate();



    useEffect(() => {
      renderData();
    }, []);

    useEffect(()=>{
        console.log("generatedFileSummary",generatedFileSummary)
    },[generatedFileSummary])
    useEffect(() => {
      setHasGenerated(!!campaignState?.generatedCampaignGoal?.trim());
    }, [campaignState?.generatedCampaignGoal]);

    const renderData = async () => {
      const data: any = await supabase
        .from('campaignInput')
        .select('*')
        .eq('campaignId', campaignState?.campaignId)
        .single();
        console.log("setGeneretedFileSummary",data)
      dispatch(setGeneretedFileSummary({ generatedFileSummary: data?.data?.clientFiles }));
      setGeneeratedFileSummary(data?.data?.clientFiles);
    };

    const handleNext = () => {
      navigate(`/creatCampaign/${campaignId}#StrategicObjective`, { replace: false });
    };

    /** 
     * Expose functions to parent via ref
     */
    useImperativeHandle(ref, () => ({
      save: async () => {
        // Example: add your saving logic here
        console.log("Saving from FileUploadSummary...");
        return true;
      },
      getFiles: () => {
        // Example: return the files you want parent to access
        return [];
      },
      clearFiles: () => {
        // Example: clear your file state
        console.log("Clearing files...");
      }
    }));

    return (
      <Box sx={{ }}>
        <Box sx={{ display: "flex", width: "inherit",  justifyContent: "space-between", flexDirection: "column", alignItems: "center" }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{
              fontWeight: 600, mb: 1, color: 'white',
              fontFamily: 'Orbitron, sans-serif', fontSize: '24px',
              position:"fixed",
              top:"67px",
              left:"0",
              right:"0",
              margin:"auto",
              display:"inline-table"
            }}>
              Generated Summary
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ position: "relative", overflow: "hidden" }}>
              <Box className="campaign-detail-rectangle" sx={{
                maxHeight: '60vh', padding: "16px", overflowY: 'auto',
                scrollbarWidth: "none", background: '#ffffffbd !important'
              }}>
                <AnimatePresence mode="wait">
                 
                    <motion.div
                      key="generated"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      style={{ position: "relative" }}
                    >
                      <Box sx={{
                        borderRadius: '8px',
                        padding: 2,
                        minHeight: '120px',
                        fontSize: '14px',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.7,
                        '& strong': { color: '#2e2e2e' },
                        '& h1, & h2, & h3': { color: '#1d34a0' },
                        '& ul, & ol': { color: '#2e2e2e' },
                        '& p': { color: '#2e2e2e' },
                        '& li strong': { color: '#1d34a0' },
                        '& blockquote': {
                          borderLeft: '4px solid #ccc',
                          pl: 2,
                          color: '#ccc',
                          fontStyle: 'italic',
                        },
                        "& hr": {
                          borderColor: "#444",
                        },
                      }}>
                        <ReactMarkdown>{generatedFileSummary}</ReactMarkdown>
                      </Box>
                    </motion.div>
                 
                </AnimatePresence>
              </Box>
            </Box>
          </Box>
        </Box>

        {!(hasGenerated && campaignState?.generatedCampaignGoal) ? (
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}></Box>
        ) : (
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            {campaignState?.campaignStructureSummary &&
              <AppButton
                variantType="secondary"
                endIcon={<SendIcon />}
                onClick={handleNext}
                sx={{
                  height: "56px", mt: 3, float: "right",
                  position: "fixed", bottom: "100px", right: "100px"
                }}
              >
                Continue
              </AppButton>
            }
          </Box>
        )}

        {showLoader && <AnimatedLoader />}
      </Box>
    );
  }
);

FileUploadSummary.displayName = 'FileUploadSummary';

export default FileUploadSummary;
