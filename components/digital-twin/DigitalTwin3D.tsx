'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWorkspace, WhatIfScenario } from '@/components/shared/WorkspaceContext';
import { ViewportControls } from '@/components/shared/ViewportControls';
import * as THREE from 'three';
import {
  Boxes,
  Activity,
  Layers,
  Flame,
  AlertTriangle,
  RotateCw,
  Gauge,
  Thermometer,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export function DigitalTwin3D() {
  const {
    twinHotspots,
    selectedHotspotId,
    setSelectedHotspotId,
    whatIfScenario,
    setWhatIfScenario,
    toggleBreakerState,
    sharedTags,
  } = useWorkspace();

  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraAngle, setCameraAngle] = useState<'front' | 'iso' | 'top'>('iso');
  const [isPanMode, setIsPanMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const isPanModeRef = useRef(false);
  const controlsRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    zoomToFit: () => void;
    resetView: () => void;
  } | null>(null);

  useEffect(() => {
    isPanModeRef.current = isPanMode;
  }, [isPanMode]);

  const selectedHotspot = twinHotspots.find(h => h.id === selectedHotspotId) || twinHotspots[0];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0B0D10');

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const targetLookAt = new THREE.Vector3(0, 1.2, 0);
    camera.position.set(5, 5, 8);
    camera.lookAt(targetLookAt);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const amberPointLight = new THREE.PointLight(0xf59e0b, 2, 15);
    amberPointLight.position.set(-1, 3, 2);
    scene.add(amberPointLight);

    // Industrial Grid Floor
    const gridHelper = new THREE.GridHelper(20, 20, 0xf59e0b, 0x232833);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 3D Switchgear Panel Cubicles (CCM - Centro de Controle de Motores)
    const cubicleGroup = new THREE.Group();

    // Materials
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x161a22,
      roughness: 0.4,
      metalness: 0.8,
    });
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x1f2633,
      roughness: 0.5,
      metalness: 0.7,
    });
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.3,
      metalness: 0.9,
    });
    const greenLedMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const redLedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    // Build 4 Cubicles
    for (let i = 0; i < 4; i++) {
      const xPos = (i - 1.5) * 1.6;

      // Cubicle Frame
      const boxGeo = new THREE.BoxGeometry(1.5, 3.2, 1.4);
      const cubicle = new THREE.Mesh(boxGeo, darkMetalMat);
      cubicle.position.set(xPos, 1.6, 0);
      cubicle.castShadow = true;
      cubicle.receiveShadow = true;
      cubicleGroup.add(cubicle);

      // Front Doors (Drawer Modules)
      for (let d = 0; d < 3; d++) {
        const doorGeo = new THREE.BoxGeometry(1.4, 0.9, 0.05);
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(xPos, 0.6 + d * 1.0, 0.72);
        cubicleGroup.add(door);

        // Status LED
        const ledGeo = new THREE.SphereGeometry(0.04, 16, 16);
        const isFault = whatIfScenario === 'overload_trip' && i === 1;
        const led = new THREE.Mesh(ledGeo, isFault ? redLedMat : greenLedMat);
        led.position.set(xPos + 0.55, 0.6 + d * 1.0 + 0.3, 0.76);
        cubicleGroup.add(led);
      }
    }

    // Busbar Duct on Top
    const busDuctGeo = new THREE.BoxGeometry(6.6, 0.4, 0.6);
    const busDuct = new THREE.Mesh(busDuctGeo, copperMat);
    busDuct.position.set(-0.1, 3.4, 0);
    cubicleGroup.add(busDuct);

    // Motor 3D Model next to CCM
    const motorGroup = new THREE.Group();
    motorGroup.position.set(3.2, 0, 1.5);

    // Motor Body Cylinder
    const motorGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 24);
    const motorMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.4,
      metalness: 0.6,
    });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(0, 0.6, 0);
    motorGroup.add(motor);

    // Motor Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.set(0.8, 0.6, 0);
    motorGroup.add(shaft);

    cubicleGroup.add(motorGroup);
    scene.add(cubicleGroup);

    // Viewport control methods
    const zoomBy = (factor: number) => {
      const dir = new THREE.Vector3().subVectors(camera.position, targetLookAt);
      const currentDist = dir.length();
      const newDist = Math.max(3.5, Math.min(22, currentDist * factor));
      dir.normalize().multiplyScalar(newDist);
      camera.position.copy(targetLookAt).add(dir);
      camera.lookAt(targetLookAt);
      const norm = Number((10 / newDist).toFixed(2));
      setZoomLevel(norm);
    };

    const resetView = () => {
      targetLookAt.set(0, 1.2, 0);
      camera.position.set(5, 5, 8);
      camera.lookAt(targetLookAt);
      cubicleGroup.position.set(0, 0, 0);
      cubicleGroup.rotation.set(0, 0, 0);
      setZoomLevel(1);
    };

    const zoomToFit = () => {
      targetLookAt.set(0, 1.5, 0);
      camera.position.set(4.2, 4.0, 7.0);
      camera.lookAt(targetLookAt);
      cubicleGroup.position.set(0, 0, 0);
      cubicleGroup.rotation.set(0, -0.15, 0);
      setZoomLevel(1.2);
    };

    controlsRef.current = {
      zoomIn: () => zoomBy(0.85),
      zoomOut: () => zoomBy(1.15),
      zoomToFit,
      resetView,
    };

    // Interactive Drag Controls
    let isMouseDown = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      if (isPanModeRef.current) {
        // Pan Mode: translate camera and targetLookAt parallel to screen plane
        const factor = 0.012;
        const right = new THREE.Vector3();
        camera.getWorldDirection(right);
        right.cross(camera.up).normalize();

        const up = camera.up.clone().normalize();

        camera.position.addScaledVector(right, -deltaX * factor);
        targetLookAt.addScaledVector(right, -deltaX * factor);

        camera.position.addScaledVector(up, deltaY * factor);
        targetLookAt.addScaledVector(up, deltaY * factor);
        camera.lookAt(targetLookAt);
      } else {
        // Orbit Mode: rotate cubicleGroup and adjust camera elevation
        cubicleGroup.rotation.y += deltaX * 0.006;
        camera.position.y = Math.max(1, Math.min(10, camera.position.y - deltaY * 0.02));
        camera.lookAt(targetLookAt);
      }

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 0.9 : 1.1;
      zoomBy(factor);
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', (e) => {
      previousMousePosition = { x: e.clientX, y: e.clientY };
      onMouseDown(e);
    });
    domElem.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate motor shaft if compressor is energized
      shaft.rotation.x += 0.08;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('wheel', onWheel);
      domElem.remove();
      renderer.dispose();
    };
  }, [whatIfScenario]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] text-slate-200 select-none overflow-hidden">
      {/* Top Banner */}
      <div className="h-12 px-6 bg-[#11141A] border-b border-[#232833] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Boxes className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-slate-100 uppercase tracking-wider">
                Digital Twin 3D (Gêmeo Digital com WebGL)
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                CCM-01 TTA/PTTA NBR IEC 61439
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Controles: Botão esquerdo para girar 3D | Telemetria sincronizada com Shared Tags
            </p>
          </div>
        </div>

        {/* What-If Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Cenário E-se?:</span>
          <select
            value={whatIfScenario}
            onChange={e => setWhatIfScenario(e.target.value as WhatIfScenario)}
            className="bg-[#161A22] border border-[#232833] text-amber-300 text-xs font-mono rounded px-2 py-1 outline-none cursor-pointer"
          >
            <option value="normal">Operação Normal</option>
            <option value="overload_trip">Sobrecarga 150% (Trip)</option>
            <option value="high_temp">Falha Ventilação (85°C)</option>
            <option value="grid_failure">Queda Concessionária MT</option>
          </select>
        </div>
      </div>

      {/* Main 3D Canvas & Hotspot Telemetry Dashboard */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Three.js Viewport */}
        <div className="flex-1 bg-[#11141A] border border-[#232833] rounded-lg relative overflow-hidden shadow-inner flex flex-col">
          {/* Top 3D Hotspot Selection Tabs */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-[#0B0D10]/80 backdrop-blur border border-[#232833] p-1 rounded">
            {twinHotspots.map(h => (
              <button
                key={h.id}
                onClick={() => setSelectedHotspotId(h.id)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                  selectedHotspotId === h.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {h.tag}
              </button>
            ))}
          </div>

          {/* WebGL Canvas Mount */}
          <div
            ref={mountRef}
            className={`w-full h-full ${
              isPanMode
                ? 'cursor-grab active:cursor-grabbing'
                : 'cursor-grab active:cursor-grabbing'
            }`}
          />

          {/* Floating Viewport Controls Toolbar */}
          <ViewportControls
            onZoomIn={() => controlsRef.current?.zoomIn()}
            onZoomOut={() => controlsRef.current?.zoomOut()}
            zoomLevel={zoomLevel}
            onZoomToFit={() => controlsRef.current?.zoomToFit()}
            onResetView={() => controlsRef.current?.resetView()}
            isPanMode={isPanMode}
            onTogglePanMode={() => setIsPanMode(prev => !prev)}
            position="bottom-right"
            label="3D WebGL"
          />
        </div>

        {/* Live Telemetry Panel */}
        <div className="w-84 bg-[#11141A] border border-[#232833] rounded-lg p-5 flex flex-col gap-4 text-xs font-mono select-none overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-[#232833]">
            <div>
              <span className="font-bold text-amber-400 text-sm">{selectedHotspot.tag}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">{selectedHotspot.name}</p>
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                selectedHotspot.telemetry.breakerClosed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              {selectedHotspot.telemetry.breakerClosed ? 'ENERGIZADO' : 'TRIP'}
            </span>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] uppercase text-slate-400 font-bold">Grandezas RMS em Tempo Real</span>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#161A22] p-2.5 rounded border border-[#232833]">
                <span className="text-slate-500 text-[10px]">Tensão L1-L2</span>
                <p className="text-slate-100 font-bold text-sm">
                  {selectedHotspot.telemetry.voltageL1L2} <span className="text-amber-400 text-xs">V</span>
                </p>
              </div>
              <div className="bg-[#161A22] p-2.5 rounded border border-[#232833]">
                <span className="text-slate-500 text-[10px]">Corrente L1</span>
                <p className="text-slate-100 font-bold text-sm">
                  {selectedHotspot.telemetry.currentL1} <span className="text-cyan-400 text-xs">A</span>
                </p>
              </div>
              <div className="bg-[#161A22] p-2.5 rounded border border-[#232833]">
                <span className="text-slate-500 text-[10px]">Potência Ativa</span>
                <p className="text-slate-100 font-bold text-sm">
                  {selectedHotspot.telemetry.activePowerKw} <span className="text-emerald-400 text-xs">kW</span>
                </p>
              </div>
              <div className="bg-[#161A22] p-2.5 rounded border border-[#232833]">
                <span className="text-slate-500 text-[10px]">Fator de Potência</span>
                <p className="text-slate-100 font-bold text-sm">
                  {selectedHotspot.telemetry.powerFactor} <span className="text-purple-400 text-xs">cos φ</span>
                </p>
              </div>
            </div>

            {/* Thermal & Vibration Sensor */}
            <div className="bg-[#161A22] p-3 rounded border border-[#232833] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-400" />
                <div>
                  <span className="text-slate-400 text-[10px]">Temperatura Termográfica</span>
                  <p className="text-slate-100 font-bold text-sm">
                    {selectedHotspot.telemetry.temperatureCelsius} °C
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Faixa Segura</span>
            </div>
          </div>

          {/* Quick Breaker Switch */}
          <div className="mt-auto pt-3 border-t border-[#232833]">
            <button
              onClick={() => toggleBreakerState(selectedHotspot.tag)}
              className="w-full py-2 rounded bg-[#161A22] hover:bg-[#232833] border border-[#232833] text-xs font-bold text-slate-200 transition-colors"
            >
              Comutar Disjuntor {selectedHotspot.tag}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
