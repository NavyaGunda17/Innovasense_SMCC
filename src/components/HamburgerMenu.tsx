import React, { useState, useRef, useEffect } from "react";
import "./HamburgerMenu.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

type HamburgerMenuProps = {
  currentPage?: string;
  onNavigate?: (page: string) => void;
};

type MenuItem = {
  name: string;
  active: boolean;
  objectiveName: string;
};

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  currentPage = "Campaigns",
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [activeItem, setActiveItem] = useState<string>(currentPage);

  const menuItems: MenuItem[] = [
    {
      name: "Campaigns",
      objectiveName: "Campaigns",
      active: activeItem === "Campaigns",
    },
    {
      name: "File Upload",
      objectiveName: "FileUpload",
      active: activeItem === "File Upload",
    },
    {
      name: "File Summary",
      objectiveName: "FileSummary",
      active: activeItem === "File Summary",
    },
    {
      name: "Strategic Objective",
      objectiveName: "StrategicObjective",
      active: activeItem === "Strategic Objective",
    },
    {
      name: "Target Segments",
      objectiveName: "TargetSegments",
      active: activeItem === "Target Segments",
    },
    // { name: 'Guardrails',objectiveName:"Guardrails", active: false },
    {
      name: "Key Dates",
      objectiveName: "KeyDates",
      active: activeItem === "Key Dates",
    },
    {
      name: "AI Generated Brand Strategy",
      objectiveName: "AIGeneratedBase",
      active: activeItem === "AI Generated Brand Strategy",
    },
    { name: "Goal", objectiveName: "Goal", active: activeItem === "Goal" },
    {
      name: "AI Generated Goal",
      objectiveName: "AIGneeratedGoal",
      active: activeItem === "Goal",
    },
    {
      name: "Structure",
      objectiveName: "Structure",
      active: activeItem === "Structure",
    },
    {
      name: "Calendar",
      objectiveName: "Calendar",
      active: activeItem === "Calendar",
    },
    // {
    //   name: "Master Article",
    //   objectiveName: "MasterArticle",
    //   active: activeItem === "Master Article",
    // },
    // { name: "Posts", objectiveName: "Posts", active: activeItem === "Posts" },
  ];

  const campaignState = useSelector((state: RootState) => state.campaign);

  useEffect(() => {}, [campaignState]);

  const location = useLocation();

  useEffect(() => {
    const hash = location.hash?.replace("#", "");
    const pathname = location.pathname;

    // Match hash with menu item’s objectiveName
    const matchedItem = menuItems.find(
      (item) => item.objectiveName.toLowerCase() === hash?.toLowerCase()
    );

    if (matchedItem) {
      setActiveItem(matchedItem.name); // ✅ Update menu highlight
    }
    // Fallback: Match path-based routes like Calendar or Master Article
    if (pathname.includes("/campaignCalendar")) {
      setActiveItem("Calendar");
    } else if (pathname.includes("/campaignWeekDetails")) {
      setActiveItem("Master Article");
    } else if (pathname.includes("/campaignList")) {
      setActiveItem("Campaigns");
    } else if (pathname.includes("/posts")) {
      setActiveItem("Posts");
    }
  }, [location.hash]);

  const isItemEnabled = (itemName: string) => {
    const pathname = location.pathname;
    // 🚫 Disable everything except "Campaigns" on /campaignList
    if (pathname === "/campaignList") {
      return itemName === "Campaigns";
    }

    const alwaysEnabled = [
      "Campaigns",
      "File Upload",
      "Strategic Objective",
      "Target Segments",
      "Key Dates",
    ];
    if (alwaysEnabled.includes(itemName)) return true;
    if (itemName === "AI Generated Brand Strategy" || itemName === "Goal") {
      return !!campaignState?.brandTone;
    }

    if (itemName === "File Summary") {
      return !!campaignState?.generatedFileSummary;
    }

    if (itemName === "AI Generated Goal") {
      return !!campaignState?.generatedCampaignGoal;
    }

    if (itemName === "Structure") {
      return !!campaignState?.campaignStructureSummary;
    }
    if (itemName === "Calendar") {
      return !!campaignState?.campaignStructureSummary; // Optional: set this flag after approval
    }
    // if (itemName === "Master Article") {
    //   return (campaignState?.campaignMasterArticle || [])?.length > 0;
    // }

    return false;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
  };
  const naviagte = useNavigate();
  const campaignId = useSelector(
    (state: RootState) => state.campaign.campaignId
  );
  const companyId = useSelector((state: RootState) => state.auth.companyId);
  const weekId = useSelector((state: RootState) => state.campaign.weekId);

  const handleItemClick = (itemName: any): void => {
    setActiveItem(itemName.name); // ✅ Set clicked item as active

    console.log(`Clicked: ${itemName}`);
    if (
      itemName.name == "File Upload" ||
      itemName.name == "File Summary" ||
      itemName.name == "Strategic Objective" ||
      itemName.name == "Target Segments" ||
      itemName.name == "Goal" ||
      itemName.name == "AI Generated Goal" ||
      itemName.name == "Key Dates" ||
      itemName.name == "AI Generated Brand Strategy" ||
      itemName.name == "Structure"
    ) {
      naviagte(`/creatCampaign/${campaignId}#${itemName.objectiveName}`);
    }
    if (itemName.name == "Campaigns") {
      naviagte(`/campaignList`);
    }
    if (itemName.name == "Calendar") {
      naviagte(`/campaignCalendar/${campaignId}`);
    }
    if (itemName.name == "Master Article") {
      naviagte(`/campaignWeekDetails/${weekId}/${campaignId}`);
    }

    if (onNavigate) {
      onNavigate(itemName);
    }
    setIsOpen(false);
  };

  return (
    <div className="hamburger-menu-container" ref={menuRef}>
      {/* Hamburger Icon */}
      <button className="hamburger-btn" onClick={toggleMenu}>
        <div className={`hamburger-line ${isOpen ? "open" : ""}`}></div>
        <div className={`hamburger-line ${isOpen ? "open" : ""}`}></div>
        <div className={`hamburger-line ${isOpen ? "open" : ""}`}></div>
      </button>

      {/* Menu Content */}
      {isOpen && (
        <div className="menu-content" style={{ color: "white" }}>
          {menuItems.map((item, index) => {
            const isEnabled = isItemEnabled(item.name);
            const isActive = activeItem === item.name;

            return (
              <div
                key={index}
                className={`menu-item ${isActive ? "active" : ""} ${
                  !isEnabled ? "disabled" : ""
                }`}
                onClick={() => isEnabled && handleItemClick(item)}
                style={{
                  cursor: isEnabled ? "pointer" : "not-allowed",
                  opacity: isEnabled ? 1 : 0.4,
                }}
              >
                {item.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
