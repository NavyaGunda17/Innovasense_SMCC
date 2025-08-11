import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import LoginForm from '../features/auth/LoginForm';
import SignUpForm from '../features/auth/SignUpForm';
import { InfoProvider } from '../context/InfoToastContext';
import { ErrorProvider } from '../context/ErrorToastContext';
import { SuccessProvider } from '../context/SuccessToastContext';
import ErrorToastComponent from '../components/ErrorToastComponent';
import SuccessToastComponent from '../components/SuccessToastComponent';
import InfoToastComponent from '../components/InfoToastComponent';
import CampaignList from '../features/campagin/CampaignList';
import Dashboard from '../features/dashboard/Dashboard';
import CreateCampaign from '../features/campagin/CreateCampaign';
import CampaignCalendar from '../features/Calendar/CampaignCalendar';
import CamapignCalendarWeekDetails from '../features/Calendar/CampaignCalendarWeekDetails';
import PostList from '../features/posts/PostList';
import { LayoutAnimationProvider } from '../context/LayoutAnimationContext';
import GlobalCampaignDataProvider from '../components/GlobalCampaignDataProvider';

const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <InfoProvider>
      <ErrorProvider>
        <SuccessProvider>
          <LayoutAnimationProvider >
              <GlobalCampaignDataProvider >
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public routes using MainLayout */}
        <Route   element={<MainLayout><Outlet /></MainLayout>}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
         
        </Route>

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Outlet />
              </MainLayout>
            </ProtectedRoute>
          }
        >
           <Route path="/campaignList" element={<CampaignList />} />
          <Route path="/campaignDetails/:id" element={<CreateCampaign />} />
           <Route path="/creatCampaign/:id" element={<CreateCampaign />} />
          <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/campaignCalendar/:id" element={<CampaignCalendar />} />
           <Route path="/campaignWeekDetails/:weekId/:campaignId" element={<CamapignCalendarWeekDetails />} />
            <Route path="/posts/:campaignId/:weekId" element={<PostList />} />
        </Route>
      </Routes>
    </React.Suspense>
    </GlobalCampaignDataProvider>
    </LayoutAnimationProvider>
      <InfoToastComponent />
    <SuccessToastComponent/>
    <ErrorToastComponent/>
    </SuccessProvider>
    </ErrorProvider>
    </InfoProvider>
  </BrowserRouter>
);


export default AppRoutes;