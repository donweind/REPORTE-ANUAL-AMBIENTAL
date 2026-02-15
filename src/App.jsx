import React, { useState, useMemo, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Database,
  Recycle,
  AlertTriangle,
  Zap,
  Droplets,
  MousePointerClick,
  MapPin,
  Maximize2,
  X,
  TrendingUp,
  Filter,
  Leaf // Se agregó la importación que faltaba
} from 'lucide-react';

// --- GENERADOR DE DATOS MENSUALES (SIMULACIÓN OPTIMIZADA) ---
const generateMonthlyTrend = (total, label) => {
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const baseAvg = total / 12;
  
  return months.map((month, index) => {
    // Variación matemática determinista para evitar saltos en re-renders
    const variation = 1 + (Math.sin(index * 0.8) * 0.15); 
    return {
      mes: month,
      valor: Number((baseAvg * variation).toFixed(2)),
      material: label
    };
  });
};

// --- DATOS MATRIZ POR SEDE (CONSTANTES FUERA DEL COMPONENTE PARA MEJORAR PERFORMANCE) ---
const DATA_BY_LOCATION = {
  TOTAL: {
    label: "SEDES LIM-AQP-CÑ",
    sub1_aprovechable: [
      { name: 'Cartón y papel', valor: 629.85, color: '#F97316' },
      { name: 'Vidrio', valor: 0, color: '#94A3B8' },
      { name: 'Plásticos', valor: 1002.51, color: '#F59E0B' },
      { name: 'Metálicos', valor: 398.27, color: '#6366F1' },
      { name: 'Madera', valor: 213.92, color: '#A855F7' },
      { name: 'Descarte Personal Care', valor: 1036.50, color: '#EC4899' },
    ],
    sub1_noAprovechable: [
      { name: 'Rechazos de Pulper', valor: 2618.61, color: '#10B981' }, 
      { name: 'Similar a Domiciliario', valor: 179.14, color: '#EF4444' },
      { name: 'Otros No Peligrosos', valor: 5315.67, color: '#64748B' },
    ],
    sub1_organicos: [
      { name: 'Residuos de Comedor', valor: 74.95, color: '#84CC16' },
    ],
    sub2_peligrosos: [
      { name: 'Hidrocarburos', valor: 14.03, color: '#DC2626' },
      { name: 'Químicos', valor: 7.85, color: '#B91C1C' },
      { name: 'Solventes', valor: 7.85, color: '#991B1B' },
      { name: 'Mezclas', valor: 2.07, color: '#7F1D1D' },
      { name: 'Otros Peligrosos', valor: 36.88, color: '#450A0A' },
    ],
    sub3_priorizados: [{ name: 'RAEE', valor: 1.63, color: '#0EA5E9' }],
    sub4_descarte: [{ name: 'Lodos Industriales', valor: 82456.00, color: '#3B82F6' }],
    totals: { sub1: 11469.43, sub2: 68.68, sub3: 1.63, sub4: 82456.00 }
  },
  LIMA: {
    label: "SEDE LIMA",
    sub1_aprovechable: [
      { name: 'Cartón y papel', valor: 538.00, color: '#F97316' },
      { name: 'Vidrio', valor: 0, color: '#94A3B8' },
      { name: 'Plásticos', valor: 856.00, color: '#F59E0B' },
      { name: 'Metálicos', valor: 340.00, color: '#6366F1' },
      { name: 'Madera', valor: 182.00, color: '#A855F7' },
      { name: 'Descarte Personal Care', valor: 1036.50, color: '#EC4899' },
    ],
    sub1_noAprovechable: [
      { name: 'Rechazos de Pulper', valor: 2236.00, color: '#10B981' }, 
      { name: 'Similar a Domiciliario', valor: 153.00, color: '#EF4444' },
      { name: 'Otros No Peligrosos', valor: 4540.00, color: '#64748B' },
    ],
    sub1_organicos: [{ name: 'Residuos de Comedor', valor: 64.00, color: '#84CC16' }],
    sub2_peligrosos: [
      { name: 'Hidrocarburos', valor: 12.00, color: '#DC2626' },
      { name: 'Químicos', valor: 6.70, color: '#B91C1C' },
      { name: 'Otros Peligrosos', valor: 31.50, color: '#450A0A' },
    ],
    sub3_priorizados: [{ name: 'RAEE', valor: 1.40, color: '#0EA5E9' }],
    sub4_descarte: [{ name: 'Lodos Industriales', valor: 70417.00, color: '#3B82F6' }],
    totals: { sub1: 9945.5, sub2: 58.7, sub3: 1.4, sub4: 70417.00 }
  },
  AREQUIPA: {
    label: "SEDE AREQUIPA",
    sub1_aprovechable: [
      { name: 'Cartón y papel', valor: 40.00, color: '#F97316' },
      { name: 'Plásticos', valor: 63.00, color: '#F59E0B' },
      { name: 'Metálicos', valor: 25.00, color: '#6366F1' },
      { name: 'Madera', valor: 14.00, color: '#A855F7' },
      { name: 'Descarte Personal Care', valor: 0, color: '#EC4899' },
    ],
    sub1_noAprovechable: [
      { name: 'Rechazos de Pulper', valor: 165.00, color: '#10B981' }, 
      { name: 'Similar a Domiciliario', valor: 11.00, color: '#EF4444' },
      { name: 'Otros No Peligrosos', valor: 335.00, color: '#64748B' },
    ],
    sub1_organicos: [{ name: 'Residuos de Comedor', valor: 4.70, color: '#84CC16' }],
    sub2_peligrosos: [
      { name: 'Hidrocarburos', valor: 0.90, color: '#DC2626' },
      { name: 'Químicos', valor: 0.50, color: '#B91C1C' },
      { name: 'Otros Peligrosos', valor: 2.30, color: '#450A0A' },
    ],
    sub3_priorizados: [{ name: 'RAEE', valor: 0.10, color: '#0EA5E9' }],
    sub4_descarte: [{ name: 'Lodos Industriales', valor: 5195.00, color: '#3B82F6' }],
    totals: { sub1: 657.7, sub2: 3.7, sub3: 0.1, sub4: 5195.00 }
  },
  CANETE: {
    label: "SEDE CAÑETE",
    sub1_aprovechable: [
      { name: 'Cartón y papel', valor: 51.85, color: '#F97316' },
      { name: 'Plásticos', valor: 83.51, color: '#F59E0B' },
      { name: 'Metálicos', valor: 33.27, color: '#6366F1' },
      { name: 'Madera', valor: 17.92, color: '#A855F7' },
      { name: 'Descarte Personal Care', valor: 0, color: '#EC4899' },
    ],
    sub1_noAprovechable: [
      { name: 'Rechazos de Pulper', valor: 217.61, color: '#10B981' }, 
      { name: 'Similar a Domiciliario', valor: 15.14, color: '#EF4444' },
      { name: 'Otros No Peligrosos', valor: 440.67, color: '#64748B' },
    ],
    sub1_organicos: [{ name: 'Residuos de Comedor', valor: 6.25, color: '#84CC16' }],
    sub2_peligrosos: [
      { name: 'Hidrocarburos', valor: 1.13, color: '#DC2626' },
      { name: 'Químicos', valor: 0.65, color: '#B91C1C' },
      { name: 'Otros Peligrosos', valor: 3.08, color: '#450A0A' },
    ],
    sub3_priorizados: [{ name: 'RAEE', valor: 0.13, color: '#0EA5E9' }],
    sub4_descarte: [{ name: 'Lodos Industriales', valor: 6844.00, color: '#3B82F6' }],
    totals: { sub1: 866.2, sub2: 4.86, sub3: 0.13, sub4: 6844.00 }
  }
};

