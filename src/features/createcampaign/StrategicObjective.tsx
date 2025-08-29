// StrategicObjective.tsx
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchCampaignEnumerations } from "../../reducer/campaignThunk";
import { stretegyObjectives } from "../../reducer/campaignSlice";
import { useError } from "../../context/ErrorToastContext";
import loader from "../../assests/loading-v2.gif";
import FileUpload from "../../components/FileUpload";

type StrategicObjectiveProps = {
  is3DTransitioning?: boolean;
  transitionPhase?: string;
};
export type StrategicObjectiveHandle = {
  save: () => void;
};

const StrategicObjective = forwardRef<
  StrategicObjectiveHandle,
  StrategicObjectiveProps
>(({ transitionPhase, is3DTransitioning }, ref) => {
  const [value, setValue] = useState<any>("");
  const [enumerators, setEnumerators] = useState<any>([]);
  const dispatch = useDispatch<AppDispatch>();
  const { showErrorToast } = useError();
  const campaign = useSelector(
    (state: RootState) => state.campaign.enumerations
  );

  useEffect(() => {
    dispatch(fetchCampaignEnumerations());
  }, [dispatch]);

  useEffect(() => {
    const data: any = campaign?.filter(
      (campaign) => campaign.enumName == "strategicObjective"
    );
    if (data && data.length > 0) {
      const formatted = data[0].options.map((item: any, index: number) => {
        const key = Object.keys(item)[0];
        return {
          id: index + 1,
          option: item[key],
        };
      });
      console.log("formatted", formatted);
      setEnumerators(formatted);
    }
  }, [campaign]);

  // Expose save handler to parent
  useImperativeHandle(ref, () => ({
    save: () => {
      if (typeof value === "string") {
  if (value.trim().length === 0) {
    showErrorToast("Strategic Objective is required");
    return false;
  }
} else if (Array.isArray(value)) {
  if (value.length === 0) {
    showErrorToast("Strategic Objective is required");
    return false;
  }
}


      // if (value.length == 0) {
      //   showErrorToast("Strategic Objective is required");
      //   return false;
      // }
      dispatch(
        stretegyObjectives({
          strategicObjective: typeof value === "string" ? value : value.option,
        })
      );
      console.log("Saving Strategic Objective:", value);
      // next()
      return true;
      // Call any API or dispatch action here
    },
  }));

  const [selectedObjective, setSelectedObjective] = useState<any>("");
  const [customObjective, setCustomObjective] = useState<any>("");
  const handleObjectiveSelect = (objective: any) => {
    console.log("handleObjectiveSelect", objective);
    setValue(objective);
    setSelectedObjective(objective);
    setCustomObjective(""); // Clear text field when option is selected
  };

  const camapaignState: any = useSelector(
    (state: RootState) => state?.campaign
  );
  useEffect(() => {
    console.log("camapaignState?.strategicObjective",camapaignState?.strategicObjective)
    if (camapaignState?.strategicObjective && enumerators.length > 0) {
      const selected = enumerators.find(
        (item: { option: string }) =>
          item.option.trim().toLowerCase() ===
          camapaignState?.strategicObjective.trim().toLowerCase()
      );
      if (selected) {
        setSelectedObjective(selected);
        setValue(selected);
      }else{
        setCustomObjective(camapaignState?.strategicObjective)
         setValue(camapaignState?.strategicObjective);
      }
    }
  }, [camapaignState?.strategicObjective, enumerators]);

  // 3D Zoom effect handlers
  const handleOptionHover = (hoveredIndex: any, containerSelector: any) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const options = container.querySelectorAll(
      ".objective-option, .segment-option"
    );

    options.forEach((option: any, index: any) => {
      const distance = Math.abs(index - hoveredIndex);

      // Remove all hover classes first
      option.classList.remove(
        "hover-active",
        "hover-neighbor",
        "hover-distant"
      );

      if (index === hoveredIndex) {
        option.classList.add("hover-active");
      } else if (distance === 1) {
        option.classList.add("hover-neighbor");
      } else {
        option.classList.add("hover-distant");
      }
    });
  };

  const handleOptionLeave = (containerSelector: any) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const options = container.querySelectorAll(
      ".objective-option, .segment-option"
    );

    options.forEach((option: any) => {
      option.classList.remove(
        "hover-active",
        "hover-neighbor",
        "hover-distant"
      );
    });
  };

  return (
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
          Strategic <br />
          Objective
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
        className={`campaign-detail-rectangle ${
          is3DTransitioning ? "transitioning-3d" : ""
        } ${transitionPhase !== "idle" ? `phase-${transitionPhase}` : ""} `}
        sx={{
          maxHeight: "50vh",
          overflowY: "auto",
        }}
      >
        <div className="objective-options">
          {enumerators.map((objective: any, index: any) => (
            <div
              key={index}
              className={`objective-option ${
                selectedObjective?.option === objective.option ? "selected" : ""
              }`}
              onClick={() => handleObjectiveSelect(objective)}
              onMouseEnter={() =>
                handleOptionHover(index, ".objective-options")
              }
              onMouseLeave={() => handleOptionLeave(".objective-options")}
            >
              {objective?.option}
            </div>
          ))}

          <div className="custom-objective-section">
            <textarea
              value={customObjective}
              onChange={(e) => (
                setCustomObjective(e.target.value),
                setValue(e.target.value),
                setSelectedObjective("")
              )}
              placeholder="Or enter your own strategic objective..."
              className="custom-objective-input"
              // rows="3"
            />
          </div>
        </div>
      </Box>
    </Box>
  );
});

export default StrategicObjective;
