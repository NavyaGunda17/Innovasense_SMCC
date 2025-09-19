import React, { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import StarDustContainer from "../components/StarDustContainer";
import { useLayoutAnimation } from "../context/LayoutAnimationContext";
import TopControls from "../components/TopControl";
import { Box } from "@mui/material";
import picture from "../assests/lady1.png"
import ChatHint from "../components/PersonChatUI";
import WhiteLogo from "../assests/white-logo.svg"
interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { pathname ,hash} = location;

  const { isLoggingOut } = useLayoutAnimation();
  const isLoginPage = pathname === "/login";

  const [showLogin, setShowLogin] = useState(isLoginPage);
  const [loginClass, setLoginClass] = useState("slide-in-from-left");
  const [mainAppClass, setMainAppClass] = useState("slide-out-right");

  // useEffect(() => {
  //   if (isLoginPage) {
  //     setShowLogin(true);
  //     // Animate main app out, login in
  //     setLoginClass('slide-in-from-left');
  //     setMainAppClass('slide-out-right');
  //   } else {
  //     // Animate login out, main app in
  //     setLoginClass('slide-out-left');
  //     setMainAppClass('slide-in-from-right');

  //     // Wait for animation to finish before hiding login
  //     const timeout = setTimeout(() => {
  //       setShowLogin(false);
  //     }, 800); // match your CSS duration

  //     return () => clearTimeout(timeout);
  //   }
  // }, [isLoginPage]);

  useEffect(() => {
    if (isLoggingOut) {
      setLoginClass("slide-in-from-left");
      setMainAppClass("slide-out-right");
      setShowLogin(true);
      localStorage.removeItem("auth");
    } else if (isLoginPage) {
      setLoginClass("slide-in-from-left");
      setMainAppClass("slide-out-right");
      setShowLogin(true);
    } else {
      setLoginClass("slide-out-left");
      setMainAppClass("slide-in-from-right");

      const timeout = setTimeout(() => {
        setShowLogin(false);
      }, 800);

      return () => clearTimeout(timeout);
    }
  }, [isLoginPage, isLoggingOut]);

  return (
    <div className="fixed inset-0 flex flex-col" style={{ height: "100vh" }}>
      <StarDustContainer isAuthPage={isLoginPage} />
      <div
        className="absolute inset-0 flex flex-col"
        style={{ height: "100vh" }}
      >
        {/* Login screen - always mounted while in transition */}
        {showLogin && (
          <div
            className={`login-screen ${loginClass}`}
            style={{ height: "100vh" }}
          >
            {isLoginPage && children}
          </div>
        )}

        {/* Main app screen */}
        <div className={`main-app ${mainAppClass}`} style={{ height: "100vh" }}>
          {!isLoginPage && (
            <div className="flex flex-col" style={{ height: "100vh" }}>
              
              <Box
                sx={{
                  position: "fixed",
                  top: "56px",
                  right: "60px",
                  display: !isLoginPage ? "inline-block" : "none",
                  zIndex: 99,
                }}
              >
                <TopControls />
                
              </Box>
              <Box  sx={{
                  position: "fixed",
                  bottom: "30px",
                  left: "0px",
                  display:( pathname.includes("/campaignCalendar")  ||  pathname.includes("/campaignWeekDetails") ) ?"none" : "inline-block" ,
                  zIndex: 999,
                }}>
                 <div>
                {/* <img src={picture} style={{width:"30vw"}}/> */}
                <ChatHint />
                </div>
              </Box>

              {!isLoginPage && <div className="overlay-outline"></div>}
              <main
                className="flex-1 p-6 flex flex-col"
                style={{ height: "100vh" }}
              >
                {children}
              </main>
                
      <Box sx={{position:"fixed",bottom:"60px",right:"60px"}}>
        <img src={WhiteLogo} width={170} />
      </Box>
      
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
