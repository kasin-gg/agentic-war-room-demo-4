'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useDemoDirector } from '../useDemoDirector';

interface IncidentMapLayerProps {
  map: maplibregl.Map | null;
}

// Generate curved arc coordinates (great-circle style arc curve)
function generateArcCoords(
  start: [number, number],
  end: [number, number],
  numPoints = 50
): [number, number][] {
  const points: [number, number][] = [];
  const [lng1, lat1] = start;
  const [lng2, lat2] = end;

  // Midpoint height curve calculation
  const midLng = (lng1 + lng2) / 2;
  const midLat = (lat1 + lat2) / 2;

  // Distance for arc curvature height offset
  const dx = lng2 - lng1;
  const dy = lat2 - lat1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const arcHeight = Math.min(dist * 0.15, 12); // proportional arc lift

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Quadratic bezier interpolation for smooth curved arc trajectory
    const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * midLng + t * t * lng2;
    const lat =
      (1 - t) * (1 - t) * lat1 +
      2 * (1 - t) * t * (midLat + arcHeight) +
      t * t * lat2;
    points.push([lng, lat]);
  }

  return points;
}

export default function IncidentMapLayer({ map }: IncidentMapLayerProps) {
  const director = useDemoDirector();
  const { nodes, arcs, phase, reset } = director;
  const animationFrameRef = useRef<number | null>(null);

  // Maintain MapLibre layers & sources reactively
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const nodesSourceId = 'osiris-incident-nodes-source';
    const arcsSourceId = 'osiris-incident-arcs-source';

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
        geometry: {
          type: 'Point' as const,
          coordinates: node.coords,
        },
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
    const arcFeatures = arcs.map((arc) => {
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
        geometry: {
          type: 'LineString' as const,
          coordinates: curveCoords,
        },
        properties: {
          id: arc.id,
          style: arc.style,
          color,
        },
      };
    }).filter(Boolean);

    const arcsGeoJSON = {
      type: 'FeatureCollection' as const,
      features: arcFeatures as any[],
    };

    // Update or Create Sources
    if (map.getSource(nodesSourceId)) {
      (map.getSource(nodesSourceId) as maplibregl.GeoJSONSource).setData(nodesGeoJSON);
    } else {
      map.addSource(nodesSourceId, {
        type: 'geojson',
        data: nodesGeoJSON,
      });
    }

    if (map.getSource(arcsSourceId)) {
      (map.getSource(arcsSourceId) as maplibregl.GeoJSONSource).setData(arcsGeoJSON);
    } else {
      map.addSource(arcsSourceId, {
        type: 'geojson',
        data: arcsGeoJSON,
      });
    }

    // Add MapLibre Layers if missing
    // 1. Arc Base Line Layer
    if (!map.getLayer('osiris-incident-arcs-line')) {
      map.addLayer({
        id: 'osiris-incident-arcs-line',
        type: 'line',
        source: arcsSourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
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
        source: nodesSourceId,
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
        source: nodesSourceId,
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'role'], 'hq'],
            6,
            4,
          ],
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
        source: nodesSourceId,
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
  }, [map, nodes, arcs, phase]);

  // Handle Camera Choreography smoothly on phase transitions
  useEffect(() => {
    if (!map) return;

    if (phase === 2) {
      // Gentle camera ease toward SE Asia disrupted hub
      map.easeTo({
        center: [103.8198, 1.3521], // Meridian Port Hub coords
        zoom: 5.5,
        duration: 2500,
        pitch: 25,
      });
    } else if (phase === 5) {
      // Gentle camera ease out to view complete regional network
      map.easeTo({
        center: [118.0, 18.0],
        zoom: 3.8,
        duration: 2500,
        pitch: 15,
      });
    } else if (phase === 0) {
      // Camera reset on phase 0
      map.easeTo({
        center: [110.0, 15.0],
        zoom: 3.5,
        duration: 1500,
        pitch: 0,
      });
    }
  }, [map, phase]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return null;
}
