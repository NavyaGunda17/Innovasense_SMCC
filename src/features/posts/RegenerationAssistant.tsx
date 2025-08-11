import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  Button,
  Avatar,
  Paper,
  IconButton,
  Collapse,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Send as SendIcon,
  Image as ImageIcon,
  TextFields as TextIcon,
  Videocam as VideoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SmartToy as AssistantIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';


// Styled components
const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(16px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  padding: '24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.45)',
    transform: 'translateY(-2px)',
  },
}));

const PlatformChip = styled(Chip)<{ selected?: boolean }>(({ selected }) => ({
  background: selected
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  border: selected ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  padding: '8px 16px',
  margin: '4px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: selected
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'rgba(255, 255, 255, 0.15)',
    transform: 'scale(1.05)',
  },
}));

const ContentTypeButton = styled(Button)<{ selected?: boolean }>(({ selected }) => ({
  background: selected
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'rgba(255, 255, 255, 0.08)',
  color: 'white',
  border: selected ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  padding: '12px 20px',
  margin: '8px',
  minWidth: '120px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: selected
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'rgba(255, 255, 255, 0.12)',
    transform: 'translateY(-2px)',
  },
}));

const CommandInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    '& fieldset': { border: 'none' },
    '&:hover fieldset': { border: 'none' },
    '&.Mui-focused fieldset': { border: 'none' },
    '& .MuiInputBase-input': {
      color: 'white',
      '&::placeholder': {
        color: 'rgba(255, 255, 255, 0.6)',
        opacity: 1,
      },
    },
  },
}));

const SendButton = styled(IconButton)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '50%',
  width: '48px',
  height: '48px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
    transform: 'scale(1.1)',
  },
}));

const contentTypes = [
  { id: 'image', name: 'Image', icon: <ImageIcon /> },
  { id: 'text', name: 'Text', icon: <TextIcon /> },
  { id: 'video', name: 'Video', icon: <VideoIcon /> },
];

interface RegenerateAssistantProps {
  schedule: any;
  onRegenerate: (data: {
    platforms: string[];
    events: string[];
    contentType: string;
    command: string;
    selectedPosts?: any[];
  }) => void;
}
const platformIconMap: Record<string, string> = {
  linkedin: '💼',
  instagram: '📸',
  twitter: '🐦',
  x: '🐦',
  facebook: '📘',
  tiktok: '🎵',
};


const RegenerateAssistant: React.FC<RegenerateAssistantProps> = ({ schedule, onRegenerate }) => {
  console.log("RegenerateAssistantProps",schedule)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableContentTypes, setAvailableContentTypes] = useState<string[]>(['text']); // default only text
    const [selectedPostIndex, setSelectedPostIndex] = useState<any>(); // default only text


  const [command, setCommand] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const availablePlatforms = Object.keys(schedule);

  const platformDateMap: Record<string, string[]> = {};
  availablePlatforms.forEach((platform) => {
    const postDates:any = (schedule[platform]?.["Post Schedule"] || []).map((p: any) => ({
  date: p.date,
  index: p.index,
}));
    console.log("platformDateMap",platformDateMap)
   platformDateMap[platform] = Array.from(new Set(postDates));

  });

