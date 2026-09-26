import React, {
  useState,
  useEffect,
  useRef
} from 'react';

import './RelayMonitoring.css';

import { useAppContext } from '../../context/AppContext';

import {
  Battery,
  Signal,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import FilterBar from '../../components/FilterBar';


// =====================================================
// CONSTANTS
// =====================================================

const DEFAULT_MAP_CENTER = [
  20.5937,
  78.9629
];

const DEFAULT_MAP_ZOOM = 5;

const MIN_MAP_ZOOM = 3;

const MAX_MAP_ZOOM = 15;


// =====================================================
// HELPER
// =====================================================

function isValidCoordinate(lat, lng) {

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}


// =====================================================
// CREATE COVERAGE POINTS
// =====================================================

function createCoveragePoints(
  lat,
  lng,
  radiusKm
) {

  const points = [];

  const earthRadiusKm = 6371;

  if (
    !isValidCoordinate(
      lat,
      lng
    )
  ) {
    return points;
  }

  if (
    !Number.isFinite(radiusKm) ||
    radiusKm <= 0
  ) {
    return points;
  }


  // 36 points = every 10 degrees

  for (
    let i = 0;
    i < 36;
    i++
  ) {

    const angle =
      (
        i * 10
      ) *
      Math.PI /
      180;


    const angularDistance =
      radiusKm /
      earthRadiusKm;


    const latRadians =
      lat *
      Math.PI /
      180;


    const pointLat =
      Math.asin(
        Math.sin(latRadians) *
          Math.cos(angularDistance)
        +
        Math.cos(latRadians) *
          Math.sin(angularDistance) *
          Math.cos(angle)
      );


    const pointLng =
      lng *
        Math.PI /
        180
      +
      Math.atan2(
        Math.sin(angle) *
          Math.sin(angularDistance) *
          Math.cos(latRadians),

        Math.cos(angularDistance)
          -
          Math.sin(latRadians) *
          Math.sin(pointLat)
      );


    const finalLat =
      pointLat *
      180 /
      Math.PI;

    const finalLng =
      pointLng *
      180 /
      Math.PI;


    if (
      isValidCoordinate(
        finalLat,
        finalLng
      )
    ) {

      points.push([
        finalLat,
        finalLng
      ]);

    }
  }


  return points;
}


// =====================================================
// CONVEX HULL
// =====================================================

function crossProduct(
  a,
  b,
  c
) {

  return (
    (b[1] - a[1]) *
      (c[0] - a[0])
    -
    (b[0] - a[0]) *
      (c[1] - a[1])
  );
}


function createConvexHull(
  points
) {

  if (
    !Array.isArray(points) ||
    points.length < 3
  ) {
    return [];
  }


  const sorted =
    [...points].sort(
      (a, b) => {

        if (
          a[1] !== b[1]
        ) {
          return a[1] - b[1];
        }

        return a[0] - b[0];
      }
    );


  const lower = [];


  for (
    const point of sorted
  ) {

    while (
      lower.length >= 2 &&
      crossProduct(
        lower[
          lower.length - 2
        ],
        lower[
          lower.length - 1
        ],
        point
      ) <= 0
    ) {

      lower.pop();

    }

    lower.push(point);
  }


  const upper = [];


  for (
    let i =
      sorted.length - 1;

    i >= 0;

    i--
  ) {

    const point =
      sorted[i];


    while (
      upper.length >= 2 &&
      crossProduct(
        upper[
          upper.length - 2
        ],
        upper[
          upper.length - 1
        ],
        point
      ) <= 0
    ) {

      upper.pop();

    }

    upper.push(point);
  }


  lower.pop();
  upper.pop();


  return [
    ...lower,
    ...upper
  ];
}


// =====================================================
// COMPONENT
// =====================================================

const RelayMonitoring = () => {

  const {
    relays = [],
    relayMetrics = {}
  } = useAppContext();


  // =====================================================
  // MAP REFS
  // =====================================================

  const mapContainerRef =
    useRef(null);

  const mapRef =
    useRef(null);

  const layerGroupRef =
    useRef(null);

  const legendRef =
    useRef(null);


  // =====================================================
  // STATE
  // =====================================================

  const [
    searchQuery,
    setSearchQuery
  ] = useState('');

  const [
    filterDate,
    setFilterDate
  ] = useState('');

  const [
    filterStatus,
    setFilterStatus
  ] = useState('ALL');

  const [
    currentPage,
    setCurrentPage
  ] = useState(1);

  const [
    pageSize,
    setPageSize
  ] = useState(10);

  const [
    isFullscreen,
    setIsFullscreen
  ] = useState(false);


  // =====================================================
  // METRICS
  // =====================================================

  const onlineCount =
    Number(
      relayMetrics?.onlineRelays ?? 0
    );


  const offlineCount =
    Number(
      relayMetrics?.offlineRelays ?? 0
    );


  const averageRssi =
    Number(
      relayMetrics?.averageRssi ?? 0
    );


  const coverageArea =
    Number(
      relayMetrics?.coverageArea ?? 0
    );


  // =====================================================
  // FILTER
  // =====================================================

  const filteredRelays =
    relays.filter(
      relay => {


        // -----------------------------------------------
        // SEARCH
        // -----------------------------------------------

        if (searchQuery) {

          const q =
            searchQuery
              .toLowerCase()
              .trim();


          const id =
            String(
              relay?.id ?? ''
            )
              .toLowerCase();


          const name =
            String(
              relay?.name ?? ''
            )
              .toLowerCase();


          if (
            !id.includes(q) &&
            !name.includes(q)
          ) {

            return false;
          }
        }


        // -----------------------------------------------
        // STATUS
        // -----------------------------------------------

        if (
          filterStatus !== 'ALL'
        ) {

          const status =
            String(
              relay?.status ?? ''
            )
              .toUpperCase();


          if (
            status !==
            filterStatus
          ) {

            return false;
          }
        }


        // -----------------------------------------------
        // DATE
        // -----------------------------------------------

        if (filterDate) {

          if (
            !relay?.lastSeen
          ) {

            return false;
          }


          const relayDate =
            new Date(
              relay.lastSeen
            )
              .toISOString()
              .split('T')[0];


          if (
            relayDate !==
            filterDate
          ) {

            return false;
          }
        }


        return true;
      }
    );


  // =====================================================
  // PAGINATION
  // =====================================================

  const totalRecords =
    filteredRelays.length;


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalRecords /
        pageSize
      )
    );


  const startIndex =
    (
      currentPage - 1
    ) *
    pageSize;


  const paginatedRelays =
    filteredRelays.slice(
      startIndex,
      startIndex +
        pageSize
    );


  const endIndex =
    Math.min(
      startIndex +
        pageSize,
      totalRecords
    );


  // =====================================================
  // PREV
  // =====================================================

  const handlePrev = () => {

    if (
      currentPage > 1
    ) {

      setCurrentPage(
        currentPage - 1
      );

    }
  };


  // =====================================================
  // NEXT
  // =====================================================

  const handleNext = () => {

    if (
      currentPage <
      totalPages
    ) {

      setCurrentPage(
        currentPage + 1
      );

    }
  };


  // =====================================================
  // CREATE MAP ONCE
  // =====================================================

  useEffect(() => {

    if (
      !mapContainerRef.current
    ) {

      return;
    }


    // Already created

    if (
      mapRef.current
    ) {

      return;
    }


    // ===================================================
    // CREATE MAP
    // ===================================================

    const map =
      L.map(
        mapContainerRef.current,
        {
          zoomControl:
            true,

          attributionControl:
            true,

          minZoom:
            MIN_MAP_ZOOM,

          maxZoom:
            20
        }
      );


    mapRef.current =
      map;

// ===================================================
// TILE LAYER - DARK MAP
// ===================================================

L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  {
    attribution:
      'Tiles &copy; Esri',

    maxZoom: 16
  }
).addTo(map);

    // ===================================================
    // LAYER GROUP
    // ===================================================

    const layerGroup =
      L.layerGroup();


    layerGroup.addTo(
      map
    );


    layerGroupRef.current =
      layerGroup;


    // ===================================================
    // LEGEND
    // ===================================================

    const legend =
      L.control({
        position:
          'bottomleft'
      });


    legend.onAdd =
      () => {

        const div =
          L.DomUtil.create(
            'div',
            'relay-map-legend'
          );


        div.innerHTML = `

          <div>
            <span
              class="legend-dot online"
            ></span>

            Relay Online
          </div>

          <div>
            <span
              class="legend-dot offline"
            ></span>

            Relay Offline
          </div>

          <div>
            <span
              class="legend-circle"
            ></span>

            Relay Coverage
          </div>

          <div>
            <span
              class="legend-boundary"
            ></span>

            Network Coverage
          </div>

        `;


        return div;
      };


    legend.addTo(
      map
    );


    legendRef.current =
      legend;


    // ===================================================
    // INITIAL MAP SIZE
    // ===================================================

    setTimeout(
      () => {

        if (
          mapRef.current
        ) {

          mapRef.current
            .invalidateSize(
              false
            );

        }

      },
      300
    );


    // ===================================================
    // CLEANUP
    // ===================================================

    return () => {

      if (
        mapRef.current
      ) {

        mapRef.current.off();

        mapRef.current.remove();

        mapRef.current =
          null;

      }


      layerGroupRef.current =
        null;

      legendRef.current =
        null;

    };

  }, []);


  // =====================================================
  // UPDATE MAP DATA
  // =====================================================

  useEffect(() => {

    const map =
      mapRef.current;


    const layerGroup =
      layerGroupRef.current;


    if (
      !map ||
      !layerGroup
    ) {

      return;
    }


    // ===================================================
    // CLEAR OLD DATA
    // ===================================================

    layerGroup.clearLayers();


    // ===================================================
    // NO RELAYS
    // ===================================================

    if (
      !Array.isArray(relays) ||
      relays.length === 0
    ) {

      map.setView(
        DEFAULT_MAP_CENTER,
        DEFAULT_MAP_ZOOM,
        {
          animate:
            false
        }
      );


      setTimeout(
        () => {

          if (
            mapRef.current
          ) {

            mapRef.current
              .invalidateSize(
                false
              );

          }

        },
        100
      );


      return;
    }


    // ===================================================
    // RAW MAP BOUNDS
    //
    // We calculate these ourselves.
    // No circle.getBounds()
    // No Leaflet internal projection.
    // ===================================================

    let minLat =
      Infinity;

    let maxLat =
      -Infinity;

    let minLng =
      Infinity;

    let maxLng =
      -Infinity;


    // ===================================================
    // COVERAGE POINTS
    // ===================================================

    const allCoveragePoints =
      [];


    // ===================================================
    // DRAW EVERY RELAY
    // ===================================================

    relays.forEach(
      relay => {

        // -----------------------------------------------
        // COORDINATES
        // -----------------------------------------------

        const lat =
          Number(
            relay?.lat
          );


        const lng =
          Number(
            relay?.lng
          );


        if (
          !isValidCoordinate(
            lat,
            lng
          )
        ) {

          return;
        }


        // -----------------------------------------------
        // UPDATE BOUNDS
        // -----------------------------------------------

        minLat =
          Math.min(
            minLat,
            lat
          );

        maxLat =
          Math.max(
            maxLat,
            lat
          );

        minLng =
          Math.min(
            minLng,
            lng
          );

        maxLng =
          Math.max(
            maxLng,
            lng
          );


        // -----------------------------------------------
        // STATUS
        // -----------------------------------------------

        const status =
          String(
            relay?.status ?? ''
          )
            .toUpperCase();


        const isOnline =
          status ===
          'ONLINE';


        const color =
          isOnline
            ? '#22C55E'
            : '#EF4444';


        // -----------------------------------------------
        // RELAY LAT LNG
        // -----------------------------------------------

        const relayLatLng =
          L.latLng(
            lat,
            lng
          );


        // =================================================
        // COVERAGE RADIUS
        // =================================================

        const radiusKm =
          Number(
            relay?.coverageRadiusKm
          );


        if (
          Number.isFinite(
            radiusKm
          ) &&
          radiusKm > 0
        ) {


          // ---------------------------------------------
          // COVERAGE CIRCLE
          // ---------------------------------------------

          const circle =
            L.circle(
              relayLatLng,
              {
                radius:
                  radiusKm *
                  1000,

                color:
                  color,

                weight:
                  2,

                opacity:
                  0.85,

                fillColor:
                  color,

                fillOpacity:
                  isOnline
                    ? 0.16
                    : 0.10,

                dashArray:
                  '8 6',

                interactive:
                  false
              }
            );


          circle.addTo(
            layerGroup
          );


          // ---------------------------------------------
          // CALCULATE RAW COVERAGE POINTS
          // ---------------------------------------------

          const points =
            createCoveragePoints(
              lat,
              lng,
              radiusKm
            );


          points.forEach(
            point => {

              allCoveragePoints
                .push(point);


              minLat =
                Math.min(
                  minLat,
                  point[0]
                );


              maxLat =
                Math.max(
                  maxLat,
                  point[0]
                );


              minLng =
                Math.min(
                  minLng,
                  point[1]
                );


              maxLng =
                Math.max(
                  maxLng,
                  point[1]
                );

            }
          );

        }


        // =================================================
        // RELAY MARKER
        // =================================================

        const markerIcon =
          L.divIcon({

            className:
              'custom-leaflet-marker',

            html: `
              <div
                style="
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: ${color};
                  border: 3px solid #ffffff;
                  box-shadow:
                    0 0 8px ${color},
                    0 0 18px ${color};
                "
              ></div>
            `,

            iconSize:
              [18, 18],

            iconAnchor:
              [9, 9]
          });


        const marker =
          L.marker(
            relayLatLng,
            {
              icon:
                markerIcon,

              zIndexOffset:
                1000
            }
          );


        marker.addTo(
          layerGroup
        );


        // =================================================
        // POPUP
        // =================================================

        marker.bindPopup(`

          <div
            style="
              font-family: Arial, sans-serif;
              color: #020817;
              min-width: 185px;
              padding: 4px;
            "
          >

            <b
              style="
                font-size: 13px;
              "
            >
              ${
                relay?.name ||
                'Relay'
              }
            </b>

            <br />

            <span
              style="
                font-size: 11px;
              "
            >
              ID:
              ${
                relay?.id ||
                '--'
              }
            </span>

            <br />
            <br />

            <span
              style="
                font-size: 11px;
              "
            >
              Status:

              <b
                style="
                  color: ${color};
                "
              >
                ${
                  relay?.status ||
                  '--'
                }
              </b>
            </span>

            <br />

            <span
              style="
                font-size: 11px;
              "
            >
              Battery:

              <b>
                ${
                  relay?.battery ??
                  '--'
                }%
              </b>
            </span>

            <br />

            <span
              style="
                font-size: 11px;
              "
            >
              RSSI:

              <b>
                ${
                  relay?.rssi ??
                  '--'
                } dBm
              </b>
            </span>

            <br />

            <span
              style="
                font-size: 11px;
              "
            >
              SNR:

              <b>
                ${
                  relay?.snr ??
                  '--'
                } dB
              </b>
            </span>

            <br />

            <span
              style="
                font-size: 11px;
              "
            >
              Coverage:

              <b>
                ${
                  Number.isFinite(
                    radiusKm
                  ) &&
                  radiusKm > 0
                    ? `${radiusKm.toFixed(2)} km`
                    : '--'
                }
              </b>
            </span>

          </div>

        `);

      }
    );


    // ===================================================
    // NETWORK COVERAGE BOUNDARY
    // ===================================================

    if (
      allCoveragePoints.length >= 3
    ) {

      const hull =
        createConvexHull(
          allCoveragePoints
        );


      if (
        hull.length >= 3
      ) {

        const boundary =
          L.polygon(
            hull,
            {
              color:
                '#FACC15',

              weight:
                3,

              opacity:
                0.95,

              fillColor:
                '#FACC15',

              fillOpacity:
                0.05,

              dashArray:
                '10 8',

              interactive:
                false
            }
          );


        boundary.addTo(
          layerGroup
        );

      }

    }


    // ===================================================
    // AUTO ZOOM
    // ===================================================

    if (
      Number.isFinite(minLat) &&
      Number.isFinite(maxLat) &&
      Number.isFinite(minLng) &&
      Number.isFinite(maxLng)
    ) {

      // -----------------------------------------------
      // Create plain Leaflet bounds
      // from raw coordinates.
      // -----------------------------------------------

      const bounds =
        L.latLngBounds(
          [
            minLat,
            minLng
          ],
          [
            maxLat,
            maxLng
          ]
        );


      // -----------------------------------------------
      // Make sure bounds has usable size
      // -----------------------------------------------

      let finalBounds =
        bounds;


      if (
        minLat === maxLat &&
        minLng === maxLng
      ) {

        finalBounds =
          L.latLngBounds(
            [
              minLat - 0.01,
              minLng - 0.01
            ],
            [
              maxLat + 0.01,
              maxLng + 0.01
            ]
          );

      }


      // -----------------------------------------------
      // Fit map after Leaflet has rendered
      // -----------------------------------------------

      requestAnimationFrame(
        () => {

          if (
            !mapRef.current
          ) {

            return;
          }


          try {

            mapRef.current
              .invalidateSize(
                false
              );


            mapRef.current
              .fitBounds(
                finalBounds,
                {
                  padding:
                    [
                      50,
                      50
                    ],

                  maxZoom:
                    MAX_MAP_ZOOM,

                  animate:
                    false
                }
              );

          } catch (
            error
          ) {

            console.error(
              'Relay map fit error:',
              error
            );


            // Safe fallback

            if (
              mapRef.current
            ) {

              const centerLat =
                (
                  minLat +
                  maxLat
                ) / 2;


              const centerLng =
                (
                  minLng +
                  maxLng
                ) / 2;


              mapRef.current
                .setView(
                  [
                    centerLat,
                    centerLng
                  ],
                  12,
                  {
                    animate:
                      false
                  }
                );

            }

          }

        }
      );

    }


    // ===================================================
    // FINAL MAP SIZE FIX
    // ===================================================

    setTimeout(
      () => {

        if (
          mapRef.current
        ) {

          mapRef.current
            .invalidateSize(
              false
            );

        }

      },
      250
    );


  }, [
    relays
  ]);


  // =====================================================
  // FULLSCREEN MAP SIZE
  // =====================================================

  useEffect(() => {

    const timer =
      setTimeout(
        () => {

          if (
            mapRef.current
          ) {

            mapRef.current
              .invalidateSize(
                false
              );

          }

        },
        350
      );


    return () =>
      clearTimeout(
        timer
      );

  }, [
    isFullscreen
  ]);


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div
      className="
        dashboard-page
      "
    >


      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display:
            'flex',

          alignItems:
            'center',

          gap:
            '10px',

          marginBottom:
            '24px'
        }}
      >

        <Signal
          size={22}
          color="var(--accent-glow)"
        />


        <h3
          style={{
            fontSize:
              '18px',

            fontWeight:
              '700',

            color:
              '#fff',

            margin:
              0
          }}
        >
          Relay Monitoring
        </h3>

      </div>


      {/* =================================================
          METRICS
      ================================================= */}

      <div
        className="
          grid-cols-4
        "
        style={{
          marginBottom:
            '24px'
        }}
      >


        {/* ONLINE */}

        <div
          className="
            glass-panel
            summary-stat-card
          "
        >

          <span
            className="label"
          >
            Online Relays
          </span>


          <span
            className="
              val
              text-success
            "
            style={{
              color:
                'var(--color-success)'
            }}
          >
            {
              onlineCount
            }
          </span>

        </div>


        {/* OFFLINE */}

        <div
          className="
            glass-panel
            summary-stat-card
          "
        >

          <span
            className="label"
          >
            Offline Relays
          </span>


          <span
            className="
              val
              text-danger
            "
            style={{
              color:
                'var(--color-danger)'
            }}
          >
            {
              offlineCount
            }
          </span>

        </div>


        {/* RSSI */}

        <div
          className="
            glass-panel
            summary-stat-card
          "
        >

          <span
            className="label"
          >
            Avg Signal Strength
          </span>


          <span
            className="val"
            style={{
              color:
                'var(--accent-glow)'
            }}
          >
            {
              averageRssi.toFixed(2)
            }

            {' '}dBm
          </span>

        </div>


        {/* COVERAGE */}

        <div
          className="
            glass-panel
            summary-stat-card
          "
        >

          <span
            className="label"
          >
            Coverage Area
          </span>


          <span
            className="
              val
              text-success
            "
            style={{
              color:
                'var(--color-success)'
            }}
          >
            {
              coverageArea.toFixed(2)
            }

            {' '}km²
          </span>

        </div>

      </div>


      {/* =================================================
          MAP
      ================================================= */}

      <div
        className={`
          glass-panel
          map-pane-panel
          ${
            isFullscreen
              ? 'leaflet-map-fullscreen-active'
              : ''
          }
        `}
        style={
          isFullscreen
            ? {}
            : {
                marginBottom:
                  '24px'
              }
        }
      >


        {/* MAP HEADER */}

        <div
          className="
            pane-header
            flex-between
          "
        >

          <span>
            Relay Spatial Grid Mapping
          </span>


          <div
            style={{
              display:
                'flex',

              alignItems:
                'center',

              gap:
                '10px'
            }}
          >

            <button
              className="
                btn-secondary
              "
              onClick={() =>
                setIsFullscreen(
                  !isFullscreen
                )
              }
              style={{
                padding:
                  '4px 10px',

                fontSize:
                  '11px',

                borderRadius:
                  '4px',

                display:
                  'inline-flex',

                alignItems:
                  'center',

                gap:
                  '4px'
              }}
            >

              {
                isFullscreen
                  ? (
                    <Minimize2
                      size={12}
                    />
                  )
                  : (
                    <Maximize2
                      size={12}
                    />
                  )
              }


              <span>
                {
                  isFullscreen
                    ? 'Exit Fullscreen'
                    : 'Maximize Map'
                }
              </span>

            </button>


            <span
              className="
                live-pill
              "
            >
              LIVE PLOT
            </span>

          </div>

        </div>


        {/* MAP CONTAINER */}

        <div
          ref={
            mapContainerRef
          }
          className="
            leaflet-map-wrapper
          "
        />

      </div>


      {/* =================================================
          FILTER
      ================================================= */}

      <FilterBar

        searchPlaceholder=
          "Search Relays..."

        searchQuery={
          searchQuery
        }

        setSearchQuery={
          value => {

            setSearchQuery(
              value
            );

            setCurrentPage(
              1
            );

          }
        }

        filterDate={
          filterDate
        }

        setFilterDate={
          value => {

            setFilterDate(
              value
            );

            setCurrentPage(
              1
            );

          }
        }

        dropdownValue={
          filterStatus
        }

        setDropdownValue={
          value => {

            setFilterStatus(
              value
            );

            setCurrentPage(
              1
            );

          }
        }

        dropdownOptions={[
          {
            value:
              'ONLINE',

            label:
              'Online'
          },

          {
            value:
              'OFFLINE',

            label:
              'Offline'
          }
        ]}

        dropdownPlaceholder=
          "All Statuses"

      />


      {/* =================================================
          TABLE
      ================================================= */}

      <div
        className="
          glass-panel
          table-panel
        "
      >

        <div
          className="
            modern-table-container
          "
        >

          <table
            className="
              modern-table
              full-width-table
            "
          >

            <thead>

              <tr>

                <th>
                  NODE ID
                </th>

                <th>
                  STATION NAME
                </th>

                <th>
                  SIGNAL METRICS
                </th>

                <th>
                  BATTERY
                </th>

                <th>
                  TOTAL PACKETS
                </th>

                <th>
                  STATUS
                </th>

              </tr>

            </thead>


            <tbody>

              {
                paginatedRelays.length === 0
                  ? (

                    <tr>

                      <td
                        colSpan="6"
                        style={{
                          textAlign:
                            'center',

                          padding:
                            '30px'
                        }}
                      >
                        No relay records found
                      </td>

                    </tr>

                  )
                  : (

                    paginatedRelays.map(
                      relay => {

                        const isOnline =
                          String(
                            relay?.status ||
                            ''
                          )
                            .toUpperCase()
                            ===
                            'ONLINE';


                        return (

                          <tr
                            key={
                              relay.id
                            }
                            className="
                              table-row-hoverable
                            "
                          >

                            <td
                              className="
                                font-mono
                                font-bold
                              "
                            >
                              {
                                relay.id
                              }
                            </td>


                            <td
                              className="
                                victim-name-cell
                              "
                            >
                              {
                                relay.name
                              }
                            </td>


                            <td>

                              {
                                isOnline
                                  ? (

                                    <span
                                      className="
                                        flex-align
                                        font-mono
                                        font-bright
                                      "
                                    >

                                      <Signal
                                        size={14}
                                        color=
                                          "var(--accent-glow)"
                                      />

                                      {
                                        relay.rssi
                                      }

                                      {' '}dBm

                                      {' '}

                                      (
                                      SNR:
                                      {' '}

                                      {
                                        relay.snr
                                      }

                                      {' '}dB
                                      )

                                    </span>

                                  )
                                  : (

                                    <span
                                      className="
                                        text-muted
                                      "
                                    >
                                      -- / --
                                    </span>

                                  )
                              }

                            </td>


                            <td>

                              <span
                                className="
                                  flex-align
                                  font-mono
                                "
                              >

                                <Battery
                                  size={14}
                                />

                                {' '}

                                {
                                  relay.battery
                                }%

                              </span>

                            </td>


                            <td
                              className="
                                font-mono
                              "
                            >
                              {
                                relay.packetCount
                              }
                            </td>


                            <td>

                              <span
                                className={
                                  `
                                    badge
                                    badge-${
                                      String(
                                        relay.status ||
                                        'UNKNOWN'
                                      ).toLowerCase()
                                    }
                                    badge-large
                                  `
                                }
                              >

                                {
                                  relay.status
                                }

                              </span>

                            </td>

                          </tr>

                        );

                      }
                    )

                  )
              }

            </tbody>

          </table>

        </div>


        {/* =================================================
            PAGINATION
        ================================================= */}

        <div
          className="
            pagination-wrapper
            flex-between
          "
        >

          <div
            className="
              pagination-left
              flex-align
            "
          >

            <span
              className="
                pagination-info
              "
            >

              Showing

              {' '}

              {
                totalRecords === 0
                  ? 0
                  : startIndex + 1
              }

              –

              {
                endIndex
              }

              {' '}of{' '}

              {
                totalRecords
              }

              {' '}records

            </span>


            <div
              className="
                rows-per-page
                flex-align
              "
            >

              <span
                className="
                  rows-label
                "
              >
                Rows per page:
              </span>


              <select
                value={
                  pageSize
                }

                onChange={
                  event => {

                    setPageSize(
                      Number(
                        event.target.value
                      )
                    );

                    setCurrentPage(
                      1
                    );

                  }
                }

                className="
                  rows-selector
                "
              >

                <option value={10}>
                  10
                </option>

                <option value={25}>
                  25
                </option>

                <option value={50}>
                  50
                </option>

                <option value={100}>
                  100
                </option>

              </select>

            </div>

          </div>


          <div
            className="
              pagination-right
              flex-align
            "
          >

            <button
              className={
                `
                  pagination-btn
                  ${
                    currentPage === 1
                      ? 'disabled-btn'
                      : ''
                  }
                `
              }

              onClick={
                handlePrev
              }

              disabled={
                currentPage === 1
              }
            >

              <ChevronLeft
                size={14}
              />

              <span>
                Previous
              </span>

            </button>


            <div
              className="
                page-numbers-row
              "
            >

              {
                Array.from({
                  length:
                    totalPages
                }).map(
                  (_, index) => {

                    const page =
                      index + 1;


                    return (

                      <button
                        key={
                          page
                        }

                        onClick={() =>
                          setCurrentPage(
                            page
                          )
                        }

                        className={
                          `
                            page-num-btn
                            ${
                              currentPage === page
                                ? 'active-page-btn'
                                : ''
                            }
                          `
                        }
                      >

                        {
                          page
                        }

                      </button>

                    );

                  }
                )
              }

            </div>


            <button
              className={
                `
                  pagination-btn
                  ${
                    currentPage ===
                    totalPages
                      ? 'disabled-btn'
                      : ''
                  }
                `
              }

              onClick={
                handleNext
              }

              disabled={
                currentPage ===
                totalPages
              }
            >

              <span>
                Next
              </span>

              <ChevronRight
                size={14}
              />

            </button>

          </div>

        </div>

      </div>

    </div>
  );
};


export default RelayMonitoring;