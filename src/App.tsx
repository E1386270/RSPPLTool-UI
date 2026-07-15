import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme";
import RSPPLTool from "./components/RSPPLTool";

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <RSPPLTool />
  </ThemeProvider>
);

export default App;
