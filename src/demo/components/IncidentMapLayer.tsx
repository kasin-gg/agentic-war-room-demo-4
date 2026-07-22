'use client';

import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { useDemoDirector } from '../useDemoDirector';

interface IncidentMapLayerProps {
  map: maplibregl.Map | null;
  lightMode?: boolean;
}

const NODES_SOURCE_ID = 'osiris-incident-nodes-source';
const ARCS_SOURCE_ID = 'osiris-incident-arcs-source';
const LAYER_IDS = [
  'osiris-incident-arcs-line',
  'osiris-incident-nodes-glow',
  'osiris-incident-nodes-core',
  'osiris-incident-nodes-label',
];

// Generate curved arc coordinates (great-circle style arc curve)
function generateArcCoords(
  start: [number, number],
  end: [number, number],
  numPoints = 50
): [number, number][] {
  const points: [number, number][] = [];
  const [lng1, lat1] = start;
  const [lng2, lat2] = end;

  const midLng = (lng1 + lng2) / 2;
  const midLat = (lat1 + lat2) / 2;

  const dx = lng2 - lng1;
  const dy = lat2 - lat1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const arcHeight = Math.min(dist * 0.15, 12); // proportional arc lift

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * midLng + t * t * lng2;
    const lat =
      (1 - t) * (1 - t) * lat1 +
      2 * (1 - t) * t * (midLat + arcHeight) +
      t * t * lat2;
    points.push([lng, lat]);
  }

  return points;
}

