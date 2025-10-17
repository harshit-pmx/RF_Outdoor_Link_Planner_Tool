import { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { MapView } from './components/MapView';
import { ControlPanel } from './components/ControlPanel';
import { EditModal } from './components/EditModal';
import { Toast } from './components/Toast';
import { Tower, Link, FresnelZone } from './types';
import { calculateDistance } from './utils/calculations';
import { handleLinkClick_ShowFresnel } from './utils/handleLinkClick_ShowFresnel.js';

function App() {
  const [towers, setTowers] = useState<Tower[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [mode, setMode] = useState<'add' | 'edit' | 'link' | 'delete' | null>(null);
  const [selectedTowers, setSelectedTowers] = useState<string[]>([]);
  const [editingTower, setEditingTower] = useState<Tower | null>(null);
  const [fresnelZone, setFresnelZone] = useState<FresnelZone | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const fresnelCleanupRef = useRef<(() => void) | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (mode === 'add') {
      const newTower: Tower = {
        id: `T${towers.length + 1}`,
        name: `Tower ${towers.length + 1}`,
        lat,
        lng,
        frequency: 2.4,
      };
      setTowers([...towers, newTower]);
      showToast(`Tower ${newTower.name} added`, 'success');
    }
  };

  const handleTowerClick = (towerId: string) => {
    if (mode === 'edit') {
      const tower = towers.find((t) => t.id === towerId);
      if (tower) {
        setEditingTower(tower);
      }
    } else if (mode === 'link') {
      if (selectedTowers.includes(towerId)) {
        setSelectedTowers(selectedTowers.filter((id) => id !== towerId));
      } else if (selectedTowers.length < 2) {
        const newSelected = [...selectedTowers, towerId];
        setSelectedTowers(newSelected);

        if (newSelected.length === 2) {
          const towerA = towers.find((t) => t.id === newSelected[0]);
          const towerB = towers.find((t) => t.id === newSelected[1]);

          if (towerA && towerB) {
            if (towerA.frequency !== towerB.frequency) {
              showToast('❌ Towers must have the same frequency to form a link.', 'error');
              setSelectedTowers([]);
            } else {
              const distance = calculateDistance(towerA.lat, towerA.lng, towerB.lat, towerB.lng);
              const newLink: Link = {
                id: `L${links.length + 1}`,
                towerAId: towerA.id,
                towerBId: towerB.id,
                frequency: towerA.frequency,
                distance,
              };
              setLinks([...links, newLink]);
              setSelectedTowers([]);
              showToast(`Link ${newLink.id} created`, 'success');
            }
          }
        }
      }
    } else if (mode === 'delete') {
      const tower = towers.find((t) => t.id === towerId);
      setTowers(towers.filter((t) => t.id !== towerId));
      setLinks(links.filter((l) => l.towerAId !== towerId && l.towerBId !== towerId));
      if (fresnelCleanupRef.current) {
        fresnelCleanupRef.current();
        fresnelCleanupRef.current = null;
      }
      setFresnelZone(null);
      showToast(`Tower ${tower?.name || towerId} deleted`, 'success');
    }
  };

  const handleLinkClick = async (linkId: string) => {
    const link = links.find((l) => l.id === linkId);
    if (!link) return;

    if (mode === 'delete') {
      setLinks(links.filter((l) => l.id !== linkId));
      showToast(`Link ${linkId} deleted`, 'success');
      if (fresnelZone?.linkId === linkId) {
        if (fresnelCleanupRef.current) {
          fresnelCleanupRef.current();
          fresnelCleanupRef.current = null;
        }
        setFresnelZone(null);
      }
    } else {
      const towerA = towers.find((t) => t.id === link.towerAId);
      const towerB = towers.find((t) => t.id === link.towerBId);

      if (towerA && towerB && mapRef.current) {
        if (fresnelCleanupRef.current) {
          fresnelCleanupRef.current();
          fresnelCleanupRef.current = null;
        }

        const result = await handleLinkClick_ShowFresnel({
          map: mapRef.current,
          latlngA: { lat: towerA.lat, lng: towerA.lng },
          latlngB: { lat: towerB.lat, lng: towerB.lng },
          frequencyGHz: link.frequency,
          onError: (err: string) => showToast(err, 'error')
        });

        if (result) {
          fresnelCleanupRef.current = result.remove;
          const distanceKm = result.meta.totalDistanceMeters / 1000;
          setFresnelZone({
            linkId: link.id,
            centerLat: (towerA.lat + towerB.lat) / 2,
            centerLng: (towerA.lng + towerB.lng) / 2,
            radiusMeters: result.meta.fresnelRadiusMeters,
            distance: distanceKm,
            frequency: link.frequency,
          });
          showToast(
            `Fresnel zone displayed. Elevation: ${result.meta.elevPoints[0].elevation}m - ${result.meta.elevPoints[1].elevation}m`,
            'success'
          );
        }
      }
    }
  };

  const handleTowerSave = (towerId: string, name: string, frequency: number) => {
    setTowers(
      towers.map((t) => (t.id === towerId ? { ...t, name, frequency } : t))
    );
    setLinks(
      links.filter((l) => {
        if (l.towerAId === towerId || l.towerBId === towerId) {
          const otherTowerId = l.towerAId === towerId ? l.towerBId : l.towerAId;
          const otherTower = towers.find((t) => t.id === otherTowerId);
          return otherTower && otherTower.frequency === frequency;
        }
        return true;
      })
    );
    showToast(`Tower ${name} updated`, 'success');
  };

  const handleTowerDelete = (towerId: string) => {
    const tower = towers.find((t) => t.id === towerId);
    setTowers(towers.filter((t) => t.id !== towerId));
    setLinks(links.filter((l) => l.towerAId !== towerId && l.towerBId !== towerId));
    if (fresnelCleanupRef.current) {
      fresnelCleanupRef.current();
      fresnelCleanupRef.current = null;
    }
    setFresnelZone(null);
    showToast(`Tower ${tower?.name || towerId} deleted`, 'success');
  };

  useEffect(() => {
    return () => {
      if (fresnelCleanupRef.current) {
        fresnelCleanupRef.current();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <MapView
        towers={towers}
        links={links}
        mode={mode}
        selectedTowers={selectedTowers}
        mapRef={mapRef}
        onMapClick={handleMapClick}
        onTowerClick={handleTowerClick}
        onLinkClick={handleLinkClick}
      />
      <ControlPanel mode={mode} onModeChange={setMode} />
      {editingTower && (
        <EditModal
          tower={editingTower}
          onSave={handleTowerSave}
          onDelete={handleTowerDelete}
          onClose={() => setEditingTower(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