// --- COMPONENTES UI (MEMOIZED) ---

const ChartContainer = React.memo(({ title, icon, total, children, onClick, onDoubleClick, isSelected }) => (
  <div 
    onClick={onClick}
    onDoubleClick={onDoubleClick}
    className={`
      p-5 rounded-xl border transition-all duration-200 h-full flex flex-col relative cursor-pointer group
      ${isSelected 
        ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500 ring-opacity-20 bg-emerald-50/10' 
        : 'border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 bg-white'
      }
    `}
  >
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-full shadow-sm text-emerald-600 z-10">
      <Maximize2 size={16} />
    </div>

    <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-2 pointer-events-none">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
          {icon}
        </div>
        <div>
          <h3 className={`font-bold text-sm uppercase ${isSelected ? 'text-emerald-800' : 'text-slate-800'}`}>{title}</h3>
          <p className="text-[10px] text-slate-500 font-medium uppercase">GENERACIÓN ANUAL</p>
        </div>
      </div>
      <div className="text-right">
        <span className="block text-lg font-bold text-slate-800">{new Intl.NumberFormat('es-CO').format(total)}</span>
        <span className="text-[10px] text-slate-400">TON</span>
      </div>
    </div>
    <div className="flex-1 min-h-[250px] pointer-events-none">
      {children}
    </div>
  </div>
));

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-lg z-50">
        <p className="text-xs font-bold text-slate-700 uppercase">{label}</p>
        <p className="text-sm font-bold text-indigo-600">
          {new Intl.NumberFormat('es-CO').format(payload[0].value)} TON
        </p>
        {payload[0].payload.material && (
          <p className="text-[10px] text-slate-400 mt-1 uppercase">{payload[0].payload.material}</p>
        )}
      </div>
    );
  }
  return null;
};

