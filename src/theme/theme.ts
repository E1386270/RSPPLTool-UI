import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2b547e"
    },
    secondary: {
      main: "#546E7A"
    },
    background: {
      default: "#F4F6F8"
    }
  },
  typography: {
    fontFamily: "'Roboto', 'Segoe UI', sans-serif"
  }
});

export default theme;
