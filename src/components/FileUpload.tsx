import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { 
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  FilePresent as FileIcon
} from "@mui/icons-material";
import { useError } from "../context/ErrorToastContext";
import { useSuccess } from "../context/SuccessToastContext";
import AppButton from "./AppButton";
import { replace, useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { useDispatch } from "react-redux";
import { setFileUploads } from "../reducer/campaignSlice";
import loader from "../assests/loading-v2.gif"
import SendIcon from "@mui/icons-material/Send";
import AnimatedLoader from "./AnimatedLoader";

type FileUploadProps = {
  is3DTransitioning?: boolean;
  transitionPhase?: string;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  onFileChange?: (files: File[] | null) => void;
  title?: string;
  description?: string;
};

export type FileUploadHandle = {
  save: () => Promise<boolean>;
  getFiles: () => File[];
  clearFiles: () => void;
};

const FileUpload = forwardRef<FileUploadHandle, FileUploadProps>(
  ({ 
    is3DTransitioning, 
    transitionPhase, 
    acceptedFileTypes = ['.pdf', '.docx'],
    maxFileSize = 5, // 5MB default
    onFileChange,
    title = "File Upload",
    description = "Upload your files here"
  }, ref) => {
    
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showErrorToast } = useError();
  const { showSuccessToast } = useSuccess();
  const { id } = useParams();
  const companyId = useSelector((state:RootState) => state.auth.companyId);
  const navigate = useNavigate();
const [showLoader, setShowLoader] = useState(false)


  const campaignState = useSelector((state:RootState) => state.campaign)

  // useEffect(()=>{
  //   setUploadedFiles(campaignState.fileUpload)
  // },[campaignState.fileUpload])



  useImperativeHandle(ref, () => ({
    save: async () => {
      if (uploadedFiles.length === 0) {
        showErrorToast("Please upload at least one file");
        return false;
      }
      await handleFileUpload();
      return true;
    },
    getFiles: () => uploadedFiles,
    clearFiles: () => {
      setUploadedFiles([]);
      if (onFileChange) onFileChange([]);
    }
  }));

  const validateFile = (file: File): boolean => {
    if (file.size > maxFileSize * 1024 * 1024) {
      showErrorToast(`File size must be less than ${maxFileSize}MB`);
      return false;
    }
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      showErrorToast(`File type not supported. Accepted types: ${acceptedFileTypes.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    if (uploadedFiles.length > 5) {
      return false;
}

    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(validateFile);
    if (validFiles.length) {
      setIsUploading(true);
      setTimeout(() => {
setUploadedFiles(prev => [...prev, ...validFiles]);
        if (onFileChange) onFileChange(validFiles);
        setIsUploading(false);
        showSuccessToast("Files uploaded successfully!");
      }, 1000);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    const validFiles = files.filter(validateFile);
    if (validFiles.length) {
      setIsUploading(true);
      setTimeout(() => {
        setUploadedFiles(validFiles);
        if (onFileChange) onFileChange(validFiles);
        setIsUploading(false);
        showSuccessToast("Files uploaded successfully!");
      }, 1000);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDeleteFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, idx) => idx !== index);
    setUploadedFiles(newFiles);
    if (onFileChange) onFileChange(newFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showSuccessToast("File removed");
  };

  const handleReupload = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

const convertFileToBinary = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to ArrayBuffer."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading the file."));
    };

    reader.readAsArrayBuffer(file);
  });
};
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}


  const dispatch = useDispatch<AppDispatch>()
  // Upload all files as binary
  const handleFileUpload = async () => {
    setShowLoader(true)
    try {
      const binaries = await Promise.all(uploadedFiles.map(convertFileToBinary));
      // Example: send binaries to API (here just logs the sizes)
      // You can replace this with your actual upload logic
      // For demonstration, we'll just log the binary sizes
      binaries.forEach((bin, idx) => {
        console.log(`File: ${uploadedFiles[idx].name}, Binary size: ${bin.byteLength}`);
      });
      const base64Files = binaries.map(arrayBufferToBase64);
      console.log("binaries",binaries)
      dispatch(setFileUploads({fileUpload:uploadedFiles}))
     const response =  await fetch("https://innovasense.app.n8n.cloud/webhook/smcc/brain", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: companyId,
          campaignId: id,
          intent: "Extract info from file",
          content: {
            fileNames: base64Files,
          }
        }),
      });
           const result = await response?.json();
       if (result[0].output.status == "fail") {
        showErrorToast('Error uploading files');
         setShowLoader(false)
         return false
      }
       setShowLoader(false)
      navigate(`/creatCampaign/${id}#FileSummary`);
    } catch (error) {
      setShowLoader(false)
      showErrorToast('Error uploading files');
       
    }
  };
const generateSummary = useSelector((state:RootState) => state.campaign.generatedFileSummary)
  const handleSkip = () => {
    if(generateSummary && uploadedFiles.length > 0){
 navigate(`/creatCampaign/${id}#FileSummary`,{replace:false});
    }else{
 navigate(`/creatCampaign/${id}#StrategicObjective`,{replace:false});
    }
   
  };

  return (
    <Box>
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 2, alignItems: "center" }}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography sx={{
             color: 'white',
          fontSize: '2.75rem',
          fontWeight: '500',
          margin: '0 0 2rem 0',
          letterSpacing: '0.02em',
          lineHeight: '1.1',
          textShadow: 'none',
          textAlign: 'left',
          fontFamily: 'Orbitron, sans-serif'
          }}>
            {title}
          </Typography>
          {/* <Typography sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1rem',
            marginBottom: '1rem'
          }}>
            {description}
          </Typography> */}
            <img src={loader} style={{width:"200px"}} />
        </Box>
        <Box className={`campaign-detail-rectangle ${is3DTransitioning ? 'transitioning-3d' : ''} ${transitionPhase !== 'idle' ? `phase-${transitionPhase}` : ''}`}>
          <div className="file-upload-options">
            {uploadedFiles && uploadedFiles.length === 0 ? (
              <div
                className={`file-upload-area ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.7)', mb: 2 }} />
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1, textAlign: 'center' }}>
                  {isUploading ? 'Uploading...' : 'Drop your files here or click to browse'}
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem', textAlign: 'center' }}>
                  Accepted: {acceptedFileTypes.join(', ')} | Max: {maxFileSize}MB
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={acceptedFileTypes.join(',')}
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                {uploadedFiles && uploadedFiles.map((file, idx) => (
                  <div className="file-display" key={file.name + idx} style={{marginBottom:"20px"}}>
                    <div className="file-info">
                      <FileIcon sx={{ fontSize: 32, color: 'rgba(255, 255, 255, 0.8)', mr: 2 }} />
                      <div className="file-details">
                        <Typography sx={{ color: 'white', fontWeight: 500, mb: 0.5 }}>
                          {file.name}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                          {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                        </Typography>
                      </div>
                    </div>
                    <div className="file-actions">
                      <IconButton
                        onClick={() => handleDeleteFile(idx)}
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': { color: '#ff4444' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                     <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={acceptedFileTypes.join(',')}
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
                  </div>
                ))}
                <AppButton
                  variant="contained"
                  color="primary"
                  onClick={handleReupload}
                  sx={{ mt: 2 }}
                >
                  Add More Files
                </AppButton>
              </div>
            )}
          </div>
        </Box>
      </Box>
      <AppButton

      //  variantType="secondary"
      //           endIcon={<SendIcon />}
      //           onClick={handleNext}
      //           sx={{
      //             height: "56px", mt: 3, float: "right",
      //             position: "fixed", bottom: "100px", right: "100px"
      //           }}

        variantType="secondary"
         endIcon={<SendIcon />}
        color="primary"
        onClick={handleSkip}
        sx={{ height: "56px", width: "max-content", float: "right", position: "absolute", bottom: "-30px", right: "0px" }}
      >
        Continue
      </AppButton>
     
    </Box>
       {showLoader &&  <AnimatedLoader sx={{    position: "fixed"}} />}
    </Box>
  );
});

export default FileUpload; 