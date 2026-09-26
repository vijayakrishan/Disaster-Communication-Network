package com.lora.station.service;

import com.lora.station.dto.NearestStationResponse;
import com.lora.station.entity.BaseStation;
import com.lora.station.repository.BaseStationRepository;

import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class BaseStationService {

    private final BaseStationRepository baseStationRepository;

    public BaseStationService(
            BaseStationRepository baseStationRepository) {
        this.baseStationRepository = baseStationRepository;
    }

    public List<NearestStationResponse> getNearestStations(
            double userLatitude,
            double userLongitude) {

        List<BaseStation> stations =
                baseStationRepository.findAll();

        return stations.stream()
                .map(station -> {

                    double distance = calculateDistance(
                            userLatitude,
                            userLongitude,
                            station.getLatitude(),
                            station.getLongitude()
                    );

                    return new NearestStationResponse(
                            station.getStationId(),
                            station.getStationName(),
                            Math.round(distance * 100.0) / 100.0,
                            station.getSignalStrength(),
                            station.getSignalQuality(),
                            station.getStatus()
                    );
                })
                .sorted(Comparator.comparing(
                        NearestStationResponse::getDistance))
                .limit(3)
                .toList();
    }

    private double calculateDistance(
            double lat1,
            double lon1,
            double lat2,
            double lon2) {

        final double EARTH_RADIUS = 6371.0;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2)
                        +
                        Math.cos(Math.toRadians(lat1))
                                * Math.cos(Math.toRadians(lat2))
                                * Math.sin(dLon / 2)
                                * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
        );

        return EARTH_RADIUS * c;
    }
}