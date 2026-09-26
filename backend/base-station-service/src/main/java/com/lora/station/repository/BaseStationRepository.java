package com.lora.station.repository;

import com.lora.station.entity.BaseStation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BaseStationRepository
        extends JpaRepository<BaseStation, Long> {
}