const handleDateClick = (platform: string, date: string, postIndex:any) => {
  setSelectedDate(date);

  const postSchedule = schedule[platform]?.["Post Schedule"] || [];
  const postForDate = postSchedule.find((post: any) => post.date === date);
setSelectedContentType('')
  if (postForDate?.mediaType === 'image') {
    setAvailableContentTypes(['image', 'text']);
  } else if (postForDate?.mediaType === 'video') {
    setAvailableContentTypes(['video', 'text']);
  } else {
    setAvailableContentTypes(['text']);
  }
  setSelectedPostIndex(postIndex)
};



  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [platformId] // only one platform at a time for now
    );
    setSelectedContentType('')
  };






  const handleSubmit = async () => {
    if (!selectedPlatforms.length || !selectedDate  || !command.trim()) return;

    setIsTyping(true);
    setTimeout(() => {
      onRegenerate({
        platforms: selectedPlatforms,
        events: selectedEvents,
        contentType: selectedContentType,
        command: command,
        selectedPosts:selectedPostIndex
      });
      setIsTyping(false);
      setCommand('');
    }, 1500);
  };

  const canSubmit = selectedPlatforms.length > 0 && selectedEvents.length > 0 && selectedContentType && command.trim().length > 0;

  return (
    <Box sx={{ position: 'fixed', top: '30px', right: '0',left:0,margin:"auto", zIndex: 1000, display:"flex",justifyContent:"center",width:"max-content" }}>
      <Fade in={true} timeout={1000}>
        <GlassCard sx={{ maxWidth: '400px', minWidth: '350px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                mr: 2,
                width: 48,
                height: 48,
              }}
            >
              <AssistantIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                Content Regenerate
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Let’s regenerate your content
              </Typography>
            </Box>
            <IconButton onClick={() => setIsExpanded(!isExpanded)} sx={{ color: 'white' }}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={isExpanded}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                Select Platform
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 3 }}>
               {availablePlatforms.map((platform) => {
  const icon = platformIconMap[platform.toLowerCase()] || '';
  const label = `${icon} ${schedule[platform]['Platform name'] ?? platform}`;

  return (
    <Zoom in={true} key={platform}>
      <PlatformChip
        label={label}
        selected={selectedPlatforms.includes(platform)}
        onClick={() => handlePlatformToggle(platform)}
        size="medium"
      />
    </Zoom>
  );
})}

              </Box>

              {/* Show available dates */}
              {selectedPlatforms.length === 1 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                    Select Date
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                   {platformDateMap[selectedPlatforms[0]]?.map((date:any) => {
  const isSelected = selectedDate === date?.date;

  return (
    <Chip
      key={date}
      label={date?.date}
      icon={<CalendarTodayIcon sx={{ color: 'white',fill: 'white', fontSize: 18 }} />}
      onClick={() => handleDateClick(selectedPlatforms[0], date?.date, date?.index)}
      variant="outlined"
      
      sx={{
        color: 'white',
        cursor: 'pointer',
        padding:"10px",
        borderColor: isSelected ? 'transparent' : 'rgba(255, 255, 255, 0.4)',
        background: isSelected
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'transparent',
        '&:hover': {
          backgroundColor: isSelected
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'rgba(255, 255, 255, 0.1)',
          borderColor: isSelected ? 'transparent' : 'rgba(255, 255, 255, 0.4)',
        },
      }}
    />
  );
})}

                  </Box>
                </Box>
              )}

              {/* You can add event + contentType logic below as needed */}
              {/* Content Type */}
              <Typography variant="subtitle2" sx={{ color: 'white',  fontWeight: 500 }}>
                Select Type
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              {availableContentTypes.map((typeId) => {
  const type = contentTypes.find((t) => t.id === typeId);
  if (!type) return null;

  return (
    <Zoom in={true} key={type.id}>
      <ContentTypeButton
        selected={selectedContentType === type.id}
       onClick={() => {
  if (selectedContentType === type.id) {
    setSelectedContentType('');  // Deselect if clicking again
  } else {
    setSelectedContentType(type.id);
  }
}}

        startIcon={type.icon}
        variant="outlined"
        size="small"
      >
        {type.name}
      </ContentTypeButton>
    </Zoom>
  );
})}

              </Box>

              {/* Command Input */}
              <Typography variant="subtitle2" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                Your Comments
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 2 }}>
                <CommandInput
                  multiline
                  rows={3}
                  placeholder="Describe what you want to regenerate... (e.g., 'Make it more engaging with emojis', 'Change the tone to professional')"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
                <SendButton
                  onClick={handleSubmit}
                  // disabled={!canSubmit || isTyping}
                  sx={{
                    opacity: canSubmit ? 1 : 0.5,
                    transform: isTyping ? 'rotate(360deg)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isTyping ? <RefreshIcon /> : <SendIcon />}
                </SendButton>
              </Box>

              {isTyping && (
                <Fade in={isTyping}>
                  <Box sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Regenerating your content... ✨
                    </Typography>
                  </Box>
                </Fade>
              )}
            </Box>
          </Collapse>
        </GlassCard>
      </Fade>
    </Box>
  );
};

export default RegenerateAssistant;
