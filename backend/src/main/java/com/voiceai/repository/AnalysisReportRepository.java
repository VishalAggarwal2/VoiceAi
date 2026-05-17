package com.voiceai.repository;

import com.voiceai.model.AnalysisReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalysisReportRepository extends JpaRepository<AnalysisReport, Long> {
    List<AnalysisReport> findAllByOrderByCreatedAtDesc();
    List<AnalysisReport> findByAnalysisTypeOrderByCreatedAtDesc(String analysisType);
}
