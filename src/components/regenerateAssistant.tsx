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

// Styled components for modern UI
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
    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      border: 'none',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
    },
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

// Data
const platforms = [
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'twitter', name: 'X (Twitter)', icon: '🐦' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'facebook', name: 'Facebook', icon: '📘' },
];

const events = [
  { id: 'product-launch', name: 'Product Launch', icon: '🚀' },
  { id: 'brand-awareness', name: 'Brand Awareness', icon: '🎯' },
  { id: 'engagement', name: 'Engagement', icon: '💬' },
  { id: 'conversion', name: 'Conversion', icon: '💰' },
  { id: 'community', name: 'Community Building', icon: '👥' },
  { id: 'education', name: 'Educational', icon: '📚' },
];

const contentTypes = [
  { id: 'image', name: 'image', icon: <ImageIcon /> },
  { id: 'text', name: 'text', icon: <TextIcon /> },
  { id: 'video', name: 'video', icon: <VideoIcon /> },
];

interface SchedulePost {
  day: string;
  date: string;
  time: string;
  type: string;
}

interface Schedule {
  [platform: string]: SchedulePost[];
}

interface RegenerateAssistantProps {
  schedule?: Schedule;
  onRegenerate: (data: {
    platforms: string[];
    events: string[];
    contentType: string;
    command: string;
    selectedPosts?: SchedulePost[];
  }) => void;
}

