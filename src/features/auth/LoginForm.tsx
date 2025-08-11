

import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  InputAdornment
} from '@mui/material';
// import { useDispatch, useSelector } from 'react-redux';
// import { login } from '@/app/authSlice';
import { Route, useNavigate } from 'react-router-dom';
// import type { RootState } from '@/app/store';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {Grid} from '@mui/material';
// import { supabase } from '@/lib/supabaseClient';
// import { useSuccess } from '@/context/SuccessToastContext';
// import { useInfo } from '@/context/InfoToastContext';
// import { createFolder } from '@/routes/createFolder';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AiAvatar from '../../assests/lady.png'
import "./BreatheAnimation.css"
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { supabase } from '../../lib/supabaseClient';
import { useSuccess } from '../../context/SuccessToastContext';
import { useError } from '../../context/ErrorToastContext';
import { login } from '../../reducer/authSlice';
import { createOrganizationFolder } from '../../lib/createFolder';

const validationSchema = Yup.object({
  userName: Yup.string().required('UserName is required'),
  password: Yup.string().required('Password is required'),
});
type LoginProps = {
  onLogin?:()=>void
}
const LoginForm: React.FC<LoginProps> = ({onLogin}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const formik = useFormik({
    initialValues: {
      userName: '',
      password: '',
    },
    validationSchema,
    onSubmit: (values) => {
      handleLoginSubmit(values)
    },
  });
    const { showSuccessToast} = useSuccess()
    const { showErrorToast} = useError()
    
  const handleLoginSubmit = async(values:any) =>{
    const {  userName, password } = values;
    const { data: userMatch, error: matchError } = await supabase
  .from('userList') // ✅ make sure the table name matches exactly
  .select('id , companyId')
  .eq('userName', userName) // ✅ or 'userName' depending on your column name
  .eq('password', password)
  .limit(1);


if (!userMatch || userMatch.length === 0) {
  showErrorToast('Incorrect username or password.');
  return;
}
// showSuccessToast("Logged In SuccessFully!")

const { data: compnayMatch, error: companyError } = await supabase
.from('companyList') // ✅ make sure the table name matches exactly
.select('id ,companyName')
.eq('id', userMatch?.[0]?.companyId) 
.limit(1);
const formValues = { ...values, companyId: userMatch?.[0]?.companyId , companyName:compnayMatch?.[0]?.companyName};
console.log("compnayMatch",compnayMatch,companyError)
createOrganizationFolder(compnayMatch && compnayMatch[0].companyName)
dispatch(login(formValues))
// onLogin()
}

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/campaignList');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Box
      sx={{
        // minHeight: '100vh',
        width: '100%',
        height:"inherit",
        // background: '#EFF0F8',
        backgroundSize: 'cover',
        display: 'flex',
        alignItems: 'center',
        alignContent:"center",
        justifyContent: 'space-around',
        position: 'relative',
        overflow: 'hidden',
       
        // border:'1px solid white'
      }}
    >
     
      <Box sx={{position:"absolute",top:"40px",left:"-40px",zIndex:1,rotate:'-45deg',background:'#6172ee',width:"180px",textAlign:"center"}}>
      <Typography >DEMO</Typography>
      </Box>
     <Box sx={{ display: 'flex', width: '100vw' }}>
  <Box sx={{ flex: 1, width: '100%',justifyContent:"center",display:"flex" }}><Box sx={{ width: '100%', maxWidth: 420,p:5, display: 'flex', flexDirection: 'column', alignItems: 'center', 
            // backdropFilter:'blur(20px)',
            borderRadius:2}}>
            <Avatar src={AiAvatar} sx={{ width: "auto", height: '220px', mb: 0, borderRadius:0, bgcolor: 'transparent' }} />
            <Box sx={{
               background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: 3,
            width: '100%',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.25)'
            }}>

           
            <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
              <TextField
                fullWidth
                id="userName"
                name="userName"
                // label="ORGINAZATION"
                placeholder="User Name"
                margin="normal"
                value={formik.values.userName}
                onChange={formik.handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircleIcon sx={{ color: 'white' }} />
                    </InputAdornment>
                  ),
                  style: {   width: '100%',
               
                background: 'rgba(255, 255, 255, 0.06)',
               
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: '400',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit' },
                }}
                InputLabelProps={{ style: { color: 'white', fontWeight: 500, letterSpacing: 1 } }}
              
              />
              <TextField
                fullWidth
                type='password'
                id="password"
                name="password"
                // label="USERNAME"
                placeholder="PASSWORD"
                margin="normal"
                value={formik.values.password}
                onChange={formik.handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VisibilityOffIcon sx={{ color: 'white' }} />
                    </InputAdornment>
                  ),
                  style: {  width: '100%',
               
                background: 'rgba(255, 255, 255, 0.06)',
               
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: '400',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit' },
                }}
                InputLabelProps={{ style: { color: 'white', fontWeight: 500, letterSpacing: 1 } }}
              sx={{mb:5}}
              />
              <Button
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                sx={{
                  mt: 0,
                  py: 2,
                  fontWeight: 700,
                  fontSize: 20,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #6366f1e6 0%, #8b5cf6e6 100%)'  ,
                  color: '#fff',
                  boxShadow: 2,
                  letterSpacing: 2,
                  '&:hover': {
                    background: 'linear-gradient(240deg, #6366f1e6 0%, #8b5cf6e6 100%)' 
                  },
                }}
              >
                LOGIN
              </Button>
            
                   </form>
                   
             </Box>
                <Typography sx={{fontSize:"14px",mt:2,textAlign:"center",fontWeight:"100",color:"#F2F7FA"}}>Don't Have an account? Please <a href='#' style={{color: 'rgba(255, 255, 255, 0.5)', cursor:"not-allowed"}}>Signup</a></Typography>
                <Typography sx={{textAlign:"center",fontSize:"16px",mt:4,fontWeight:"100",color:"#F2F7FA"}} >
                  Interested in exploring this application?<br />
            Contact our sales team at{' '}
                  <b style={{ color: 'rgba(99, 102, 241, 0.9)',}}>sales@innovasense.com</b></Typography>
         
          </Box></Box>
  <Box sx={{ flex: 1, width: '100%',justifyContent:"center",alignItems:"left",display:"flex",flexDirection:"column"  }}> 
    <Box>
     {/* Title */}
        <h1 style={{
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
          Agentic AI<br />
          Content Creator
        </h1>
        
        {/* Description */}
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '1.05rem',
          lineHeight: '1.6',
          margin: '0',
          maxWidth: '480px',
          textShadow: '0 1px 6px rgba(0, 0, 0, 0.6)',
          textAlign: 'left',
          fontWeight: '400'
        }}>
          Launch bold campaigns without chaos. Your AI agent extracts insights, 
          generates multi-platform strategies, and auto-builds content calendars. 
          Transform weeks of coordination into minutes of execution.
        </p>
        </Box>
    </Box>
</Box>
     
        {/* Left: Login Form */}
       
          
       
      
      
    </Box>
  );
};

export default LoginForm;