import React, { useState } from 'react';
import { 
    Box, 
    Button, 
    TextField, 
    Typography, 
    CircularProgress, 
    Alert,
    FormControlLabel,
    Checkbox,
    Switch,
    Card,
    CardContent,
    Grid,
    FormGroup,
    Divider
} from '@mui/material';
import LocatorList from './components/LocatorList';
import Header from './components/Header';
import { generateLocatorsForApp, testBackendConnection } from './api';
import './styles.css';

const App = () => {
    const [url, setUrl] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [locators, setLocators] = useState([]);
    const [pageGroups, setPageGroups] = useState([]);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState(null);
    
    // New state for the requested features
    const [singlePageMode, setSinglePageMode] = useState(false);
    const [locatorFilters, setLocatorFilters] = useState({
        input: true,
        button: true,
        link: true,
        select: true,
        textarea: true,
        checkbox: true,
        radio: true,
        form: true
    });

    const handleFilterChange = (filterName) => {
        setLocatorFilters(prev => ({
            ...prev,
            [filterName]: !prev[filterName]
        }));
    };    const clearResults = () => {
        setLocators([]);
        setPageGroups([]);
        setSummary(null);
        setError(null);
        setConnectionStatus(null);
    };

    const testConnection = async () => {
        setIsTestingConnection(true);
        setConnectionStatus(null);
        
        const result = await testBackendConnection();
        
        if (result.success) {
            setConnectionStatus({ type: 'success', message: 'Backend connection successful!' });
        } else {
            setConnectionStatus({ type: 'error', message: result.error });
        }
        
        setIsTestingConnection(false);
    };    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        
        const payload = {
            url,
            username,
            password,
            singlePageMode,
            locatorFilters
        };
        
        const result = await generateLocatorsForApp(payload); // Use real endpoint
        setIsLoading(false);

        if (result.success) {
            setLocators(result.data || []);
            setPageGroups(result.pageGroups || []);
            setSummary(result.summary || null);
        } else {
            setError(result.error);
            console.error(result.error);
        }
    };return (
        <Box>
            <Header />
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>
                    Locator Genie
                </Typography>
                
                {/* URL Input Section */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            🌐 URL Configuration
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField 
                                label="Application URL" 
                                value={url} 
                                onChange={(e) => setUrl(e.target.value)} 
                                fullWidth 
                                placeholder="https://example.com"
                            />
                            <TextField 
                                label="Username (optional)" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                            />
                            <TextField 
                                label="Password (optional)" 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                        </Box>
                        
                        {/* Single Page Mode Toggle */}                        <FormControlLabel
                            control={
                                <Switch
                                    checked={singlePageMode}
                                    onChange={(e) => setSinglePageMode(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Single Page Mode (Extract locators from specified URL only, no multi-page traversal)"
                            sx={{ mb: 1 }}
                        />
                        
                        {/* Processing time info */}
                        <Alert severity="info" sx={{ mb: 2, fontSize: '0.85rem' }}>
                            <strong>Processing Times:</strong>
                            <br />
                            • Single Page Mode: ~2-5 minutes
                            <br />
                            • Multi-Page Mode: ~10-20 minutes (depending on site complexity)
                        </Alert>
                    </CardContent>
                </Card>

                {/* Locator Type Filters */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            🔍 Locator Type Filters
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Select which types of elements you want to extract locators for:
                        </Typography>
                        <FormGroup>
                            <Grid container spacing={1}>
                                <Grid item xs={6} md={3}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={locatorFilters.input}
                                                onChange={() => handleFilterChange('input')}
                                            />
                                        }
                                        label="Input Fields"
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={locatorFilters.button}
                                                onChange={() => handleFilterChange('button')}
                                            />
                                        }
                                        label="Buttons"
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={locatorFilters.link}
                                                onChange={() => handleFilterChange('link')}
                                            />
                                        }
                                        label="Links"
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={locatorFilters.select}
                                                onChange={() => handleFilterChange('select')}
                                            />
                                        }
                                        label="Select/Dropdown"
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={locatorFilters.textarea}
                                                onChange={() => handleFilterChange('textarea')}
                                            />
                                        }
                                        label="Text Areas"
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={locatorFilters.checkbox}
                                                onChange={() => handleFilterChange('checkbox')}
                                            />
                                        }
                                        label="Checkboxes"
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={locatorFilters.radio}
                                                onChange={() => handleFilterChange('radio')}
                                            />
                                        }
                                        label="Radio Buttons"
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={locatorFilters.form}
                                                onChange={() => handleFilterChange('form')}
                                            />
                                        }
                                        label="Forms"
                                    />
                                </Grid>
                            </Grid>
                        </FormGroup>
                    </CardContent>
                </Card>                {/* Action Buttons */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleSubmit} 
                        disabled={isLoading || !url.trim() || isTestingConnection}
                        sx={{ flex: 1 }}
                    >
                        {isLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={20} />
                                <span>
                                    {singlePageMode 
                                        ? 'Processing...' 
                                        : 'Processing (may take up to 10 minutes)...'
                                    }
                                </span>
                            </Box>
                        ) : 'Generate Locators'}
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="info" 
                        onClick={testConnection}
                        disabled={isLoading || isTestingConnection}
                    >
                        {isTestingConnection ? <CircularProgress size={20} /> : 'Test Backend'}
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="secondary" 
                        onClick={clearResults}
                        disabled={isLoading || isTestingConnection}
                    >
                        Clear Results
                    </Button>
                </Box>
                
                {/* Connection Status */}
                {connectionStatus && (
                    <Alert 
                        severity={connectionStatus.type} 
                        sx={{ mb: 3 }}
                        onClose={() => setConnectionStatus(null)}
                    >
                        {connectionStatus.message}
                    </Alert>
                )}
                
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}<LocatorList 
                    locators={locators} 
                    pageGroups={pageGroups} 
                    summary={summary} 
                />
            </Box>
        </Box>
    );
};

export default App;