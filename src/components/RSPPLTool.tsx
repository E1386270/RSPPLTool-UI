import React, { useEffect, useState } from "react";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Avatar
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GridOnIcon from "@mui/icons-material/GridOn";

import logo from "../assets/logo.png";

import { generateRSPPL } from "../services/api";
import type { OutputType } from "../services/api";
import { oktaAuth } from "../oktaConfig";
import { oktaConfig } from "../config/environment";
import { clearTokens, setAccessToken, setIdToken, setUserClaims } from "../services/tokenManager";

const RSPPLTool: React.FC = () => {

  const [outputType, setOutputType] =
    useState<OutputType>("PDF");

  const [fgNumber, setFgNumber] = useState("");

  const [showPrice, setShowPrice] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [fgError, setFgError] =
    useState("");

  const [successOpen, setSuccessOpen] =
    useState(false);

  const [user, setUser] = useState({ name: "User", email: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const syncAuthState = async () => {
      try {
        const appBasePath = import.meta.env.VITE_BASE_PATH || "/";
        const isCallbackRoute =
          window.location.pathname === "/signin/callback" ||
          window.location.pathname.endsWith("/signin/callback");
        const isLogoutRoute =
          window.location.pathname === "/" &&
          window.location.search.includes("state=") &&
          window.location.search.includes("iss=");

        await oktaAuth.handleLoginRedirect();
        const state = oktaAuth.authStateManager.getAuthState();
        const claims = state?.idToken?.claims ?? state?.accessToken?.claims;

        if (state?.isAuthenticated) {
          const nextUser = {
            name:
              typeof claims?.name === "string"
                ? claims.name
                : typeof claims?.preferred_username === "string"
                  ? claims.preferred_username
                  : "User",
            email:
              typeof claims?.email === "string"
                ? claims.email
                : typeof claims?.preferred_username === "string"
                  ? claims.preferred_username
                  : "",
          };

          setUser(nextUser);
          setAccessToken(state.accessToken?.accessToken ?? null);
          setIdToken(state.idToken?.idToken ?? null);
          setUserClaims(claims as Record<string, unknown> | null);
          setIsAuthenticated(true);

          if (isCallbackRoute) {
            window.history.replaceState({}, document.title, appBasePath);
          }
        } else if (!isCallbackRoute && !isLogoutRoute) {
          await oktaAuth.signInWithRedirect();
        } else {
          clearTokens();
          setUser({ name: "User", email: "" });
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Failed to initialize Okta auth", error);
      } finally {
        setAuthLoading(false);
      }
    };

    void syncAuthState();
  }, []);

  const handleLogin = async () => {
    setAuthLoading(true);

    try {
      await oktaAuth.signInWithRedirect();
    } catch (error) {
      console.error("Failed to start Okta sign-in", error);
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      clearTokens();
      setUser({ name: "User", email: "" });
      setIsAuthenticated(false);
      await oktaAuth.signOut({ postLogoutRedirectUri: oktaConfig.postLogoutRedirectUri });
    } catch (error) {
      console.error("Failed to sign out from Okta", error);
    }
  };

  // ================= FORM SUBMIT =================

  const handleSubmit = async (): Promise<void> => {

    if (!fgNumber.trim()) {

      setFgError(
        "Finished Good Number is required"
      );

      return;

    }

    setFgError("");

    setLoading(true);

    try {

      const blob = await generateRSPPL({
        outputType,
        finishedGoodNumber: fgNumber,
        showPriceInRSPPL: showPrice
      });

      const fileName =
        outputType === "PDF"
          ? "rsppl-report.pdf"
          : "rsppl-report.xlsx";

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download = fileName;

      link.click();

      setSuccessOpen(true);

    } finally {

      setLoading(false);

    }

  };

  if (authLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f4f6f8"
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress />
          <Typography sx={{ mt: 2, color: "#2b547e" }}>
            Checking sign-in status...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f4f6f8"
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ mb: 2, fontWeight: 600 }}>
            Redirecting to Okta sign-in...
          </Typography>
          <Button variant="contained" onClick={handleLogin}>
            Sign In
          </Button>
        </Box>
      </Box>
    );
  }

  return (

    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f4f6f8"
      }}
    >

      {/* ================= APP BAR ================= */}

      <AppBar
        position="static"
        elevation={2}
      >

        <Toolbar
  sx={{
    minHeight: 64,
    display: "flex",
    justifyContent: "space-between",
    px: 3
  }}
>

  {/* LEFT SIDE — LOGO + TITLE */}

  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2
    }}
  >

    {/* LOGO */}

    <Box
      component="img"
      src={logo}
      alt="Company Logo"
      sx={{
        height: 38,
        width: "auto",
        objectFit: "contain"
      }}
    />

    {/* TITLE */}

    <Box>

      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1.2
        }}
      >

        Tescom - RSPPL Tool

      </Typography>

      <Typography
        sx={{
          fontSize: 12,
          opacity: 0.9
        }}
      >

        Generate recommended spare parts lists in PDF or Excel format

      </Typography>

    </Box>

  </Box>

  {/* RIGHT SIDE — USER INFO */}

  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2
    }}
  >

    <Avatar
      sx={{
        bgcolor: "#1976d2",
        width: 36,
        height: 36
      }}
    >

      {user.name.charAt(0)}

    </Avatar>

    <Box>

      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.1
        }}
      >

        {user.name}

      </Typography>

      <Typography
        sx={{
          fontSize: 11,
          opacity: 0.85
        }}
      >

        {user.email}

      </Typography>

    </Box>

    {isAuthenticated ? (
      <Button
        color="inherit"
        size="small"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{
          textTransform: "none",
          fontWeight: 600
        }}
      >
        Logout
      </Button>
    ) : (
      <Button
        color="inherit"
        size="small"
        onClick={handleLogin}
        disabled={authLoading}
        sx={{
          textTransform: "none",
          fontWeight: 600
        }}
      >
        {authLoading ? "Preparing..." : "Sign In"}
      </Button>
    )}

  </Box>

