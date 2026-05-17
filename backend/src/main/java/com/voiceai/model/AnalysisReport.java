package com.voiceai.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_reports")
public class AnalysisReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String analysisType;

    @Column(columnDefinition = "TEXT")
    private String transcription;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String rawAnalysisJson;

    private Integer overallScore;
    private Double conversionProbability;
    private String customerSentiment;
    private String status;

    private Long durationSeconds;
    private String audioFormat;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Builder pattern
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final AnalysisReport r = new AnalysisReport();
        public Builder fileName(String v) { r.fileName = v; return this; }
        public Builder analysisType(String v) { r.analysisType = v; return this; }
        public Builder transcription(String v) { r.transcription = v; return this; }
        public Builder summary(String v) { r.summary = v; return this; }
        public Builder rawAnalysisJson(String v) { r.rawAnalysisJson = v; return this; }
        public Builder overallScore(Integer v) { r.overallScore = v; return this; }
        public Builder conversionProbability(Double v) { r.conversionProbability = v; return this; }
        public Builder customerSentiment(String v) { r.customerSentiment = v; return this; }
        public Builder status(String v) { r.status = v; return this; }
        public Builder durationSeconds(Long v) { r.durationSeconds = v; return this; }
        public Builder audioFormat(String v) { r.audioFormat = v; return this; }
        public AnalysisReport build() { return r; }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getAnalysisType() { return analysisType; }
    public void setAnalysisType(String analysisType) { this.analysisType = analysisType; }

    public String getTranscription() { return transcription; }
    public void setTranscription(String transcription) { this.transcription = transcription; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getRawAnalysisJson() { return rawAnalysisJson; }
    public void setRawAnalysisJson(String rawAnalysisJson) { this.rawAnalysisJson = rawAnalysisJson; }

    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }

    public Double getConversionProbability() { return conversionProbability; }
    public void setConversionProbability(Double conversionProbability) { this.conversionProbability = conversionProbability; }

    public String getCustomerSentiment() { return customerSentiment; }
    public void setCustomerSentiment(String customerSentiment) { this.customerSentiment = customerSentiment; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Long durationSeconds) { this.durationSeconds = durationSeconds; }

    public String getAudioFormat() { return audioFormat; }
    public void setAudioFormat(String audioFormat) { this.audioFormat = audioFormat; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
