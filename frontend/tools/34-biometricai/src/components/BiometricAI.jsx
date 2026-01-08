import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Fab,
  Snackbar
} from '@mui/material';
import {
  CameraAlt,
  Mic,
  Keyboard,
  Mouse,
  Security,
  CheckCircle,
  Error,
  Warning,
  Fingerprint,
  Face,
  RecordVoiceOver,
  Settings,
  History,
  Shield,
  Lock,
  VerifiedUser,
  Cancel,
  Refresh,
  Wifi,
  WifiOff,
  LiveTv,
  Analytics,
  Notifications,
  Speed
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from 'axios';
import io from 'socket.io-client';

// Create dark theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff88',
    },
    secondary: {
      main: '#ff4081',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4034';

function BiometricAI() {
  const navigate = useNavigate();
  // State management
  const [authStatus, setAuthStatus] = useState('idle'); // idle, authenticating, success, failed
  const [confidence, setConfidence] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [currentMethod, setCurrentMethod] = useState('');
  const [results, setResults] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [enrollmentMode, setEnrollmentMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Real-time features
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [realTimeData, setRealTimeData] = useState({
    faceConfidence: 0,
    voiceConfidence: 0,
    behavioralConfidence: 0,
    liveAnalysis: false,
    processingTime: 0
  });
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 0,
    latency: 0,
    processingTime: 0
  });

  // Media refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const animationFrameRef = useRef(null);

  // Biometric data
  const [biometricData, setBiometricData] = useState({
    face: null,
    voice: null,
    behavioral: {
      typing: [],
      mouse: [],
      device: null
    }
  });

  // Settings
  const [settings, setSettings] = useState({
    faceEnabled: true,
    voiceEnabled: true,
    behavioralEnabled: true,
    realTimeAnalysis: true,
    riskThreshold: 70,
    autoLock: true,
    liveAlerts: true,
    performanceMonitoring: true
  });

  // Authentication history
  const [authHistory, setAuthHistory] = useState([]);

  useEffect(() => {
    initializeCamera();
    initializeBehavioralTracking();
    initializeWebSocket();
    loadSettings();
    loadAuthHistory();

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const initializeWebSocket = () => {
    const newSocket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to BiometricAI server');
      setIsConnected(true);
      addAlert('Real-time connection established', 'success');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from BiometricAI server');
      setIsConnected(false);
      addAlert('Real-time connection lost', 'warning');
    });

    newSocket.on('auth_progress', (data) => {
      setRealTimeData(prev => ({
        ...prev,
        ...data,
        liveAnalysis: true
      }));
    });

    newSocket.on('auth_result', (data) => {
      setResults(data.methods || {});
      setConfidence(data.confidence || 0);
      setRiskScore(data.risk_score || 0);
      setAuthStatus(data.success ? 'success' : 'failed');
      setRealTimeData(prev => ({ ...prev, liveAnalysis: false }));
    });

    newSocket.on('alert', (alert) => {
      addLiveAlert(alert.message, alert.severity);
    });

    newSocket.on('performance', (metrics) => {
      setPerformanceMetrics(metrics);
    });

    setSocket(newSocket);
  };

  const addLiveAlert = (message, severity = 'info') => {
    const alert = {
      id: Date.now(),
      message,
      severity,
      timestamp: new Date().toISOString(),
      live: true
    };
    setLiveAlerts(prev => [alert, ...prev.slice(0, 2)]); // Keep last 3 live alerts

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setLiveAlerts(prev => prev.filter(a => a.id !== alert.id));
    }, 5000);
  };

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        if (settings.realTimeAnalysis && isConnected) {
          startRealTimeAnalysis();
        }
      }
    } catch (error) {
      console.error('Camera initialization failed:', error);
      addAlert('Camera access denied. Please enable camera permissions.', 'warning');
    }
  };

  const startRealTimeAnalysis = () => {
    if (!videoRef.current || !canvasRef.current || !socket) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    let frameCount = 0;
    let lastTime = Date.now();

    const analyzeFrame = () => {
      if (!settings.realTimeAnalysis || !isConnected) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Send frame for real-time analysis
      socket.emit('analyze_frame', {
        image: imageData.split(',')[1],
        timestamp: Date.now()
      });

      // Calculate FPS
      frameCount++;
      const currentTime = Date.now();
      if (currentTime - lastTime >= 1000) {
        setPerformanceMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime))
        }));
        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(analyzeFrame);
    };

    analyzeFrame();
  };

  const stopRealTimeAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const initializeBehavioralTracking = () => {
    // Typing pattern tracking
    const handleKeyDown = (e) => {
      const typingEvent = {
        key: e.key,
        downTime: Date.now(),
        code: e.code
      };
      setBiometricData(prev => ({
        ...prev,
        behavioral: {
          ...prev.behavioral,
          typing: [...prev.behavioral.typing.slice(-50), typingEvent] // Keep last 50 keystrokes
        }
      }));
    };

    // Mouse movement tracking
    const handleMouseMove = (e) => {
      const mouseEvent = {
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      };
      setBiometricData(prev => ({
        ...prev,
        behavioral: {
          ...prev.behavioral,
          mouse: [...prev.behavioral.mouse.slice(-100), mouseEvent] // Keep last 100 movements
        }
      }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);

    // Device fingerprinting
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack
    };

    setBiometricData(prev => ({
      ...prev,
      behavioral: {
        ...prev.behavioral,
        device: deviceInfo
      }
    }));

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('biometricai_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = () => {
    localStorage.setItem('biometricai_settings', JSON.stringify(settings));
  };

  const loadAuthHistory = () => {
    const history = localStorage.getItem('biometricai_history');
    if (history) {
      setAuthHistory(JSON.parse(history));
    }
  };

  const saveAuthHistory = (result) => {
    const newEntry = {
      timestamp: new Date().toISOString(),
      success: result.success,
      confidence: result.confidence,
      riskScore: result.risk_score,
      methods: Object.keys(result.methods || {})
    };
    const updatedHistory = [newEntry, ...authHistory.slice(0, 49)]; // Keep last 50 entries
    setAuthHistory(updatedHistory);
    localStorage.setItem('biometricai_history', JSON.stringify(updatedHistory));
  };

  const addAlert = (message, severity = 'info') => {
    const alert = {
      id: Date.now(),
      message,
      severity,
      timestamp: new Date().toISOString()
    };
    setAlerts(prev => [alert, ...prev.slice(0, 4)]); // Keep last 5 alerts
  };

  const captureFace = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setBiometricData(prev => ({
      ...prev,
      face: { image: imageData.split(',')[1] } // Remove data:image/jpeg;base64, prefix
    }));

    addAlert('Face captured successfully', 'success');
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result.split(',')[1];
          setBiometricData(prev => ({
            ...prev,
            voice: { audio: base64Audio }
          }));
          addAlert('Voice recorded successfully', 'success');
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setCurrentMethod('voice');

      // Auto-stop after 3 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 3000);

    } catch (error) {
      console.error('Voice recording failed:', error);
      addAlert('Voice recording failed. Please check microphone permissions.', 'error');
    }
  };

  const authenticate = async () => {
    setAuthStatus('authenticating');
    setCurrentMethod('processing');

    try {
      const payload = {
        userId: 'current_user', // In production, get from auth context
        biometricData: biometricData,
        realTime: isConnected && settings.realTimeAnalysis
      };

      if (isConnected && settings.realTimeAnalysis) {
        // Use WebSocket for real-time authentication
        socket.emit('authenticate', payload);
        addAlert('Real-time authentication started', 'info');
      } else {
        // Fallback to HTTP request
        const response = await axios.post(`${API_BASE_URL}/authenticate`, payload);

        const result = response.data;
        setResults(result.methods || {});
        setConfidence(result.confidence || 0);
        setRiskScore(result.risk_score || 0);

        if (result.success) {
          setAuthStatus('success');
          addAlert('Authentication successful!', 'success');
        } else {
          setAuthStatus('failed');
          addAlert('Authentication failed. Please try again.', 'error');
        }

        saveAuthHistory(result);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthStatus('failed');
      addAlert('Authentication service unavailable. Please try again later.', 'error');
    }
  };

  const enrollBiometrics = async () => {
    // Enrollment logic would go here
    addAlert('Biometric enrollment completed successfully', 'success');
    setEnrollmentMode(false);
  };

  const resetAuthentication = () => {
    setAuthStatus('idle');
    setConfidence(0);
    setRiskScore(0);
    setResults({});
    setCurrentMethod('');
    setBiometricData({
      face: null,
      voice: null,
      behavioral: {
        typing: [],
        mouse: [],
        device: biometricData.behavioral.device
      }
    });
  };

  const getRiskColor = (score) => {
    if (score < 30) return 'success';
    if (score < 70) return 'warning';
    return 'error';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.8) return 'success';
    if (confidence > 0.6) return 'warning';
    return 'error';
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            <Shield sx={{ mr: 2, fontSize: '2.5rem' }} />
            BiometricAI
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Advanced Multi-Modal Biometric Authentication
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/maula/ai')}
            sx={{
              mt: 2,
              background: 'linear-gradient(45deg, #00ff88 30%, #00cc6a 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #00cc6a 30%, #00ff88 90%)',
              },
            }}
            startIcon={<Analytics />}
          >
            AI Assistant
          </Button>
        </Box>

        {/* Status Alerts */}
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            severity={alert.severity}
            sx={{ mb: 2 }}
            onClose={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
          >
            {alert.message}
          </Alert>
        ))}

        {/* Real-time Status */}
        <Paper elevation={3} sx={{ p: 2, mb: 3, background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isConnected ? (
                <Wifi sx={{ mr: 1, color: 'success.main' }} />
              ) : (
                <WifiOff sx={{ mr: 1, color: 'error.main' }} />
              )}
              <Typography variant="h6">
                Real-time Status: {isConnected ? 'Connected' : 'Disconnected'}
              </Typography>
            </Box>

            {settings.performanceMonitoring && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip
                  icon={<Speed />}
                  label={`${performanceMetrics.fps} FPS`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<Analytics />}
                  label={`${performanceMetrics.latency}ms`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Box>
            )}
          </Box>

          {/* Live Alerts */}
          {liveAlerts.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                <Notifications sx={{ mr: 1, fontSize: '1rem' }} />
                Live Alerts
              </Typography>
              {liveAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  severity={alert.severity}
                  size="small"
                  sx={{ mb: 1 }}
                  icon={<LiveTv />}
                >
                  {alert.message}
                </Alert>
              ))}
            </Box>
          )}
        </Paper>

        {/* Authentication Status */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
              <Security sx={{ mr: 1 }} />
              Authentication Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Settings">
                <IconButton onClick={() => setSettingsOpen(true)} color="primary">
                  <Settings />
                </IconButton>
              </Tooltip>
              <Tooltip title="History">
                <IconButton onClick={() => setHistoryOpen(true)} color="primary">
                  <History />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ background: authStatus === 'success' ? '#00ff88' : authStatus === 'failed' ? '#ff4081' : '#333' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  {authStatus === 'authenticating' ? (
                    <CircularProgress size={60} sx={{ color: 'white' }} />
                  ) : authStatus === 'success' ? (
                    <CheckCircle sx={{ fontSize: 60, color: 'black' }} />
                  ) : authStatus === 'failed' ? (
                    <Error sx={{ fontSize: 60, color: 'white' }} />
                  ) : (
                    <Lock sx={{ fontSize: 60, color: 'white' }} />
                  )}
                  <Typography variant="h6" sx={{ mt: 1, color: authStatus === 'success' ? 'black' : 'white' }}>
                    {authStatus === 'authenticating' ? 'Authenticating...' :
                     authStatus === 'success' ? 'Authenticated' :
                     authStatus === 'failed' ? 'Failed' : 'Ready'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">Confidence</Typography>
                  <Typography variant="h3" sx={{ color: theme.palette[getConfidenceColor(confidence)].main }}>
                    {Math.round(confidence * 100)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={confidence * 100}
                    color={getConfidenceColor(confidence)}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="secondary">Risk Score</Typography>
                  <Typography variant="h3" sx={{ color: theme.palette[getRiskColor(riskScore)].main }}>
                    {Math.round(riskScore)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={riskScore}
                    color={getRiskColor(riskScore)}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Biometric Methods */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Face Recognition */}
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Face sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Face Recognition</Typography>
                  {biometricData.face && <CheckCircle sx={{ ml: 'auto', color: 'success.main' }} />}
                </Box>

                <Box sx={{ position: 'relative', mb: 2 }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      background: '#000',
                      border: realTimeData.liveAnalysis ? '2px solid #00ff88' : '2px solid transparent'
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  {currentMethod === 'face' && (
                    <CircularProgress
                      size={40}
                      sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                    />
                  )}
                  {realTimeData.liveAnalysis && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <Chip
                        label={`${Math.round(realTimeData.faceConfidence * 100)}%`}
                        size="small"
                        color={realTimeData.faceConfidence > 0.8 ? 'success' : realTimeData.faceConfidence > 0.6 ? 'warning' : 'error'}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  )}
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CameraAlt />}
                  onClick={captureFace}
                  disabled={!settings.faceEnabled || authStatus === 'authenticating'}
                >
                  Capture Face
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Voice Recognition */}
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RecordVoiceOver sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Voice Recognition</Typography>
                  {biometricData.voice && <CheckCircle sx={{ ml: 'auto', color: 'success.main' }} />}
                </Box>

                <Box sx={{
                  height: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #555',
                  borderRadius: '8px',
                  mb: 2
                }}>
                  {currentMethod === 'voice' ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress size={40} sx={{ mb: 1 }} />
                      <Typography>Recording...</Typography>
                    </Box>
                  ) : (
                    <Mic sx={{ fontSize: 60, color: 'text.secondary' }} />
                  )}
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Mic />}
                  onClick={startVoiceRecording}
                  disabled={!settings.voiceEnabled || authStatus === 'authenticating'}
                >
                  Record Voice
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Behavioral Biometrics */}
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Keyboard sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Behavioral Analysis</Typography>
                  {(biometricData.behavioral.typing.length > 0 || biometricData.behavioral.mouse.length > 0) &&
                    <CheckCircle sx={{ ml: 'auto', color: 'success.main' }} />}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Keystrokes: {biometricData.behavioral.typing.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Mouse movements: {biometricData.behavioral.mouse.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Device: {biometricData.behavioral.device ? 'Detected' : 'Not detected'}
                  </Typography>
                </Box>

                <Chip
                  label="Auto-capturing"
                  color="success"
                  variant="outlined"
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<VerifiedUser />}
            onClick={authenticate}
            disabled={authStatus === 'authenticating' || (!biometricData.face && !biometricData.voice)}
            sx={{ minWidth: 200 }}
          >
            {authStatus === 'authenticating' ? 'Authenticating...' : 'Authenticate'}
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<Refresh />}
            onClick={resetAuthentication}
            disabled={authStatus === 'authenticating'}
          >
            Reset
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<Fingerprint />}
            onClick={() => setEnrollmentMode(true)}
            color="secondary"
          >
            Enroll Biometrics
          </Button>
        </Box>

        {/* Floating Action Button for Real-time Control */}
        <Fab
          color={realTimeData.liveAnalysis ? 'secondary' : 'primary'}
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => {
            if (realTimeData.liveAnalysis) {
              stopRealTimeAnalysis();
              setRealTimeData(prev => ({ ...prev, liveAnalysis: false }));
            } else if (isConnected) {
              startRealTimeAnalysis();
            }
          }}
          disabled={!isConnected}
        >
          {realTimeData.liveAnalysis ? <LiveTv /> : <Analytics />}
        </Fab>

        {/* Results Display */}
        {Object.keys(results).length > 0 && (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Shield sx={{ mr: 1 }} />
              Authentication Results
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(results).map(([method, result]) => (
                <Grid item xs={12} md={4} key={method}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                        {method} Authentication
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {result.success ? (
                          <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                        ) : (
                          <Cancel sx={{ color: 'error.main', mr: 1 }} />
                        )}
                        <Typography variant="body2">
                          Confidence: {Math.round(result.confidence * 100)}%
                        </Typography>
                      </Box>
                      {result.spoofing_detected && (
                        <Chip label="Spoofing Detected" color="error" size="small" sx={{ mt: 1 }} />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>BiometricAI Settings</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>Authentication Methods</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.faceEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, faceEnabled: e.target.checked }))}
                  />
                }
                label="Face Recognition"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.voiceEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, voiceEnabled: e.target.checked }))}
                  />
                }
                label="Voice Recognition"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.behavioralEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, behavioralEnabled: e.target.checked }))}
                  />
                }
                label="Behavioral Biometrics"
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Security Settings</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.realTimeAnalysis}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setSettings(prev => ({ ...prev, realTimeAnalysis: enabled }));
                      if (enabled && isConnected) {
                        startRealTimeAnalysis();
                      } else {
                        stopRealTimeAnalysis();
                      }
                    }}
                  />
                }
                label="Real-time Analysis"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.liveAlerts}
                    onChange={(e) => setSettings(prev => ({ ...prev, liveAlerts: e.target.checked }))}
                  />
                }
                label="Live Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.performanceMonitoring}
                    onChange={(e) => setSettings(prev => ({ ...prev, performanceMonitoring: e.target.checked }))}
                  />
                }
                label="Performance Monitoring"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoLock}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoLock: e.target.checked }))}
                  />
                }
                label="Auto-lock on High Risk"
              />

              <TextField
                fullWidth
                label="Risk Threshold"
                type="number"
                value={settings.riskThreshold}
                onChange={(e) => setSettings(prev => ({ ...prev, riskThreshold: parseInt(e.target.value) }))}
                inputProps={{ min: 0, max: 100 }}
                sx={{ mt: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={() => { saveSettings(); setSettingsOpen(false); }} variant="contained">
              Save Settings
            </Button>
          </DialogActions>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Authentication History</DialogTitle>
          <DialogContent>
            <List>
              {authHistory.map((entry, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    {entry.success ? (
                      <CheckCircle sx={{ color: 'success.main' }} />
                    ) : (
                      <Error sx={{ color: 'error.main' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${entry.success ? 'Success' : 'Failed'} - ${new Date(entry.timestamp).toLocaleString()}`}
                    secondary={`Confidence: ${Math.round(entry.confidence * 100)}% | Risk: ${entry.riskScore} | Methods: ${entry.methods.join(', ')}`}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHistoryOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Enrollment Dialog */}
        <Dialog open={enrollmentMode} onClose={() => setEnrollmentMode(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Enroll Biometrics</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Follow the steps below to enroll your biometric data for enhanced security.
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="1. Position your face in the camera and click 'Capture Face'" />
              </ListItem>
              <ListItem>
                <ListItemText primary="2. Click 'Record Voice' and speak clearly for 3 seconds" />
              </ListItem>
              <ListItem>
                <ListItemText primary="3. Type naturally on the keyboard and move your mouse to capture behavioral patterns" />
              </ListItem>
              <ListItem>
                <ListItemText primary="4. Click 'Enroll' to save your biometric profile" />
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEnrollmentMode(false)}>Cancel</Button>
            <Button onClick={enrollBiometrics} variant="contained">
              Enroll
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default BiometricAI;