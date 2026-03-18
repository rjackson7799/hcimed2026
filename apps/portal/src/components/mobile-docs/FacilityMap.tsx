import { MapContainer, TileLayer, CircleMarker, Circle, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Facility, FacilityStatus, FacilityCensus } from '@/types/mobile-docs';
import {
  HCI_BASE_LOCATION,
  SERVICE_RADIUS_METERS,
  MAP_PIN_COLORS,
  MAP_PIN_SIZE,
} from '@/lib/mobile-docs-constants';
import { FacilityMapTooltip } from './FacilityMapTooltip';
import { FacilityMapLegend } from './FacilityMapLegend';

interface FacilityMapProps {
  facilities: Facility[];
  censusMap: Map<string, FacilityCensus>;
  onFacilityClick: (facilityId: string) => void;
}

function getPinRadius(activePatients: number): number {
  const ratio = Math.min(activePatients / MAP_PIN_SIZE.maxPatients, 1);
  return MAP_PIN_SIZE.min + ratio * (MAP_PIN_SIZE.max - MAP_PIN_SIZE.min);
}

function getStatusStyle(status: FacilityStatus): {
  opacity: number;
  fillOpacity: number;
  dashArray?: string;
  weight: number;
} {
  switch (status) {
    case 'Active':
      return { opacity: 1, fillOpacity: 0.85, weight: 2 };
    case 'Onboarding':
      return { opacity: 0.8, fillOpacity: 0.6, weight: 2 };
    case 'Prospecting':
      return { opacity: 1, fillOpacity: 0.3, dashArray: '4 4', weight: 2 };
    case 'Inactive':
      return { opacity: 0.3, fillOpacity: 0.3, weight: 1 };
  }
}

const hciIcon = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;background:#dc2626;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"><span style="color:white;font-weight:bold;font-size:10px">HCI</span></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export function FacilityMap({ facilities, censusMap, onFacilityClick }: FacilityMapProps) {
  const center: [number, number] = [HCI_BASE_LOCATION.latitude, HCI_BASE_LOCATION.longitude];

  return (
    <div className="relative h-[calc(100vh-220px)] min-h-[500px] rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={12}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 25-mile service radius */}
        <Circle
          center={center}
          radius={SERVICE_RADIUS_METERS}
          pathOptions={{
            color: '#6366f1',
            weight: 2,
            dashArray: '8 6',
            fillColor: '#6366f1',
            fillOpacity: 0.04,
          }}
        />

        {/* HCI Base marker */}
        <Marker position={center} icon={hciIcon}>
          <Tooltip direction="top" offset={[0, -16]}>
            <span className="font-semibold text-sm">HCI Medical Group</span>
            <br />
            <span className="text-xs text-muted-foreground">Pasadena, CA 91101</span>
          </Tooltip>
        </Marker>

        {/* Facility pins */}
        {facilities.map((facility) => {
          const census = censusMap.get(facility.id);
          const activePatients = census?.active_patients ?? 0;
          const pinColor = MAP_PIN_COLORS[facility.type];
          const pinRadius = getPinRadius(activePatients);
          const statusStyle = getStatusStyle(facility.status);

          return (
            <CircleMarker
              key={facility.id}
              center={[facility.latitude, facility.longitude]}
              radius={pinRadius}
              pathOptions={{
                color: pinColor,
                fillColor: pinColor,
                ...statusStyle,
              }}
              eventHandlers={{
                click: () => onFacilityClick(facility.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -pinRadius]}>
                <FacilityMapTooltip facility={facility} activePatients={activePatients} />
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <FacilityMapLegend />
    </div>
  );
}
