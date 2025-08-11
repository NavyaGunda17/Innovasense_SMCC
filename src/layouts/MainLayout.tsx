import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import StarDustContainer from '../components/StarDustContainer';
import { useLayoutAnimation } from '../context/LayoutAnimationContext';
import TopControls from '../components/TopControl';
import { Box } from '@mui/material';

interface MainLayoutProps {
  children: ReactNode;
 
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { pathname } = location;
  const { isLoggingOut } = useLayoutAnimation();
  const isLoginPage = pathname === '/login';

  const [showLogin, setShowLogin] = useState(isLoginPage);
  const [loginClass, setLoginClass] = useState('slide-in-from-left');
  const [mainAppClass, setMainAppClass] = useState('slide-out-right');

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
      setLoginClass('slide-in-from-left');
      setMainAppClass('slide-out-right');
      setShowLogin(true);
      localStorage.removeItem('auth');
     
    } else if (isLoginPage) {
      setLoginClass('slide-in-from-left');
      setMainAppClass('slide-out-right');
      setShowLogin(true);
    } else {
      setLoginClass('slide-out-left');
      setMainAppClass('slide-in-from-right');

      const timeout = setTimeout(() => {
        setShowLogin(false);
      }, 800);

      return () => clearTimeout(timeout);
    }
  }, [isLoginPage, isLoggingOut]);


  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Fixed background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
        }}
      >
        <StarDustContainer isAuthPage={isLoginPage} />
      </div>

      {/* Login screen - always mounted while in transition */}
      {showLogin && (
        <div className={`login-screen ${loginClass}`}>
          {isLoginPage && children}
        </div>
      )}

      {/* Main app screen */}
      <div className={`main-app ${mainAppClass}`}>
         {/* <Box sx={{position:"absolute",top:"56px",right:"60px",
              // opacity:!isLoginPage ? 1:0,
              display:!isLoginPage ? "inline-block":"none",
              zIndex:9999
            }}>
 <TopControls />
            </Box> */}
        {!isLoginPage && (
          <div className="flex flex-col flex-1" style={{ height: '100vh' }}>
           
             <Box sx={{position:"absolute",top:"56px",right:"60px",
              // opacity:!isLoginPage ? 1:0,
              display:!isLoginPage ? "inline-block":"none",
              zIndex:99
            }}>
 <TopControls />
            </Box>
             
              {!isLoginPage &&  
   <div className='overlay-outline'>
    
    </div>}
            <main className="flex-1 p-6 bg-gray-100" style={{ height: 'inherit', overflowY: 'auto' }}>
              {children}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
