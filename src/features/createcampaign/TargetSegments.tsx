import { Box, Typography } from "@mui/material";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useError } from "../../context/ErrorToastContext";
import { segments } from "../../reducer/campaignSlice";
import loader from "../../assests/loading-v2.gif";
type SegmentOption = { id: number; option: string };
type TargetSegmentsProps = {
  next: () => void;
  is3DTransitioning?: boolean;
  transitionPhase?: string;
};
export type TargetSegmentsHandle = {
  save: () => void;
};

const TargetSegments = forwardRef<TargetSegmentsHandle, TargetSegmentsProps>(
  ({ next, transitionPhase, is3DTransitioning }, ref) => {
    const dispatch = useDispatch<AppDispatch>();
    const campaign = useSelector(
      (state: RootState) => state.campaign.enumerations
    );
    const campaignState = useSelector((state: RootState) => state.campaign);
    const { showErrorToast } = useError();

    const [segmentList, setSegmentList] = useState<SegmentOption[]>([]);
    const [demographicsList, setDemographicsList] = useState<SegmentOption[]>(
      []
    );
    const [psychographicsList, setPsychographicsList] = useState<
      SegmentOption[]
    >([]);

    const [segmentValue, setSegmentValue] = useState<SegmentOption[]>([]);
    const [demographicsValue, setDemographicsValue] = useState<SegmentOption[]>(
      []
    );
    const [psychographicsValue, setPsychographicsValue] = useState<
      SegmentOption[]
    >([]);

    const formatData = (data: any): SegmentOption[] =>
      data.map((item: any, index: number) => {
        const key = Object.keys(item)[0];
        return { id: index + 1, option: item[key] };
      });

    const fromReduxFormat = (data: any[] | null): SegmentOption[] => {
      if (!data) return [];
      return data.map((item, index) => {
        const key = Object.keys(item)[0];
        return { id: index + 1, option: item[key] };
      });
    };

    useEffect(() => {
      if (campaign && campaign.length > 0) {
        const segment = campaign.find((c) => c.enumName === "segment");
        const demographics = campaign.find(
          (c) => c.enumName === "demographics"
        );
        const psychographics = campaign.find(
          (c) => c.enumName === "psychographics"
        );

        if (segment) setSegmentList(formatData(segment.options));
        if (demographics) setDemographicsList(formatData(demographics.options));
        if (psychographics)
          setPsychographicsList(formatData(psychographics.options));

        setSegmentValue(fromReduxFormat(campaignState.segment));
        setDemographicsValue(fromReduxFormat(campaignState.demographics));
        setPsychographicsValue(fromReduxFormat(campaignState.psychographics));
      }
    }, [campaign]);

    // Save logic
    useImperativeHandle(ref, () => ({
      save: () => {
        if (segmentValue.length === 0) {
          showErrorToast("Segment is required");
          return false;
        }
        if (demographicsValue.length === 0) {
          showErrorToast("Demographics is required");
          return false;
        }
        if (psychographicsValue.length === 0) {
          showErrorToast("Psychographics is required");
          return false;
        }

        dispatch(
          segments({
            segment: segmentValue.map((val) => ({ option: val.option })),
            demographics: demographicsValue.map((val) => ({
              option: val.option,
            })),
            psychographics: psychographicsValue.map((val) => ({
              option: val.option,
            })),
          })
        );

        return true;
      },
    }));

    const toggleSelect = (
      item: SegmentOption,
      selectedList: SegmentOption[],
      setter: React.Dispatch<React.SetStateAction<SegmentOption[]>>
    ) => {
      const exists = selectedList.find((val) => val.option === item.option);
      if (exists) {
        setter(selectedList.filter((val) => val.option !== item.option));
      } else {
        setter([...selectedList, item]);
      }
    };

    // Hover handlers scoped to each container
    const handleOptionHover = (
      event: React.MouseEvent<HTMLDivElement>,
      hoveredIndex: number
    ) => {
      const container = event.currentTarget.closest(".objective-options");
      if (!container) return;
      const options = container.querySelectorAll(".objective-option");

      options.forEach((option, index) => {
        option.classList.remove(
          "hover-active",
          "hover-neighbor",
          "hover-distant"
        );

        if (index === hoveredIndex) {
          option.classList.add("hover-active");
        } else if (Math.abs(index - hoveredIndex) === 1) {
          option.classList.add("hover-neighbor");
        } else {
          option.classList.add("hover-distant");
        }
      });
    };

    const handleOptionLeave = (event: React.MouseEvent<HTMLDivElement>) => {
      const container = event.currentTarget.closest(".objective-options");
      if (!container) return;
      const options = container.querySelectorAll(".objective-option");

      options.forEach((option) =>
        option.classList.remove(
          "hover-active",
          "hover-neighbor",
          "hover-distant"
        )
      );
    };

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 4,
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
            Segments
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
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Segment List */}
          <Box
            className={`campaign-detail-rectangle ${
              is3DTransitioning ? "transitioning-3d" : ""
            } ${transitionPhase !== "idle" ? `phase-${transitionPhase}` : ""} `}
            sx={{
              width: "auto !important",
              minWidth: "auto !important",
              maxWidth: "auto !important",
              display: "flex",
              flexDirection: "row",
              gap: 4,
              maxHeight: "45vh",
              overflowY: "auto",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "18px", textAlign: "center", mb: 2 }}>
                Who they are
              </Typography>

              <div className="objective-options">
                {segmentList.map((item, idx) => (
                  <div
                    key={idx}
                    className={`objective-option ${
                      segmentValue.find((v) => v.option === item.option)
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      toggleSelect(item, segmentValue, setSegmentValue)
                    }
                    onMouseEnter={(e) => handleOptionHover(e, idx)}
                    onMouseLeave={(e) => handleOptionLeave(e)}
                  >
                    {item.option}
                  </div>
                ))}
              </div>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "18px", textAlign: "center", mb: 2 }}>
                Age groups
              </Typography>

              <div className="objective-options">
                {demographicsList.map((item, idx) => (
                  <div
                    key={idx}
                    className={`objective-option ${
                      demographicsValue.find((v) => v.option === item.option)
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      toggleSelect(
                        item,
                        demographicsValue,
                        setDemographicsValue
                      )
                    }
                    onMouseEnter={(e) => handleOptionHover(e, idx)}
                    onMouseLeave={(e) => handleOptionLeave(e)}
                  >
                    {item.option}
                  </div>
                ))}
              </div>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "18px", textAlign: "center", mb: 2 }}>
                How they think/behave
              </Typography>

              <div className="objective-options">
                {psychographicsList.map((item, idx) => (
                  <div
                    key={idx}
                    className={`objective-option ${
                      psychographicsValue.find((v) => v.option === item.option)
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      toggleSelect(
                        item,
                        psychographicsValue,
                        setPsychographicsValue
                      )
                    }
                    onMouseEnter={(e) => handleOptionHover(e, idx)}
                    onMouseLeave={(e) => handleOptionLeave(e)}
                  >
                    {item.option}
                  </div>
                ))}
              </div>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }
);

export default TargetSegments;
