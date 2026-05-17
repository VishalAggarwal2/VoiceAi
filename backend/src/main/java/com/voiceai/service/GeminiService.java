package com.voiceai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.base-url}")
    private String baseUrl;

    @Value("${gemini.model}")
    private String model;

    public GeminiService(WebClient webClient, ObjectMapper objectMapper) {
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    public String uploadFileToGemini(byte[] fileBytes, String mimeType, String displayName) {
        try {
            String metadataJson = "{\"file\": {\"display_name\": \"" + displayName + "\"}}";
            String boundary = "boundary_" + System.currentTimeMillis();

            StringBuilder headerBuilder = new StringBuilder();
            headerBuilder.append("--").append(boundary).append("\r\n");
            headerBuilder.append("Content-Type: application/json; charset=utf-8\r\n\r\n");
            headerBuilder.append(metadataJson).append("\r\n");
            headerBuilder.append("--").append(boundary).append("\r\n");
            headerBuilder.append("Content-Type: ").append(mimeType).append("\r\n\r\n");

            byte[] headerBytes = headerBuilder.toString().getBytes();
            byte[] footerBytes = ("\r\n--" + boundary + "--\r\n").getBytes();

            byte[] body = new byte[headerBytes.length + fileBytes.length + footerBytes.length];
            System.arraycopy(headerBytes, 0, body, 0, headerBytes.length);
            System.arraycopy(fileBytes, 0, body, headerBytes.length, fileBytes.length);
            System.arraycopy(footerBytes, 0, body, headerBytes.length + fileBytes.length, footerBytes.length);

            String response = webClient.post()
                    .uri(baseUrl + "/upload/v1beta/files?uploadType=multipart&key=" + apiKey)
                    .contentType(MediaType.parseMediaType("multipart/related; boundary=" + boundary))
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode responseNode = objectMapper.readTree(response);
            return responseNode.path("file").path("uri").asText();
        } catch (Exception e) {
            log.error("Failed to upload file to Gemini", e);
            throw new RuntimeException("Failed to upload file to Gemini: " + e.getMessage());
        }
    }

    public String analyzeAudioWithPrompt(String fileUri, String mimeType, String prompt) {
        try {
            Map<String, Object> fileData = Map.of("mimeType", mimeType, "fileUri", fileUri);
            Map<String, Object> filePart = Map.of("fileData", fileData);
            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(filePart, textPart));
            Map<String, Object> generationConfig = Map.of("responseMimeType", "application/json", "temperature", 0.3);
            Map<String, Object> request = Map.of("contents", List.of(content), "generationConfig", generationConfig);

            String response = webClient.post()
                    .uri(baseUrl + "/v1beta/models/" + model + ":generateContent?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode responseNode = objectMapper.readTree(response);
            return responseNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        } catch (Exception e) {
            log.error("Failed to analyze audio with Gemini", e);
            throw new RuntimeException("Failed to analyze audio: " + e.getMessage());
        }
    }

    public String analyzeWithInlineData(byte[] fileBytes, String mimeType, String prompt) {
        try {
            String base64Data = Base64.getEncoder().encodeToString(fileBytes);
            Map<String, Object> inlineData = Map.of("mimeType", mimeType, "data", base64Data);
            Map<String, Object> inlinePart = Map.of("inlineData", inlineData);
            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(inlinePart, textPart));
            Map<String, Object> generationConfig = Map.of("responseMimeType", "application/json", "temperature", 0.3);
            Map<String, Object> request = Map.of("contents", List.of(content), "generationConfig", generationConfig);

            String response = webClient.post()
                    .uri(baseUrl + "/v1beta/models/" + model + ":generateContent?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode responseNode = objectMapper.readTree(response);
            return responseNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        } catch (Exception e) {
            log.error("Failed to analyze audio inline", e);
            throw new RuntimeException("Failed to analyze audio: " + e.getMessage());
        }
    }
}
