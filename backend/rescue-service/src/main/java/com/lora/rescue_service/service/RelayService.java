package com.lora.rescue_service.service;

import com.lora.rescue_service.dto.RelayMetricsDTO;
import com.lora.rescue_service.dto.RelayTelemetryDTO;
import com.lora.rescue_service.entity.Relay;
import com.lora.rescue_service.repository.RelayRepository;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Polygon;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RelayService {

    private final RelayRepository relayRepository;

    private static final double METERS_PER_DEGREE_LAT =
            111_320.0;

    private static final int CIRCLE_SEGMENTS =
            256;

    private final GeometryFactory geometryFactory =
            new GeometryFactory();


    public RelayService(
            RelayRepository relayRepository) {

        this.relayRepository =
                relayRepository;
    }


    // =====================================================
    // GET ALL RELAYS
    // =====================================================

    public List<Relay> getAllRelays() {

        return relayRepository.findAll();
    }


    // =====================================================
    // GET ONE RELAY
    // =====================================================

    public Relay getRelayById(
            String relayId) {

        Relay relay =
                relayRepository.findById(
                        relayId
                );

        if (relay == null) {

            throw new RuntimeException(
                    "RELAY_NOT_FOUND"
            );
        }

        return relay;
    }


    // =====================================================
    // UPDATE TELEMETRY
    // =====================================================

    public Relay updateTelemetry(
            RelayTelemetryDTO telemetry) {

        if (
                telemetry == null ||
                        telemetry.getRelayId() == null ||
                        telemetry.getRelayId().isBlank()
        ) {

            throw new RuntimeException(
                    "RELAY_ID_REQUIRED"
            );
        }


        int updated =
                relayRepository.updateTelemetry(
                        telemetry.getRelayId(),
                        telemetry.getName(),
                        telemetry.getBattery(),
                        telemetry.getRssi(),
                        telemetry.getSnr(),
                        telemetry.getLat(),
                        telemetry.getLng()
                );


        if (updated == 0) {

            throw new RuntimeException(
                    "RELAY_NOT_FOUND"
            );
        }


        return relayRepository.findById(
                telemetry.getRelayId()
        );
    }


    // =====================================================
    // GET METRICS
    // =====================================================

    public RelayMetricsDTO getMetrics() {

        RelayMetricsDTO metrics =
                relayRepository.getMetrics();


        // ONLY CURRENTLY ONLINE RELAYS

        List<Relay> onlineRelays =
                relayRepository
                        .findOnlineRelaysForCoverage();


        // Calculate actual union coverage

        CoverageResult coverage =
                calculateCoverage(
                        onlineRelays
                );


        metrics.setCoverageArea(
                coverage.areaKm2
        );


        metrics.setCoverageBoundary(
                coverage.boundary
        );


        return metrics;
    }


    // =====================================================
    // CALCULATE COVERAGE
    // =====================================================

    private CoverageResult calculateCoverage(
            List<Relay> relays) {


        if (
                relays == null ||
                        relays.isEmpty()
        ) {

            return new CoverageResult(
                    0.0,
                    new ArrayList<>()
            );
        }


        // -------------------------------------------------
        // Find local reference point
        // -------------------------------------------------

        double centerLat = 0.0;
        double centerLng = 0.0;

        int validCount = 0;


        for (Relay relay : relays) {

            if (
                    !isValidCoordinate(
                            relay.getLat(),
                            relay.getLng()
                    )
            ) {
                continue;
            }


            if (
                    relay.getCoverageRadiusKm()
                            <= 0
            ) {
                continue;
            }


            centerLat +=
                    relay.getLat();

            centerLng +=
                    relay.getLng();

            validCount++;
        }


        if (validCount == 0) {

            return new CoverageResult(
                    0.0,
                    new ArrayList<>()
            );
        }


        centerLat /=
                validCount;

        centerLng /=
                validCount;


        // -------------------------------------------------
        // Local projection scale
        // -------------------------------------------------

        double metersPerDegreeLng =
                METERS_PER_DEGREE_LAT *
                        Math.cos(
                                Math.toRadians(
                                        centerLat
                                )
                        );


        // -------------------------------------------------
        // Create union geometry
        // -------------------------------------------------

        Geometry union =
                null;


        for (Relay relay : relays) {

            double lat =
                    relay.getLat();

            double lng =
                    relay.getLng();

            double radiusKm =
                    relay.getCoverageRadiusKm();


            if (
                    !isValidCoordinate(
                            lat,
                            lng
                    )
            ) {
                continue;
            }


            if (
                    !Double.isFinite(
                            radiusKm
                    ) ||
                            radiusKm <= 0
            ) {
                continue;
            }


            // Convert lat/lng to local metres

            double x =
                    (
                            lng -
                                    centerLng
                    )
                            *
                            metersPerDegreeLng;


            double y =
                    (
                            lat -
                                    centerLat
                    )
                            *
                            METERS_PER_DEGREE_LAT;


            // ------------------------------------------------
            // Create accurate circle polygon
            // ------------------------------------------------

            Coordinate center =
                    new Coordinate(
                            x,
                            y
                    );


            Geometry point =
                    geometryFactory
                            .createPoint(
                                    center
                            );


            Geometry circle =
                    point.buffer(
                            radiusKm *
                                    1000.0,
                            CIRCLE_SEGMENTS
                    );


            // ------------------------------------------------
            // UNION
            // ------------------------------------------------

            if (union == null) {

                union = circle;

            } else {

                union =
                        union.union(
                                circle
                        );
            }
        }


        if (
                union == null ||
                        union.isEmpty()
        ) {

            return new CoverageResult(
                    0.0,
                    new ArrayList<>()
            );
        }


        // -------------------------------------------------
        // Area in square metres
        // -------------------------------------------------

        double areaSquareMeters =
                union.getArea();


        // Convert to km²

        double areaKm2 =
                areaSquareMeters /
                        1_000_000.0;


        // -------------------------------------------------
        // Boundary
        // -------------------------------------------------

        List<List<Double>> boundary =
                geometryToLatLngBoundary(
                        union,
                        centerLat,
                        centerLng,
                        metersPerDegreeLng
                );


        return new CoverageResult(
                areaKm2,
                boundary
        );
    }


    // =====================================================
    // GEOMETRY → LAT/LNG
    // =====================================================

    private List<List<Double>>
    geometryToLatLngBoundary(
            Geometry geometry,
            double centerLat,
            double centerLng,
            double metersPerDegreeLng) {


        List<List<Double>> result =
                new ArrayList<>();


        if (geometry == null) {

            return result;
        }


        Geometry boundaryGeometry =
                geometry.getBoundary();


        Coordinate[] coordinates =
                boundaryGeometry
                        .getCoordinates();


        for (
                Coordinate coordinate :
                coordinates
        ) {

            double lat =
                    centerLat +
                            (
                                    coordinate.getY()
                                            /
                                            METERS_PER_DEGREE_LAT
                            );


            double lng =
                    centerLng +
                            (
                                    coordinate.getX()
                                            /
                                            metersPerDegreeLng
                            );


            if (
                    isValidCoordinate(
                            lat,
                            lng
                    )
            ) {

                List<Double> point =
                        new ArrayList<>();

                point.add(lat);
                point.add(lng);

                result.add(point);
            }
        }


        return result;
    }


    // =====================================================
    // VALID COORDINATE
    // =====================================================

    private boolean isValidCoordinate(
            double lat,
            double lng) {

        return
                Double.isFinite(lat) &&
                        Double.isFinite(lng) &&
                        lat >= -90 &&
                        lat <= 90 &&
                        lng >= -180 &&
                        lng <= 180;
    }


    // =====================================================
    // COVERAGE RESULT
    // =====================================================

    private static class CoverageResult {

        private final double areaKm2;

        private final List<List<Double>>
                boundary;


        private CoverageResult(
                double areaKm2,
                List<List<Double>> boundary) {

            this.areaKm2 =
                    areaKm2;

            this.boundary =
                    boundary;
        }
    }
}