export default function IncidentMapLayer({ map, lightMode = false }: IncidentMapLayerProps) {
  const director = useDemoDirector();
  const { nodes, arcs, phase } = director;

  // Maintain MapLibre layers & sources reactively
  useEffect(() => {
    if (!map) return;

    const applyLayers = () => {
      // Prepare Node Features
      const nodeFeatures = nodes.map((node) => {
        const isDisrupted = node.role === 'disrupted' && phase >= 2 && phase < 5;
        const statusColor =
          node.status === 'critical'
            ? '#FF2828'
            : node.status === 'warning'
            ? '#FF9500'
            : node.status === 'candidate'
            ? '#00BCD4'
            : node.status === 'offline'
            ? '#546E7A'
            : '#00FF80';

        return {
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: node.coords },
          properties: {
            id: node.id,
            name: node.name,
            label: `[SIMULATION] ${node.label.toUpperCase()}`,
            role: node.role,
            status: node.status,
            color: statusColor,
            isDisrupted,
          },
        };
      });

      const nodesGeoJSON = {
        type: 'FeatureCollection' as const,
        features: nodeFeatures,
      };

      // Prepare Arc Features
      const arcFeatures = arcs
        .map((arc) => {
          const sourceNode = nodes.find((n) => n.id === arc.source);
          const targetNode = nodes.find((n) => n.id === arc.target);
          if (!sourceNode || !targetNode) return null;

          const curveCoords = generateArcCoords(sourceNode.coords, targetNode.coords);

          const color =
            arc.style === 'critical'
              ? '#FF2828'
              : arc.style === 'candidate'
              ? '#00BCD4'
              : arc.style === 'reroute'
              ? '#00FF80'
              : '#00FF80';

          return {
            type: 'Feature' as const,
            geometry: { type: 'LineString' as const, coordinates: curveCoords },
            properties: { id: arc.id, style: arc.style, color },
          };
        })
        .filter((f): f is NonNullable<typeof f> => f !== null);

      const arcsGeoJSON = {
        type: 'FeatureCollection' as const,
        features: arcFeatures,
      };

      // Update or Create Sources
      if (map.getSource(NODES_SOURCE_ID)) {
        (map.getSource(NODES_SOURCE_ID) as maplibregl.GeoJSONSource).setData(nodesGeoJSON);
      } else {
        map.addSource(NODES_SOURCE_ID, { type: 'geojson', data: nodesGeoJSON });
      }

      if (map.getSource(ARCS_SOURCE_ID)) {
        (map.getSource(ARCS_SOURCE_ID) as maplibregl.GeoJSONSource).setData(arcsGeoJSON);
      } else {
        map.addSource(ARCS_SOURCE_ID, { type: 'geojson', data: arcsGeoJSON });
      }

      // 1. Arc Base Line Layer
      if (!map.getLayer('osiris-incident-arcs-line')) {
        map.addLayer({
          id: 'osiris-incident-arcs-line',
          type: 'line',
          source: ARCS_SOURCE_ID,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': [
              'case',
              ['==', ['get', 'style'], 'reroute'],
              3.5,
              ['==', ['get', 'style'], 'critical'],
              2.5,
              2,
            ],
            'line-opacity': [
              'case',
              ['==', ['get', 'style'], 'candidate'],
              0.6,
              0.85,
            ],
            'line-dasharray': [
              'case',
              ['==', ['get', 'style'], 'candidate'],
              ['literal', [2, 3]],
              ['==', ['get', 'style'], 'critical'],
              ['literal', [4, 4]],
              ['literal', [1, 0]],
            ],
          },
        });
      }

      // 2. Node Outer Glow Circle
      if (!map.getLayer('osiris-incident-nodes-glow')) {
        map.addLayer({
          id: 'osiris-incident-nodes-glow',
          type: 'circle',
          source: NODES_SOURCE_ID,
          paint: {
            'circle-radius': [
              'case',
              ['==', ['get', 'role'], 'hq'],
              16,
              ['==', ['get', 'status'], 'critical'],
              20,
              12,
            ],
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.25,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': ['get', 'color'],
            'circle-stroke-opacity': 0.8,
          },
        });
      }

      // 3. Node Center Solid Core
      if (!map.getLayer('osiris-incident-nodes-core')) {
        map.addLayer({
          id: 'osiris-incident-nodes-core',
          type: 'circle',
          source: NODES_SOURCE_ID,
          paint: {
            'circle-radius': ['case', ['==', ['get', 'role'], 'hq'], 6, 4],
            'circle-color': '#FFFFFF',
            'circle-stroke-width': 2,
            'circle-stroke-color': ['get', 'color'],
          },
        });
      }

      // 4. Node Label Text (Monospace, clear SIMULATION tag)
      if (!map.getLayer('osiris-incident-nodes-label')) {
        map.addLayer({
          id: 'osiris-incident-nodes-label',
          type: 'symbol',
          source: NODES_SOURCE_ID,
          layout: {
            'text-field': ['get', 'label'],
            'text-size': 11,
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-offset': [0, 1.6],
            'text-anchor': 'top',
            'text-allow-overlap': true,
          },
          paint: {
            'text-color': ['get', 'color'],
            'text-halo-color': '#000000',
            'text-halo-width': 2,
          },
        });
      }

      // Node contrast for the current basemap: dark map → white core + subtle
      // glow; light map → dark core + stronger glow (so nodes read on Positron).
      if (map.getLayer('osiris-incident-nodes-core')) {
        map.setPaintProperty('osiris-incident-nodes-core', 'circle-color', lightMode ? '#0F172A' : '#FFFFFF');
      }
      if (map.getLayer('osiris-incident-nodes-glow')) {
        map.setPaintProperty('osiris-incident-nodes-glow', 'circle-opacity', lightMode ? 0.45 : 0.25);
      }
    };

    // Guard the style-load race: if the style isn't ready yet, apply once it is.
    if (map.isStyleLoaded()) {
      applyLayers();
      return;
    }
    map.once('styledata', applyLayers);
    return () => {
      map.off('styledata', applyLayers);
    };
  }, [map, nodes, arcs, phase, lightMode]);

  // Handle Camera Choreography smoothly on phase transitions (config-driven).
  useEffect(() => {
    if (!map) return;

    const disruptedNode = nodes.find((n) => n.role === 'disrupted');
    // Network centroid for the calm / recovered wide shots.
    const centroid: [number, number] = nodes.length
      ? [
          nodes.reduce((s, n) => s + n.coords[0], 0) / nodes.length,
          nodes.reduce((s, n) => s + n.coords[1], 0) / nodes.length,
        ]
      : [110.0, 15.0];

    if (phase === 2 && disruptedNode) {
      // Gentle camera ease toward the disrupted hub
      map.easeTo({ center: disruptedNode.coords, zoom: 5.5, duration: 2500, pitch: 25 });
    } else if (phase === 5) {
      // Gentle camera ease out to view the recovered network
      map.easeTo({ center: centroid, zoom: 3.8, duration: 2500, pitch: 15 });
    }
    // Phase 0 framing is owned by the Global Twin intro descent (page.tsx),
    // so this layer intentionally makes no camera move at phase 0.
  }, [map, phase, nodes]);

  // Remove our sources/layers when the map changes or on unmount (no leaks).
  useEffect(() => {
    if (!map) return;
    return () => {
      try {
        LAYER_IDS.forEach((id) => {
          if (map.getLayer(id)) map.removeLayer(id);
        });
        [NODES_SOURCE_ID, ARCS_SOURCE_ID].forEach((id) => {
          if (map.getSource(id)) map.removeSource(id);
        });
      } catch {
        // Map may already be torn down; nothing to clean up.
      }
    };
  }, [map]);

  return null;
}
