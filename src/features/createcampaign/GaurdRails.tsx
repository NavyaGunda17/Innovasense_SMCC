import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useDispatch } from "react-redux";
import { gaurdRails } from "../../reducer/campaignSlice";
import { useError } from "../../context/ErrorToastContext";
import loader from "../../assests/loading-v2.gif";

type GaurdRailsProps = {
  next: () => void;
  is3DTransitioning?: boolean;
  transitionPhase?: string;
};
export type GaurdRailsHandle = {
  save: () => void;
};

const RULES = ["Political", "Religious", "Gender", "Sexual", "Profanity"];

const GaurdRails = forwardRef<GaurdRailsHandle, GaurdRailsProps>(
  ({ next, transitionPhase, is3DTransitioning }, ref) => {
    const dispatch = useDispatch();
    const [checkedRules, setCheckedRules] = useState<string[]>([...RULES]);
    const { showErrorToast } = useError();
    const handleToggle = (rule: string) => {
      setCheckedRules((prev) =>
        prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]
      );
    };
    const [gaurdRailsList, setGaurdRails] = useState<any>([...RULES]);

    useImperativeHandle(ref, () => ({
      save: () => {
        if (gaurdRailsList.length === 0) {
          showErrorToast("Guardrails is required");
          return false;
        }
        const selectedRules = gaurdRailsList.map((rule: any) => ({
          [`rule`]: rule,
        }));

        dispatch(
          gaurdRails({
            gaurdRails: selectedRules,
          })
        );

        return true;
        // next();
      },
    }));

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

    const toggleSelect = (item: string) => {
      const exists = gaurdRailsList.includes(item);
      if (exists) {
        setGaurdRails(gaurdRailsList.filter((val: string) => val !== item));
      } else {
        setGaurdRails([...gaurdRailsList, item]);
      }
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
              Guardrails
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
          >
            <Box>
              <div className="objective-options">
                {RULES.map((item, idx) => (
                  <div
                    key={idx}
                    className={`objective-option ${
                      gaurdRailsList.includes(item) ? "selected" : ""
                    }`}
                    onClick={() => toggleSelect(item)}
                    onMouseEnter={(e) => handleOptionHover(e, idx)}
                    onMouseLeave={(e) => handleOptionLeave(e)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Box>
          </Box>
        </Box>
        {/* <FormGroup
      sx={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        columnGap: 2,
        rowGap: 1,
        mb: 4,
      }}
    >
      {RULES.map((rule, index) => (
        <Box key={index} sx={{ width: "calc(50% - 16px)" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={checkedRules.includes(rule)}
                onChange={() => handleToggle(rule)}
                sx={{
                  color: "#E1644A",
                  "&.Mui-checked": {
                    color: "#E1644A",
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: 16, fontWeight: 500, color: "#000" }}>
                Rule {index + 1}: {rule}
              </Typography>
            }
          />
        </Box>
      ))}
    </FormGroup> */}
      </>
    );
  }
);

export default GaurdRails;