const RegenerateAssistant: React.FC<RegenerateAssistantProps> = ({ schedule, onRegenerate }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [command, setCommand] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<SchedulePost[]>([]);

  const handlePlatformToggle = (platformId: string) => {
    // Toggle selection - if already selected, unselect it
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms([]);
      setSelectedPosts([]);
      setSelectedContentType('');
    } else {
      // Single selection - replace current selection with new one
      setSelectedPlatforms([platformId]);
      setSelectedPosts([]);
      setSelectedContentType('');
    }
  };

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedPlatforms.length ||  !command.trim() || selectedPosts.length === 0) {
      return;
    }

    setIsTyping(true);
    
    // Simulate processing time
    setTimeout(() => {
      onRegenerate({
        platforms: selectedPlatforms,
        events: [], // Empty array since events selection was removed
        contentType: selectedContentType,
        command: command,
        selectedPosts: selectedPosts,
      });
      setIsTyping(false);
      setCommand('');
    }, 1500);
  };

  const canSubmit = selectedPlatforms.length > 0 && 
                   command.trim().length > 0 &&
                   selectedPosts.length > 0;

  // Get available platforms from schedule
  const availablePlatforms = schedule ? Object.keys(schedule).filter(platform => 
    schedule[platform] && schedule[platform].length > 0
  ) : [];

  // Get platform display data
  const getPlatformDisplayData = (platformId: string) => {
    const platformMap: { [key: string]: { name: string; icon: string } } = {
      'LinkedIn': { name: 'LinkedIn', icon: '💼' },
      'Instagram': { name: 'Instagram', icon: '📸' },
      'X': { name: 'X (Twitter)', icon: '🐦' },
      'TikTok': { name: 'TikTok', icon: '🎵' },
      'Facebook': { name: 'Facebook', icon: '📘' },
    };
    return platformMap[platformId] || { name: platformId, icon: '📱' };
  };

  // Get available content types based on selected posts
  const getAvailableContentTypes = () => {
    console.log("selectedPosts",selectedPosts)
    if (selectedPosts.length === 0) return [];
    
    const uniqueTypes = Array.from(new Set(selectedPosts.map(post => post.type)));
    
    if (uniqueTypes.length > 1) {
      // Multiple different types - only enable text
      return contentTypes.filter(type => type.id === 'text');
    } else {
      // Same type - enable that type + text
      const sameType = uniqueTypes[0];
      return contentTypes.filter(type => 
        type.id === sameType || type.id === 'text'
      );
    }
  };
  

  return (
    <Box sx={{ position: 'fixed', top: '14px', right: '24px', zIndex: 1000,left:0,margin:"auto",display:"inline-table" }}>
      <Fade in={true} timeout={1000}>
        <GlassCard sx={{ maxWidth: '400px', minWidth: '350px' }}>
          {/* Header */}
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
                Post Regeneration
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Regenerate any media
              </Typography>
            </Box>
            <IconButton
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{ color: 'white' }}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={isExpanded}>
            <Box sx={{ mt: 2 }}>
              {/* Platforms Selection */}
              <Typography variant="subtitle2" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                Select Platforms
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 3 }}>
                {availablePlatforms.map((platformId) => {
                  const platformData = getPlatformDisplayData(platformId);
                  const postCount = schedule?.[platformId]?.length || 0;

                  const platformPosts = schedule?.[platformId] || [];
                  console.log("schedule?.[platformId]?",schedule?.[platformId])
                  const hasValidUrl = platformPosts.some((post) =>
    (post as any)?.url && (post as any).url.trim() !== ""
  );
  const isDisabled = !hasValidUrl;

                  return (
                    <Zoom in={true} key={platformId} timeout={200 + availablePlatforms.indexOf(platformId) * 100}>
                      <PlatformChip
                        label={`${platformData.icon} ${platformData.name} (${postCount})`}
                        selected={selectedPlatforms.includes(platformId)}
                        onClick={() => 
                          // handlePlatformToggle(platformId)
                         { if (!isDisabled) handlePlatformToggle(platformId);}
                        }
                        disabled={isDisabled}
                        size="small"
                      />
                    </Zoom>
                  );
                })}


                
              </Box>

              {/* Selected Platform Posts */}
              {selectedPlatforms.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                    Select Dates
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {selectedPlatforms.map((platformId) => {
                      const platformPosts = schedule?.[platformId] || [];
                      const platformData = getPlatformDisplayData(platformId);
                      
                      return (
                        <Box key={platformId} sx={{ mb: 2 }}>
                          {/* <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1, fontWeight: 500 }}>
                            {platformData.icon} {platformData.name}
                          </Typography> */}
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {platformPosts.map((post, index) => {
                              const isSelected = selectedPosts.some(p => 
                                p.day === post.day && p.date === post.date && p.time === post.time
                              );
                              
                              return (
                                <PlatformChip
                                  key={`${platformId}-${index}`}
                                  label={`${post.day}, ${post.date} at ${post.time} (${post.type})`}
                                  selected={isSelected}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedPosts([]);
                                    } else {
                                      setSelectedPosts([post]);
                                    }
                                  }}
                                  size="small"
                                />
                              );
                            })}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </>
              )}

            

              {/* Content Type Selection */}
              <Typography variant="subtitle2" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                Select Type
              </Typography>
              {selectedPosts.length > 0 && (
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2, display: 'block' }}>
                  {(() => {
                    const uniqueTypes = Array.from(new Set(selectedPosts.map(post => post.type)));
                    if (uniqueTypes.length > 1) {
                      return `📝 Mixed content types detected - only Text regeneration available`;
                    } else {
                      return `✅ Same content type (${uniqueTypes[0]}) - you can regenerate as ${uniqueTypes[0]} or Text`;
                    }
                  })()}
                </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
                {getAvailableContentTypes().map((type) => (
                  <Zoom in={true} key={type.id} timeout={200 + contentTypes.indexOf(type) * 100}>
                    <ContentTypeButton
                      selected={selectedContentType === type.id}
                      onClick={() => setSelectedContentType(type.id)}
                      startIcon={type.icon}
                      variant="outlined"
                      size="small"
                    >
                      {type.name}
                    </ContentTypeButton>
                  </Zoom>
                ))}
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
                  disabled={!canSubmit || isTyping}
                  sx={{
                    opacity: canSubmit ? 1 : 0.5,
                    transform: isTyping ? 'rotate(360deg)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isTyping ? <RefreshIcon /> : <SendIcon />}
                </SendButton>
              </Box>

              {/* Status Message */}
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