// Renderizado personalizado para etiquetas del Pie Chart
const renderCustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value, color }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.55; 
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Filtrar etiquetas muy pequeñas para evitar saturación visual y lag
  if (percent < 0.03) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="#475569"
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-[9px] font-bold uppercase"
      style={{fontSize: '9px', fontWeight: 600}}
    >
      {`${name.substring(0, 10)}...: ${value.toFixed(1)}T`}
    </text>
  );
};

// --- MODAL DE DETALLE (PANTALLA COMPLETA - ARRIBA/ABAJO) ---
// Usamos React.memo para evitar re-renderizados innecesarios del modal completo
const DetailModal = React.memo(({ title, categoryKey, onClose, currentLocation, onLocationChange }) => {
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const modalData = DATA_BY_LOCATION[currentLocation];
  
  // Memoizamos el cálculo de datos para evitar procesos en cada render
  const chartData = useMemo(() => {
    switch(categoryKey) {
      case '1.1': return modalData.sub1_aprovechable;
      case '1.2': return modalData.sub1_noAprovechable;
      case '1.3': return modalData.sub1_organicos;
      case 'sub2': return modalData.sub2_peligrosos;
      case 'sub3': return modalData.sub3_priorizados;
      case 'sub4': return modalData.sub4_descarte;
      default: return [];
    }
  }, [categoryKey, modalData]);

  // Cálculo de totales
  const totalValue = useMemo(() => {
    if (['sub2','sub3','sub4'].includes(categoryKey)) return modalData.totals[categoryKey];
    if (categoryKey === '1.1') return modalData.totals.sub1_aprovechable || chartData.reduce((a,b)=>a+b.valor,0);
    return chartData.reduce((a,b)=>a+b.valor,0);
  }, [categoryKey, modalData, chartData]);

  // Valores dinámicos según selección
  const displayedTotal = selectedMaterial ? selectedMaterial.valor : totalValue;
  const displayedTitle = selectedMaterial ? selectedMaterial.name : title;
  
  const compositionHeaderTotal = selectedMaterial ? selectedMaterial.valor : chartData.reduce((acc, curr) => acc + curr.valor, 0);

  const trendData = useMemo(() => {
    return generateMonthlyTrend(displayedTotal, selectedMaterial ? selectedMaterial.name : 'TOTAL CATEGORÍA');
  }, [displayedTotal, selectedMaterial]);

  // Handlers estables
  const handleBarClick = useCallback((state) => {
    if (state && state.activePayload) {
      setSelectedMaterial(state.activePayload[0].payload);
    }
  }, []);

  const handleResetSelection = useCallback((e) => {
    e.stopPropagation();
    setSelectedMaterial(null);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[95vw] h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center shrink-0 gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
               <TrendingUp size={24} />
             </div>
             <div>
               <h2 className="text-xl font-bold text-slate-800 uppercase">{displayedTitle}</h2>
               <div className="flex items-center gap-2">
                 <p className="text-sm text-slate-500 uppercase">ANÁLISIS DETALLADO</p>
                 <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded-full">
                    {new Intl.NumberFormat('es-CO').format(displayedTotal)} TON
                 </span>
               </div>
             </div>
          </div>

          <div className="flex bg-white p-1 rounded-lg border border-slate-200 overflow-x-auto">
            {['TOTAL', 'LIMA', 'AREQUIPA', 'CANETE'].map((loc) => (
              <button
                key={loc}
                onClick={() => {
                   onLocationChange(loc);
                   setSelectedMaterial(null);
                }}
                className={`
                  px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap
                  ${currentLocation === loc 
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}
                `}
              >
                {loc === 'CANETE' ? 'CAÑETE' : loc}
              </button>
            ))}
          </div>

          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 absolute top-4 right-4 md:static">
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col gap-6">
            
            {/* PARTE SUPERIOR: COMPOSICIÓN */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[40%] min-h-[300px]">
               <div className="flex justify-between items-center mb-4 shrink-0">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase">
                   <Filter size={16}/> COMPOSICIÓN (SELECCIONA PARA FILTRAR)
                 </h3>
                 <div className="bg-slate-100 px-3 py-1 rounded text-xs font-bold text-slate-600 border border-slate-200 uppercase transition-all duration-300">
                    TOTAL: {new Intl.NumberFormat('es-CO').format(compositionHeaderTotal)} TON
                 </div>
               </div>
               <div className="flex-1 min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={chartData} 
                      layout="vertical" 
                      margin={{left: 0, right: 30}}
                      onClick={handleBarClick}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={140} tick={{fontSize: 10, fontWeight: 600, width: 130}} interval={0} />
                      <Tooltip cursor={{fill: '#f0fdf4'}} content={<CustomTooltip />} />
                      <Bar dataKey="valor" radius={[0, 4, 4, 0]} barSize={24} cursor="pointer" isAnimationActive={true} animationDuration={800}>
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${entry.name}`} 
                            fill={entry.color} 
                            opacity={selectedMaterial && selectedMaterial.name !== entry.name ? 0.3 : 1}
                            stroke={selectedMaterial && selectedMaterial.name === entry.name ? "#000" : "none"}
                            strokeWidth={2}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* PARTE INFERIOR: TENDENCIA - MODO CLARO */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[60%] min-h-[400px]">
               <div className="flex justify-between items-start mb-6 shrink-0">
                 <div>
                   <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
                     {selectedMaterial ? 'TENDENCIA ESPECÍFICA' : 'TENDENCIA GENERAL'}
                   </p>
                   <h3 className="text-2xl font-bold text-slate-800 uppercase">
                     {selectedMaterial ? selectedMaterial.name : 'EVOLUCIÓN MENSUAL'}
                   </h3>
                 </div>
                 {selectedMaterial && (
                   <button 
                     onClick={handleResetSelection}
                     className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-full transition-colors flex items-center gap-2 font-bold uppercase"
                   >
                     <X size={14}/> VER GENERAL
                   </button>
                 )}
               </div>

               <div className="flex-1 min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={selectedMaterial ? selectedMaterial.color : "#10B981"} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={selectedMaterial ? selectedMaterial.color : "#10B981"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="mes" stroke="#64748B" tick={{fontSize: 14}} dy={10} />
                      <YAxis 
                        stroke="#64748B" 
                        tick={{fontSize: 12}} 
                        dx={-10} 
                        unit=" TON"
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="valor" 
                        stroke={selectedMaterial ? selectedMaterial.color : "#10B981"} 
                        fill="url(#colorTrend)" 
                        strokeWidth={3}
                        animationDuration={800}
                        dot={{ r: 4, fill: '#fff', stroke: selectedMaterial ? selectedMaterial.color : "#10B981", strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: selectedMaterial ? selectedMaterial.color : "#10B981" }} 
                      />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>

        </div>
      </div>
    </div>
  );
});

// --- APP PRINCIPAL ---

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState('TOTAL'); 
  const [selectedSub, setSelectedSub] = useState('sub1');
  const [activeModalCategory, setActiveModalCategory] = useState(null); 
  const [activeModalTitle, setActiveModalTitle] = useState('');

  const currentData = DATA_BY_LOCATION[selectedLocation];
  const grandTotal = currentData.totals.sub1 + currentData.totals.sub2 + currentData.totals.sub3 + currentData.totals.sub4;

  const openModal = useCallback((category, title) => {
    setActiveModalCategory(category);
    setActiveModalTitle(title);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-lg text-white">
                <Database size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase">DASHBOARD RESIDUOS 2025</h1>
                <p className="text-xs text-slate-500 font-bold tracking-wider uppercase flex items-center gap-1">
                  <MapPin size={10} /> {currentData.label}
                </p>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs text-slate-400 font-semibold uppercase">TOTAL GENERADO</p>
              <p className="text-xl font-bold text-slate-800">{new Intl.NumberFormat('es-CO').format(grandTotal)} TON</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* FILA DE FILTROS POR SEDE */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold uppercase">
            <MapPin size={18} className="text-emerald-500" />
            <span>SELECCIONAR SEDE:</span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto w-full md:w-auto">
            {['TOTAL', 'LIMA', 'AREQUIPA', 'CANETE'].map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={`
                  px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap
                  ${selectedLocation === loc 
                    ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-500' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}
                `}
              >
                {loc === 'CANETE' ? 'CAÑETE' : loc}
              </button>
            ))}
          </div>
        </div>

        {/* SUBSISTEMA 1 (RESIDUOS NO PELIGROSOS) */}
        <div 
          onClick={() => setSelectedSub('sub1')}
          className={`
            bg-white p-6 rounded-xl shadow-sm border transition-all duration-200
            ${selectedSub === 'sub1' ? 'border-emerald-500 ring-2 ring-emerald-500 ring-opacity-20' : 'border-slate-200'}
          `}
        >
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedSub === 'sub1' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  <Recycle size={24}/>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 uppercase">RESIDUOS NO PELIGROSOS</h2>
                  <p className="text-xs text-slate-500 uppercase">TOTAL: {new Intl.NumberFormat('es-CO').format(currentData.totals.sub1)} TON</p>
                </div>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase">
                <Maximize2 size={10} /> DOBLE CLICK PARA DETALLE
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1.1 APROVECHABLES */}
            <div 
              className="bg-slate-50 rounded-lg p-4 border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-zoom-in group relative"
              onDoubleClick={() => openModal('1.1', 'APROVECHABLES')}
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-full shadow-sm text-emerald-600">
                <Maximize2 size={14} />
              </div>
              <h4 className="text-sm font-bold text-slate-700 mb-4 text-center border-b border-slate-200 pb-2 uppercase">APROVECHABLES</h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentData.sub1_aprovechable} layout="vertical" margin={{left: 0, right: 20}}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={90} tick={{fontSize: 9, fill: '#64748B'}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="valor" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false}>
                      {currentData.sub1_aprovechable.map((entry) => (
                        <Cell key={`sub1-aprov-${entry.name}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 1.2 NO APROVECHABLES */}
            <div 
              className="bg-slate-50 rounded-lg p-4 border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-zoom-in group relative"
              onDoubleClick={() => openModal('1.2', 'NO APROVECHABLES')}
            >
               <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-full shadow-sm text-emerald-600">
                <Maximize2 size={14} />
              </div>
              <h4 className="text-sm font-bold text-slate-700 mb-4 text-center border-b border-slate-200 pb-2 uppercase">NO APROVECHABLES</h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentData.sub1_noAprovechable} layout="vertical" margin={{left: 0, right: 20}}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={90} tick={{fontSize: 9, fill: '#64748B'}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="valor" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false}>
                      {currentData.sub1_noAprovechable.map((entry) => (
                        <Cell key={`sub1-noaprov-${entry.name}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 1.3 ORGÁNICOS */}
            <div 
              className="bg-slate-50 rounded-lg p-4 border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-zoom-in group relative flex flex-col justify-between"
              onDoubleClick={() => openModal('1.3', 'ORGÁNICOS')}
            >
               <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-full shadow-sm text-emerald-600">
                <Maximize2 size={14} />
              </div>
               <h4 className="text-sm font-bold text-slate-700 mb-4 text-center border-b border-slate-200 pb-2 uppercase">ORGÁNICOS</h4>
               <div className="flex flex-col items-center justify-center h-full">
                  <div className="bg-lime-100 p-4 rounded-full mb-4">
                    <Leaf size={40} className="text-lime-600" />
                  </div>
                  <span className="text-3xl font-bold text-slate-800">
                    {new Intl.NumberFormat('es-CO').format(currentData.sub1_organicos[0].valor)}
                  </span>
                  <span className="text-xs text-slate-500 uppercase tracking-wide mt-1">TONELADAS</span>
               </div>
            </div>
          </div>
        </div>

        {/* SUBSISTEMAS 2, 3, 4 (DISEÑO 50% - 25% - 25%) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* SUBSISTEMA 2: PELIGROSOS (50% = 2 COLUMNAS) */}
          <div className="md:col-span-2">
            <ChartContainer 
              title="PELIGROSOS" 
              icon={<AlertTriangle size={20}/>} 
              total={currentData.totals.sub2}
              onClick={() => setSelectedSub('sub2')}
              onDoubleClick={() => openModal('sub2', 'PELIGROSOS')}
              isSelected={selectedSub === 'sub2'}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={currentData.sub2_peligrosos} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={30} 
                    outerRadius={70} 
                    paddingAngle={3} 
                    dataKey="valor"
                    label={renderCustomPieLabel}
                    labelLine={true}
                    isAnimationActive={false}
                  >
                    {currentData.sub2_peligrosos.map((entry) => <Cell key={`sub2-${entry.name}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* SUBSISTEMA 3: RAEE (25% = 1 COLUMNA) */}
          <div className="md:col-span-1">
            <ChartContainer 
              title="RAEE" 
              icon={<Zap size={20}/>} 
              total={currentData.totals.sub3}
              onClick={() => setSelectedSub('sub3')}
              onDoubleClick={() => openModal('sub3', 'RAEE')}
              isSelected={selectedSub === 'sub3'}
            >
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <h4 className="text-xl font-bold text-sky-600 mb-1">RAEE</h4>
                  <p className="text-xs text-slate-500 uppercase">PRIORIZADOS</p>
              </div>
            </ChartContainer>
          </div>

          {/* SUBSISTEMA 4: DESCARTE (25% = 1 COLUMNA) */}
          <div className="md:col-span-1">
            <ChartContainer 
              title="DESCARTE" 
              icon={<Droplets size={20}/>} 
              total={currentData.totals.sub4}
              onClick={() => setSelectedSub('sub4')}
              onDoubleClick={() => openModal('sub4', 'DESCARTE')}
              isSelected={selectedSub === 'sub4'}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <Droplets size={80} className="text-blue-200 mb-2" />
                <h4 className="text-2xl font-bold text-blue-600 uppercase">LODOS</h4>
              </div>
            </ChartContainer>
          </div>

        </div>

      </main>

      {/* --- RENDERIZADO DEL MODAL UNIFICADO --- */}
      {activeModalCategory && (
        <DetailModal 
          categoryKey={activeModalCategory}
          title={activeModalTitle}
          onClose={() => setActiveModalCategory(null)}
          currentLocation={selectedLocation}
          onLocationChange={(newLoc) => setSelectedLocation(newLoc)}
        />
      )}
    </div>
  );
}