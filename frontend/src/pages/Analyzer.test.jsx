import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Analyzer from "./Analyzer";

vi.mock("../api", () => ({ api: { analyze: vi.fn(), saveScan: vi.fn() } }));
import { api } from "../api";

describe("Analyzer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("validates empty and short text before calling the API", async () => {
    render(<Analyzer />);
    fireEvent.click(screen.getByRole("button", { name: /analyze text/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/paste a job description/i);
    fireEvent.change(screen.getByLabelText(/job description or message/i), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /analyze text/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 30 characters/i);
    expect(api.analyze).not.toHaveBeenCalled();
  });

  it("shows API errors and keeps the input available", async () => {
    api.analyze.mockRejectedValue(new Error("Backend unavailable"));
    render(<Analyzer />);
    const text = "A product engineering internship with a detailed description and application process.";
    fireEvent.change(screen.getByLabelText(/job description or message/i), { target: { value: text } });
    fireEvent.click(screen.getByRole("button", { name: /analyze text/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Backend unavailable");
    expect(screen.getByLabelText(/job description or message/i)).toHaveValue(text);
  });

  it("renders results and supports explicitly saving a scan", async () => {
    const result = { riskScore: 44, riskLevel: "Medium", modelVersion: "rules-baseline-v1", indicators: [{ code: "UPFRONT_FEE", title: "Upfront fee", explanation: "The text requests payment before employment." }], recommendations: ["Verify independently."], disclaimer: "Estimate only." };
    api.analyze.mockResolvedValue(result);
    api.saveScan.mockResolvedValue(result);
    render(<Analyzer />);
    fireEvent.change(screen.getByLabelText(/job description or message/i), { target: { value: "A sufficiently long job description for a product engineering internship." } });
    fireEvent.click(screen.getByRole("button", { name: /analyze text/i }));
    expect(await screen.findByText("Upfront fee")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Risk score 44 out of 100" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /save to history/i }));
    expect(await screen.findByText(/saved to scan history/i)).toBeInTheDocument();
    expect(api.saveScan).toHaveBeenCalledOnce();
  });
});
