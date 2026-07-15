import axios from "axios";
import CONFIG from "../config/config";

export type OutputType = "PDF" | "xls";

export interface RSPPLRequest {
  outputType: OutputType;
  finishedGoodNumber: string;
  showPriceInRSPPL: boolean;
}

export const generateRSPPL = async (
  request: RSPPLRequest
): Promise<Blob> => {
  // Split finishedGoodNumber by newlines or commas, trim, and join with |
  const items = request.finishedGoodNumber
    .split(/[\n,|]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join("|");


  // Map outputType to backend expected values
  let outputParam = "pdf";
  if (request.outputType.toUpperCase() === "EXCEL") {
    outputParam = "xls";
  }

  const params = new URLSearchParams({
    item: items,
    spl: request.showPriceInRSPPL ? "1" : "0",
    output: outputParam,
  });


  // Use the backend URL from config
  const url = `${CONFIG.API_BASE_URL}/sales/rsppl/?${params.toString()}`;

  const response = await axios.get(url, { responseType: "blob" });
  return response.data;
};