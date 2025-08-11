import React, { useState } from "react";
import "./TabNavigation.css"; // Styles defined below

import CampaignIcon from '@mui/icons-material/Campaign';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';


const tabs = [
  { label: "Tab 1", icon: <CampaignIcon />, title: "Campaign Struture" },
  { label: "Tab 2", icon: <OutlinedFlagIcon /> , title: "Goal" },
  { label: "Tab 3", icon: <DisplaySettingsIcon /> , title: "Structure" },
];



type TabNavigationProps = {
    handleTableActive:(tab:any)=>void
}
const TabNavigation:React.FC<TabNavigationProps> = ({handleTableActive}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="tab-container">
      

      <div className="tab-icons">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`tab-circle ${index === activeIndex ? "active" : ""}`}
            onClick={() => (setActiveIndex(index),handleTableActive(index))}
          >
            {tab.icon}
          </div>
        ))}
      </div>
      <div className="tab-title">{tabs[activeIndex].title}</div>
    </div>
  );
};

export default TabNavigation;
