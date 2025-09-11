

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
import { useDispatch, useSelector } from 'react-redux';
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
import AiAvatar from '../../assests/creator.png'
import "./BreatheAnimation.css"
import StoreIcon from '@mui/icons-material/Store';
import { RootState } from '../../store/store';
import { supabase } from '../../lib/supabaseClient';
import { useSuccess } from '../../context/SuccessToastContext';
import { useError } from '../../context/ErrorToastContext';
import { signup } from '../../reducer/authSlice';

const validationSchema = Yup.object({
  organization: Yup.string().required('Organization is required'),
  userName: Yup.string().required('UserName is required'),
  password: Yup.string().required('Password is required'),
  re_password: Yup.string().required('Re Enter password is required'),
});

const SignUpForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const { showSuccessToast} = useSuccess()
    const { showErrorToast} = useError()

  const formik = useFormik({
    initialValues: {
      organization:"",
      userName: '',
      password: '',
      re_password: '',
    },
    validationSchema,
    onSubmit: (values) => {
      handleFormSubmit(values)
      // dispatch(login(values));
    },
  });

  const handleFormSubmit = async (
    values:any
  ) => {

    const { organization, userName, password, re_password } = values;
  
    if (password !== re_password) {
      alert("Passwords do not match");
      return;
    }
  
    // Step 1: Check if company exists
    const { data: existingCompanies, error: companyCheckError } = await supabase
      .from('companyList')
      .select('id')
      .ilike('companyName', organization.toLowerCase())
      .limit(1);
  

  
    let companyId: string;
  
    if (existingCompanies && existingCompanies.length > 0) {
      // Company exists
      companyId = existingCompanies[0].id;
    } else {
      // Insert new company
      const { data: newCompany, error: companyInsertError } = await supabase
        .from('companyList')
        .insert({ companyName: organization })
        .select()
        .single();
  
      if (companyInsertError) {
 
        showErrorToast('Failed to create company');
        return;
      }
  
      companyId = newCompany.id;
    }
  


    const { data: existingUser, error: userCheckError } = await supabase
  .from('userList')
  .select('id')
  .eq('userName', userName) // Make sure field name matches Supabase column
  .limit(1);



if (existingUser && existingUser.length > 0) {
  showErrorToast('Username already exists. Please use a different username.');
  return;
}

    // Step 2: Insert user into User table
    const { error: userInsertError } = await supabase.from('userList').insert({
      companyId: companyId,
      userName: userName,
      password: password,
    });
  
    if (userInsertError) {
      console.error('Error inserting user:', userInsertError);
      showErrorToast('Failed to create user');
      return;
    }
  
    // Step 3: Update Redux state
    // showSuccessToast("User Created SuccessFully!.")
    navigate('/login'); // navigate to login page
    dispatch(signup(values));
  };
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
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
            <Avatar src={AiAvatar} sx={{ width: 160, height: 200, mb: 0, borderRadius:0, bgcolor: 'transparent' }} />
            <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
              <TextField
                fullWidth
                id="organization"
                name="organization"
                // label="ORGINAZATION"
                placeholder="ORGINAZATION"
                margin="normal"
                value={formik.values.organization}
                onChange={formik.handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StoreIcon sx={{ color: 'white' }} />
                    </InputAdornment>
                  ),
                  style: { color: 'white', borderColor: 'white' },
                }}
                InputLabelProps={{ style: { color: 'white', fontWeight: 500, letterSpacing: 1 } }}
                sx={{
                  mb: 3,
                  background: 'transparent',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'white',
                    },
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'white',
                  },
                }}
              />
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
                  style: { color: 'white', borderColor: 'white' },
                }}
                InputLabelProps={{ style: { color: 'white', fontWeight: 500, letterSpacing: 1 } }}
                sx={{
                  mb: 3,
                  background: 'transparent',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'white',
                    },
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'white',
                  },
                }}
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
                  style: { color: 'white', borderColor: 'white' },
                }}
                InputLabelProps={{ style: { color: 'white', fontWeight: 500, letterSpacing: 1 } }}
                sx={{
                  mb: 3,
                 
                  background: 'transparent',
                  borderRadius: 2,
                  '& .MuiFormControl-marginNormal':{
                    marginTop:0,
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'white',
                      
                    },
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'white',
                    
                  },
                }}
              />
               <TextField
                fullWidth
                type='password'
                id="re_password"
                name="re_password"
                // label="USERNAME"
                placeholder="Confirm Password"
                margin="normal"
                value={formik.values.re_password}
                onChange={formik.handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VisibilityOffIcon sx={{ color: 'white' }} />
                    </InputAdornment>
                  ),
                  style: { color: 'white', borderColor: 'white' },
                }}
                InputLabelProps={{ style: { color: 'white', fontWeight: 500, letterSpacing: 1 } }}
                sx={{
                  mb: 5,
                 
                  background: 'transparent',
                  borderRadius: 2,
                  '& .MuiFormControl-marginNormal':{
                    marginTop:0,
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'white',
                      
                    },
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'white',
                    
                  },
                }}
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
                  background: 'linear-gradient(90deg, #6B73FF 0%, #3a6ea5 100%)' ,
                  color: '#fff',
                  boxShadow: 2,
                  letterSpacing: 2,
                  textTransform:"none",
                  '&:hover': {
                    background: 'linear-gradient(240deg, #6B73FF 0%, #3a6ea5 100%)' 
                  },
                }}
              >
                Create a Account
              </Button>
            
                <Typography sx={{fontSize:"20px",mt:2,textAlign:"center",fontWeight:"100", color:"#F2F7FA"}}>OR</Typography>
                <Typography sx={{fontSize:"20px",mt:2,textAlign:"center",fontWeight:"100",color:"#F2F7FA"}}>Have an account? Please <a href='/login' style={{color:"#9b8c8c", cursor:"not-allowed"}}>Login</a></Typography>
                <Typography sx={{textAlign:"center",fontSize:"18px",mt:4,fontWeight:"100",color:"#F2F7FA"}} >Interested in exploring this application? Contact our sales team at <b>sales@innovasense.com</b></Typography>
            </form>
          </Box></Box>
  <Box sx={{ flex: 1, width: '100%',justifyContent:"flex-start",display:"flex",alignItems:"center"  }}> 
    <div className="breathe-animation">
      <p> Social Media </p>
      <p> Content Strategy</p>
    </div>
    </Box>
</Box>
     
        {/* Left: Login Form */}
       
          
       
      
      
    </Box>
  );
};

export default SignUpForm;