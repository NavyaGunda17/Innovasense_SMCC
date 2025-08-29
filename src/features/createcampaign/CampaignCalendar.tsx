import { Box, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import AppButton from "../../components/AppButton";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useError } from "../../context/ErrorToastContext";
import { useDispatch } from "react-redux";
import { calendar } from "../../reducer/campaignSlice";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import loader from "../../assests/loading-v2.gif";
const validationSchema = Yup.object({
  startDate: Yup.string().required("startDate is required"),
  campaignDuration: Yup.string().required("campaignDuration is required"),
});

const gradientInputSx = {
  background: "rgba(255, 255, 255, 0.02)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: "white",
  borderRadius: 2,

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
  },
  "& .MuiInputBase-input": {
    color: "white",
  },
  "& .MuiInputLabel-root": {
    color: "white",
  },
  "& .MuiSelect-icon": {
    color: "white",
  },
  "& .MuiChip-root": {
    background: "#2d2363",
    color: "white",
    fontWeight: 700,
    fontSize: 14,
    borderRadius: 2,
  },
};

type CampaignCalendarProps = { closeDrodpownOpen: () => void ,onModifiedChange?: (modified: boolean) => void};
export type CampaignCalendarHandle = {
  save: () => void;
};

const CampaignCalendar = forwardRef<
  CampaignCalendarHandle,
  CampaignCalendarProps
>(({ closeDrodpownOpen,onModifiedChange }, ref) => {
  const { showErrorToast } = useError();
  // const formik = useFormik({
  //   initialValues: {
  //     startDate: "",
  //     campaignDuration: "",
  //   },
  //   validationSchema,
  //   onSubmit: (values) => {
  //     console.log("Form submitted with values:", values);
  //   },
  // });

  const [startDate, setStartDate] = useState<any>("");
  const [campaignDuration, setCampaignDuration] = useState<any>(0);

  
  // useEffect(() => {
  //   if (startDate && campaignDuration) {
  //     dispatch(calendar({ startDate, campaignDuration }));
  //   }
  // }, [startDate, campaignDuration]);

  const camapaignState = useSelector((state: RootState) => state.campaign);

  // useEffect(() => {
  //   const modified =
  //     camapaignState?.startDate !== startDate ||
  //     Number(camapaignState?.campaignDuration) !== Number(campaignDuration);
   
  //   console.log("modified",modified)
  //   onModifiedChange?.(modified); // 🔥 bubble up
  // }, [startDate, campaignDuration]);


  const dispatch = useDispatch<AppDispatch>();
  useImperativeHandle(ref, () => ({
    save: async () => {
      if (startDate && campaignDuration == 0) {
        showErrorToast("All fileds are mandatory");
        return false;
      }
      return true; // Return values!
    }
  }));


  useEffect(() => {
    if (camapaignState?.startDate) {
      const formattedDate = new Date(camapaignState.startDate)
        .toISOString()
        .split("T")[0]; // "2025-07-29"

      setStartDate(formattedDate);
    }

    if (camapaignState?.campaignDuration) {
      setCampaignDuration(camapaignState?.campaignDuration);
    }
  }, [camapaignState?.startDate, camapaignState?.campaignDuration]);

  useEffect(() => {}, [startDate, campaignDuration]);


  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setStartDate(value);
  dispatch(calendar({ startDate: value, campaignDuration: campaignDuration }));
};
    
  const handleCampaignDuration = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setCampaignDuration(e.target.value)
  dispatch(calendar({ startDate: startDate, campaignDuration: value }));
};

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography
            sx={{
              color: "white",
              fontSize: "2.75rem",
              fontWeight: "500",
              margin: "0 0 2rem 0",
              letterSpacing: "0.02em",
              lineHeight: "1.1",
              textShadow: "none",
              textAlign: "left",
              fontFamily: "Orbitron, sans-serif",
            }}
          >
            Campaign <br />
            Calendar
          </Typography>
          <img
            src={loader}
            style={{
              width: "200px",
              height: "auto",
              maxWidth: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </Box>

        <Box
          className="campaign-detail-rectangle"
          sx={{
            maxHeight: "27vh",
            overflowY: "auto",
          }}
        >
          {/* <form onSubmit={formik.handleSubmit} style={{ width: "100%" }}> */}
          <Typography sx={{ fontSize: "16px", mb: 1, color: "white" }}>
            Start Date *
          </Typography>
          <TextField
            id="startDate"
            name="startDate"
            type="date"
            placeholder="Start Date"
            fullWidth
            InputProps={{
              sx: gradientInputSx,
            }}
            FormHelperTextProps={{
              sx: { color: "red", mt: 0, mb: 0 },
            }}
            value={startDate}
            onChange={handleStartDateChange}
            // onChange={(e) => 
            //   (setStartDate(e.target.value),
            //   dispatch(calendar({startDate:e.target.value,campaignDuration:1}))
            
            // )
            // }
          />

          <Typography
            sx={{ fontSize: "16px", mb: 1, color: "white", mt: "15px" }}
          >
            Campaign Duration: Weeks *
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 4 }}>
            <TextField
              id="campaignDuration"
              name="campaignDuration"
              placeholder="Campaign Duration: Weeks"
              type="number"
              value={campaignDuration}
              onChange={handleCampaignDuration}
              FormHelperTextProps={{
                sx: { color: "red", mt: 0 },
              }}
              sx={{
                ...gradientInputSx,
                input: {
                  color: "#fff",
                  fontWeight: 500,
                },
              }}
            />
            <AppButton
              variantType="primary"
              onClick={(e) => {
                const currentValue = Number(campaignDuration || 0);
                if (currentValue > 0) {
                  setCampaignDuration(currentValue - 1);
                   dispatch(calendar({ startDate: startDate, campaignDuration: currentValue - 1 }));
                }
              }}
            >
              <RemoveIcon />
            </AppButton>

            <AppButton
              variantType="primary"
              onClick={() => {
                const currentValue = Number(campaignDuration || 0);
                setCampaignDuration(currentValue + 1);
                 dispatch(calendar({ startDate: startDate, campaignDuration: currentValue + 1 }));
              }}
            >
              <AddIcon />
            </AppButton>
          </Box>
          {/* </form> */}
        </Box>
      </Box>
    </>
  );
});

export default CampaignCalendar;
