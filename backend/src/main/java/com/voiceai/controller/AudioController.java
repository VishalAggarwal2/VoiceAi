package com.voiceai.controller;

import com.voiceai.dto.AnalysisRequest;
import com.voiceai.model.AnalysisReport;
import com.voiceai.service.AudioAnalysisService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AudioController {

    private static final Logger log = LoggerFactory.getLogger(AudioController.class);

    private final AudioAnalysisService analysisService;

    public AudioController(AudioAnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<AnalysisReport> analyzeAudio(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "analysisType", defaultValue = "GENERAL") String analysisType,
            @RequestParam(value = "executiveName", required = false) String executiveName,
            @RequestParam(value = "customerName", required = false) String customerName,
            @RequestParam(value = "callContext", required = false) String callContext) {

        log.info("Received audio file: {}, type: {}, size: {} bytes",
                file.getOriginalFilename(), analysisType, file.getSize());

        AnalysisRequest request = new AnalysisRequest();
        request.setAnalysisType(analysisType);
        request.setExecutiveName(executiveName);
        request.setCustomerName(customerName);
        request.setCallContext(callContext);

        AnalysisReport report = analysisService.analyzeAudio(file, request);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports")
    public ResponseEntity<List<AnalysisReport>> getAllReports(
            @RequestParam(value = "type", required = false) String type) {
        List<AnalysisReport> reports = type != null
                ? analysisService.getReportsByType(type)
                : analysisService.getAllReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/reports/{id}")
    public ResponseEntity<AnalysisReport> getReport(@PathVariable Long id) {
        return ResponseEntity.ok(analysisService.getReport(id));
    }

    @DeleteMapping("/reports/{id}")
    public ResponseEntity<Map<String, String>> deleteReport(@PathVariable Long id) {
        analysisService.deleteReport(id);
        return ResponseEntity.ok(Map.of("message", "Report deleted successfully"));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "Voice AI Backend"));
    }
}
