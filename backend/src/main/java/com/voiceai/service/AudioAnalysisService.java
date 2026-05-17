package com.voiceai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voiceai.dto.AnalysisRequest;
import com.voiceai.model.AnalysisReport;
import com.voiceai.repository.AnalysisReportRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class AudioAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AudioAnalysisService.class);

    private final OpenAIService openAIService;
    private final AnalysisReportRepository reportRepository;
    private final ObjectMapper objectMapper;

    public AudioAnalysisService(OpenAIService openAIService,
                                AnalysisReportRepository reportRepository,
                                ObjectMapper objectMapper) {
        this.openAIService = openAIService;
        this.reportRepository = reportRepository;
        this.objectMapper = objectMapper;
    }

    private static final String GENERAL_SYSTEM_PROMPT = """
            You are an expert audio analyst. Analyze the provided transcript and return ONLY valid JSON:
            {
              "transcription": "the full transcript text provided",
              "summary": "brief 2-3 sentence summary",
              "keyTopics": ["topic1", "topic2", "topic3"],
              "sentiment": "positive",
              "actionItems": ["action1", "action2"],
              "speakerCount": 1,
              "languageDetected": "English",
              "overallScore": 75,
              "highlights": ["key point 1", "key point 2"],
              "durationEstimate": "estimated duration"
            }
            Return ONLY the JSON object, no markdown, no extra text.
            """;

    private static final String SALES_SYSTEM_PROMPT = """
            You are an expert sales coach. Analyze the provided sales call transcript and return ONLY valid JSON:
            {
              "transcription": "the full transcript text provided",
              "summary": "executive summary of the call",
              "overallScore": 78,
              "executiveAnalysis": {
                "name": "Sales Executive",
                "communicationStyle": "description of communication style",
                "toneAndEnergy": "description",
                "listeningSkills": "description",
                "score": 80,
                "strengths": ["strength1", "strength2", "strength3"],
                "improvements": ["improvement1", "improvement2", "improvement3"],
                "objectionHandling": {
                  "score": 75,
                  "description": "how they handled objections",
                  "examples": ["example1", "example2"]
                },
                "productKnowledge": 85,
                "rapport": 70,
                "closing": 65
              },
              "customerAnalysis": {
                "sentiment": "positive",
                "sentimentScore": 65,
                "engagementLevel": "high",
                "expectations": ["expectation1", "expectation2"],
                "questions": ["question1", "question2"],
                "painPoints": ["pain1", "pain2"],
                "objections": ["objection1", "objection2"],
                "buyingSignals": ["signal1", "signal2"]
              },
              "conversionAnalysis": {
                "probability": 72,
                "confidence": "medium",
                "urgency": "high",
                "timeline": "estimated timeline",
                "keyFactors": {
                  "positive": ["factor1", "factor2"],
                  "negative": ["risk1", "risk2"]
                },
                "followUpActions": ["action1", "action2", "action3"],
                "recommendedNextStep": "specific next step recommendation"
              },
              "callMetrics": {
                "talkRatio": {"executive": 60, "customer": 40},
                "questionCount": 8,
                "objectionCount": 3,
                "silencePeriods": 2,
                "interruptions": 1
              },
              "keyMoments": [
                {"timestamp": "early", "type": "objection", "description": "Customer raised price concern"},
                {"timestamp": "mid", "type": "buying_signal", "description": "Customer asked about delivery timeline"}
              ]
            }
            Return ONLY the JSON object, no markdown, no extra text.
            """;

    public AnalysisReport analyzeAudio(MultipartFile file, AnalysisRequest request) {
        String fileName = file.getOriginalFilename();
        String mimeType = detectMimeType(file);
        String analysisType = request.getAnalysisType() != null ? request.getAnalysisType() : "GENERAL";

        AnalysisReport report = AnalysisReport.builder()
                .fileName(fileName)
                .analysisType(analysisType)
                .status("PROCESSING")
                .audioFormat(mimeType)
                .build();
        report = reportRepository.save(report);

        try {
            byte[] fileBytes = file.getBytes();

            // Step 1: Transcribe with Whisper
            log.info("Transcribing audio: {}", fileName);
            String transcription = openAIService.transcribeAudio(fileBytes, fileName, mimeType);
            log.info("Transcription complete, length: {} chars", transcription.length());

            // Step 2: Analyze with GPT-4o
            String systemPrompt = buildSystemPrompt(analysisType, request);
            log.info("Analyzing transcript with GPT-4o...");
            String analysisJson = openAIService.analyzeWithGPT(transcription, systemPrompt);

            report = parseAndUpdateReport(report, analysisJson, analysisType, transcription);
            report.setStatus("COMPLETED");
        } catch (Exception e) {
            log.error("Analysis failed for file: {}", fileName, e);
            report.setStatus("FAILED");
            report.setSummary("Analysis failed: " + e.getMessage());
        }

        return reportRepository.save(report);
    }

    private String buildSystemPrompt(String analysisType, AnalysisRequest request) {
        if ("SALES".equals(analysisType)) {
            StringBuilder prompt = new StringBuilder(SALES_SYSTEM_PROMPT);
            if (request.getExecutiveName() != null && !request.getExecutiveName().isEmpty()) {
                prompt.append("\nThe sales executive's name is: ").append(request.getExecutiveName());
            }
            if (request.getCustomerName() != null && !request.getCustomerName().isEmpty()) {
                prompt.append("\nThe customer/company is: ").append(request.getCustomerName());
            }
            if (request.getCallContext() != null && !request.getCallContext().isEmpty()) {
                prompt.append("\nCall context: ").append(request.getCallContext());
            }
            return prompt.toString();
        }
        return GENERAL_SYSTEM_PROMPT;
    }

    private AnalysisReport parseAndUpdateReport(AnalysisReport report, String json, String analysisType, String rawTranscription) {
        try {
            JsonNode node = objectMapper.readTree(json);
            report.setRawAnalysisJson(json);

            String transcription = node.path("transcription").asText();
            report.setTranscription(transcription.isEmpty() ? rawTranscription : transcription);
            report.setSummary(node.path("summary").asText());
            report.setOverallScore(node.path("overallScore").asInt(0));

            if ("SALES".equals(analysisType)) {
                report.setConversionProbability(node.path("conversionAnalysis").path("probability").asDouble(0));
                report.setCustomerSentiment(node.path("customerAnalysis").path("sentiment").asText("neutral"));
            } else {
                report.setCustomerSentiment(node.path("sentiment").asText("neutral"));
            }
        } catch (Exception e) {
            log.error("Failed to parse analysis JSON", e);
            report.setRawAnalysisJson(json);
            report.setTranscription(rawTranscription);
            report.setSummary("Analysis completed");
        }
        return report;
    }

    private String detectMimeType(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) return "audio/mpeg";
        String lower = originalFilename.toLowerCase();
        if (lower.endsWith(".mp3")) return "audio/mpeg";
        if (lower.endsWith(".mp4")) return "audio/mp4";
        if (lower.endsWith(".wav")) return "audio/wav";
        if (lower.endsWith(".webm")) return "audio/webm";
        if (lower.endsWith(".ogg")) return "audio/ogg";
        if (lower.endsWith(".m4a")) return "audio/mp4";
        if (lower.endsWith(".flac")) return "audio/flac";
        if (lower.endsWith(".aac")) return "audio/aac";
        String contentType = file.getContentType();
        return contentType != null ? contentType : "audio/mpeg";
    }

    public List<AnalysisReport> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<AnalysisReport> getReportsByType(String type) {
        return reportRepository.findByAnalysisTypeOrderByCreatedAtDesc(type);
    }

    public AnalysisReport getReport(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found: " + id));
    }

    public void deleteReport(Long id) {
        reportRepository.deleteById(id);
    }
}
