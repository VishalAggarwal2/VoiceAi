package com.voiceai.dto;

public class AnalysisRequest {
    private String analysisType;
    private String executiveName;
    private String customerName;
    private String callContext;

    public String getAnalysisType() { return analysisType; }
    public void setAnalysisType(String analysisType) { this.analysisType = analysisType; }

    public String getExecutiveName() { return executiveName; }
    public void setExecutiveName(String executiveName) { this.executiveName = executiveName; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCallContext() { return callContext; }
    public void setCallContext(String callContext) { this.callContext = callContext; }
}
