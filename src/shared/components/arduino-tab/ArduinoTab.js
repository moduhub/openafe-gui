import { TextField, Box, Card, CardContent, List, ListItem } from '@mui/material'; 
import { Button, Typography } from '@mui/material'; 

import IconButton from '@mui/material/IconButton'; 
import PlayArrowIcon from '@mui/icons-material/PlayArrow'; 
import StopIcon from '@mui/icons-material/Stop'; 
import MinimizeIcon from '@mui/icons-material/Minimize'; 
import MaximizeIcon from '@mui/icons-material/Maximize';

import { useState } from "react";
import { useTheme } from "@mui/material";

import { StartReading, FinishReading } from "../../../arduino";
import { useArduinoContext } from '../../contexts'

export const ArduinoTab = () => {
  const theme = useTheme();
  const { 
    isConnected,
    isReading, handleSetIsReading  
  } = useArduinoContext();

  const [params, setParams] = useState({
    settlingTime: 1000,
    startPotential: -800,
    endPotential: 0,
    step: 100,
    scanRate: 2,
    cycles: 1,
  });

  const [name, setName] = useState("test");
  const [errors, setErrors] = useState({});
  const [isMinimized, setIsMinimized] = useState(false);

  const validateField = (field, value) => {
    if (field === "name" && !value.trim()) 
      return "Name cannot be empty.";
    if (Number.isNaN(value)) 
      return "Invalid entry.";
    return "";
  };

  const handleChange = (field) => (e) => {
    const value = field === "name" ? e.target.value : Number(e.target.value);

    setParams((prevState) => ({
      ...prevState,
      [field]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: validateField(field, value),
    }));
  };

  const handleStartReading = () => {
    const newErrors = {};
    let hasError = false;

    if (!name.trim()) {
      newErrors.name = "Name cannot be empty.";
      hasError = true;
    }

    Object.entries(params).forEach(([field, value]) => {
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if(!isReading){
      StartReading(
        "$CVW",
        params.settlingTime,
        params.startPotential,
        params.endPotential,
        params.step,
        params.scanRate,
        params.cycles,
        handleSetIsReading
      )
    }
    else console.log("Não é possível iniciar, processo em andamento")
    
  };

  return (
    <Box
      width={isMinimized ? theme.spacing(12) : theme.spacing(35)}
      height={isMinimized ? "80%" : null}
      display="flex"
      flexShrink="0"
      marginTop={isMinimized ? null : theme.spacing(2)}
      marginBottom={isMinimized ? null : theme.spacing(2)}
      transition="width 0.3s ease"
      alignItems="start"
      top={isMinimized ? theme.spacing(12) : null}
    >
      <Card sx={{ borderRadius: isMinimized ? "55px" : "16px" }}>
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            "&:last-child": isMinimized ? { paddingBottom: 1 } : null,
            padding: isMinimized ? "8px" : null,
          }}
        >
          <Box display="flex" justifyContent="end" flexDirection="row" width="100%">
            <IconButton
              aria-label="toggle"
              size="small"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
            </IconButton>
          </Box>

          {!isMinimized && (
            <>
              <List>
                <ListItem>
                  <TextField
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    size="small"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </ListItem>
                {Object.keys(params).map((field) => (
                  <ListItem key={field}>
                    <TextField
                      label={`${field
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}`}
                      value={params[field]}
                      onChange={handleChange(field)}
                      type="number"
                      size="small"
                      fullWidth
                      error={!!errors[field]}
                      helperText={errors[field]}
                    />
                  </ListItem>
                ))}
              </List>
              <Box width="100%" display="flex" justifyContent="center" gap={theme.spacing(3)}>
                <Button
                  onClick={handleStartReading}
                  variant="contained"
                  color="success"
                  size="small"
                  disabled={isReading || !isConnected} 
                  style={{ opacity: isReading ? 0.5 : 1 }}
                >
                  <PlayArrowIcon />
                </Button>
                <Button
                  onClick={FinishReading}
                  variant="contained"
                  color="error"
                  size="small"
                  disabled={!isReading} 
                  style={{ opacity: !isReading ? 0.5 : 1 }} 
                >
                  <StopIcon />
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
