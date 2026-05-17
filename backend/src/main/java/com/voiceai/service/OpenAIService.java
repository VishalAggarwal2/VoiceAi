package com.voiceai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {

    private static final Logger log = LoggerFactory.getLogger(OpenAIService.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.whisper.model}")
    private String whisperModel;

    @Value("${openai.chat.model}")
    private String chatModel;

    public OpenAIService(WebClient webClient, ObjectMapper objectMapper) {
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    public String transcribeAudio(byte[] audioBytes, String fileName, String mimeType) {
        try {
            String extension = getExtension(fileName);
            String whisperFileName = "audio." + extension;

            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new ByteArrayResource(audioBytes) {
                @Override
                public String getFilename() { return whisperFileName; }
            }).contentType(MediaType.parseMediaType(mimeType));
            builder.part("model", whisperModel);
            builder.part("response_format", "text");

            String transcription = webClient.post()
                    .uri("https://api.openai.com/v1/audio/transcriptions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return transcription != null ? transcription.trim() : "";
        } catch (Exception e) {
            log.error("Whisper transcription failed", e);
            throw new RuntimeException("Transcription failed: " + e.getMessage());
        }
    }

    public String analyzeWithGPT(String transcription, String systemPrompt) {
        try {
            Map<String, Object> systemMsg = Map.of("role", "system", "content", systemPrompt);
            Map<String, Object> userMsg = Map.of("role", "user",
                    "content", "Analyze this transcript and return the JSON:\n\n" + transcription);

            Map<String, Object> request = Map.of(
                    "model", chatModel,
                    "messages", List.of(systemMsg, userMsg),
                    "response_format", Map.of("type", "json_object"),
                    "temperature", 0.3
            );

            String response = webClient.post()
                    .uri("https://api.openai.com/v1/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode node = objectMapper.readTree(response);
            return node.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            log.error("GPT analysis failed", e);
            throw new RuntimeException("Analysis failed: " + e.getMessage());
        }
    }

    private String getExtension(String fileName) {
        if (fileName == null) return "mp3";
        int dot = fileName.lastIndexOf('.');
        if (dot < 0) return "mp3";
        String ext = fileName.substring(dot + 1).toLowerCase();
        // Whisper supports: mp3, mp4, mpeg, mpga, m4a, wav, webm
        return switch (ext) {
            case "mp3", "mp4", "wav", "webm", "m4a", "ogg", "flac" -> ext;
            default -> "mp3";
        };
    }
}