</Toolbar>

      </AppBar>

      {/* ================= BODY ================= */}

      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          pt: 5,
          pb: 4
        }}
      >

        <Box>

          {/* HEADER CARD */}

          <Card
            sx={{
              width: 760,
              mb: 3,
              backgroundColor:
                "rgba(43, 84, 126, 0.06)",
              border:
                "1px solid rgba(43, 84, 126, 0.12)",
              borderBottom:
                "3px solid rgba(43, 84, 126, 0.35)",
              color: "#2b547e"
            }}
          >

            <CardContent>

              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 600
                }}
              >

                Tescom Recommended Spare Parts Form

              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  opacity: 0.9
                }}
              >

                Enter finished good details and select output preferences..

              </Typography>

            </CardContent>

          </Card>

          {/* FG INPUT */}

          <Card
            sx={{
              width: 760,
              mb: 3,
              boxShadow: 3
            }}
          >

            <CardContent>

              <Typography
                sx={{
                  fontWeight: 600,
                  mb: 2
                }}
              >

                TESCOM Model Number Details

              </Typography>

              <TextField
                label="Enter TESCOM Model Number"
                multiline
                rows={3}
                fullWidth
                value={fgNumber}
                error={Boolean(fgError)}
                helperText={fgError}
                onChange={(e) => {

                  setFgNumber(e.target.value);

                  if (fgError)
                    setFgError("");

                }}
              />

            </CardContent>

          </Card>

          {/* OPTIONS */}

          <Card
            sx={{
              width: 760,
              boxShadow: 3
            }}
          >

            <CardContent>

              <Typography
                sx={{
                  fontWeight: 600,
                  mb: 2
                }}
              >

                Output Options

              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 6,
                  flexDirection: {
                    xs: "column",
                    md: "row"
                  }
                }}
              >

                {/* OUTPUT TYPE */}

                <Box sx={{ flex: 1 }}>

                  <Typography
                    sx={{
                      fontWeight: 500,
                      mb: 1
                    }}
                  >

                    Output Type

                  </Typography>

                  <RadioGroup
                    row
                    value={outputType}
                    onChange={(e) =>
                      setOutputType(
                        e.target.value as OutputType
                      )
                    }
                  >

                    <FormControlLabel
                      value="PDF"
                      control={<Radio />}
                      label="PDF"
                    />

                    <FormControlLabel
                      value="EXCEL"
                      control={<Radio />}
                      label="Excel"
                    />

                  </RadioGroup>

                </Box>

                {/* SHOW PRICE */}

                <Box sx={{ flex: 1 }}>

                  <Typography
                    sx={{
                      fontWeight: 500,
                      mb: 1
                    }}
                  >

                    Show Price in RSPPL

                  </Typography>

                  <RadioGroup
                    row
                    value={
                      showPrice ? "YES" : "NO"
                    }
                    onChange={(e) =>
                      setShowPrice(
                        e.target.value === "YES"
                      )
                    }
                  >

                    <FormControlLabel
                      value="YES"
                      control={<Radio />}
                      label="Yes"
                    />

                    <FormControlLabel
                      value="NO"
                      control={<Radio />}
                      label="No"
                    />

                  </RadioGroup>

                </Box>

              </Box>

              <Divider sx={{ my: 3 }} />

              {/* BUTTON */}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2
                }}
              >

                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    px: 5,
                    py: 1.5,
                    fontWeight: 600
                  }}
                  startIcon={
                    outputType === "PDF"
                      ? <PictureAsPdfIcon />
                      : <GridOnIcon />
                  }
                  onClick={handleSubmit}
                  disabled={loading}
                >

                  Submit

                </Button>

                {loading && (
                  <CircularProgress size={24} />
                )}

              </Box>

            </CardContent>

          </Card>

        </Box>

      </Box>

      {/* ================= FOOTER ================= */}

      <Box
        sx={{
          borderTop: "1px solid #dbe1e6",
          py: 1.5,
          px: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor:
            "rgba(43,84,126,0.05)"
        }}
      >

        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 500,
            color: "#2b547e"
          }}
        >

          © 2026 Emerson All rights reserved.

        </Typography>

        <Typography sx={{ fontSize: 12 }}>

          Support:{" "}

          <Box
            component="a"
            href="mailto:ASCOWebHelp@Emerson.com"
            sx={{
              color: "#2b547e",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": {
                textDecoration: "underline"
              }
            }}
          >

            ASCOWebHelp@Emerson.com

          </Box>

        </Typography>

      </Box>

      {/* SUCCESS MESSAGE */}

      <Snackbar
          open={successOpen}
          autoHideDuration={3000}
          onClose={() => setSuccessOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >

        <Alert
          severity="success"
          variant="filled"
        >

          Report generated successfully.

        </Alert>

      </Snackbar>

    </Box>

  );

};

export default RSPPLTool;