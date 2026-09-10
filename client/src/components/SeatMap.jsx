import React, { useState, useMemo } from 'react';

const SeatMap = ({ seats, selectedSeats, onSeatToggle }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const getSeatColor = (status, id) => {
    if (selectedSeats.includes(id)) return { fill: '#C9A84C', stroke: '#A8873A', opacity: 1 };
    if (status === 'available') return { fill: '#E8E8E8', stroke: '#999', opacity: 1 };
    return { fill: '#CCCCCC', stroke: '#AAA', opacity: 0.4 };
  };

  // Pre-compute section layout
  const layout = useMemo(() => {
    const groupedSeats = seats.reduce((acc, seat) => {
      if (!acc[seat.section]) acc[seat.section] = {};
      if (!acc[seat.section][seat.row]) acc[seat.section][seat.row] = [];
      acc[seat.section][seat.row].push(seat);
      return acc;
    }, {});

    const seatSize = 16;
    const seatGap = 5;
    const rowSpacing = 26;
    const sectionGap = 40;
    let currentY = 100;

    const sections = ['VIP', 'Floor', 'Balcony']
      .filter(name => groupedSeats[name])
      .map(sectionName => {
        const rows = Object.keys(groupedSeats[sectionName]).sort();
        const sectionStartY = currentY;

        const rowLayouts = rows.map((rowName, rowIndex) => {
          const rowSeats = groupedSeats[sectionName][rowName].sort((a, b) => a.seat_number - b.seat_number);
          const rowWidth = rowSeats.length * (seatSize + seatGap) - seatGap;
          const startX = 400 - rowWidth / 2;
          const rowY = sectionStartY + rowIndex * rowSpacing;
          return { rowName, rowSeats, startX, rowWidth, rowY };
        });

        const sectionHeight = rows.length * rowSpacing;
        currentY += sectionHeight + sectionGap;

        return { sectionName, sectionStartY, sectionHeight, rowLayouts };
      });

    return { sections, seatSize, seatGap, totalHeight: currentY + 40 };
  }, [seats]);

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 rounded-xl shadow-lg relative border border-gold/20" onMouseMove={handleMouseMove}>
      <svg viewBox={`0 0 800 ${layout.totalHeight}`} className="w-full h-auto">
        {/* Gradient defs */}
        <defs>
          <linearGradient id="stageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDF8F0" />
            <stop offset="50%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#FDF8F0" />
          </linearGradient>
        </defs>

        {/* Stage */}
        <path
          d="M 200,50 Q 400,85 600,50 L 600,25 Q 400,10 200,25 Z"
          fill="url(#stageGrad)"
          stroke="#A8873A"
          strokeWidth="2"
        />
        <text x="400" y="48" textAnchor="middle" fill="#1A1A2E" fontWeight="bold" fontSize="14" letterSpacing="6">
          STAGE
        </text>

        {/* Sections */}
        {layout.sections.map(({ sectionName, sectionStartY, sectionHeight, rowLayouts }) => (
          <g key={`sec-${sectionName}`}>
            {/* VIP border highlight */}
            {sectionName === 'VIP' && (
              <rect
                x="80"
                y={sectionStartY - 15}
                width="640"
                height={sectionHeight + 10}
                fill="none"
                stroke="#C9A84C"
                strokeWidth="1.5"
                strokeDasharray="6,4"
                rx="8"
              />
            )}

            {/* Section label */}
            <text
              x="30"
              y={sectionStartY + sectionHeight / 2}
              fontSize="13"
              fill="#2D2D2D"
              fontWeight="bold"
              transform={`rotate(-90, 30, ${sectionStartY + sectionHeight / 2})`}
              textAnchor="middle"
            >
              {sectionName.toUpperCase()}
            </text>

            {/* Rows */}
            {rowLayouts.map(({ rowName, rowSeats, startX, rowWidth, rowY }) => (
              <g key={`row-${sectionName}-${rowName}`}>
                {/* Row label left */}
                <text x={startX - 20} y={rowY + 12} fontSize="10" fill="#888" textAnchor="end">{rowName}</text>

                {/* Seats */}
                {rowSeats.map((seat, i) => {
                  const seatX = startX + i * (layout.seatSize + layout.seatGap);
                  const colors = getSeatColor(seat.status, seat.id);
                  return (
                    <rect
                      key={seat.id}
                      x={seatX}
                      y={rowY}
                      width={layout.seatSize}
                      height={layout.seatSize}
                      rx="3"
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth="1"
                      opacity={colors.opacity}
                      className={seat.status === 'available' ? 'cursor-pointer' : 'cursor-not-allowed'}
                      onClick={() => seat.status === 'available' && onSeatToggle(seat.id)}
                      onMouseEnter={() => seat.status === 'available' && setHoveredSeat(seat)}
                      onMouseLeave={() => setHoveredSeat(null)}
                      style={seat.status === 'available' ? { transition: 'all 0.15s ease' } : {}}
                    />
                  );
                })}

                {/* Row label right */}
                <text x={startX + rowWidth + 20} y={rowY + 12} fontSize="10" fill="#888" textAnchor="start">{rowName}</text>
              </g>
            ))}
          </g>
        ))}

        {/* Legend */}
        <g transform={`translate(230, ${layout.totalHeight - 30})`}>
          <rect x="0" y="0" width="14" height="14" rx="3" fill="#E8E8E8" stroke="#999" />
          <text x="20" y="11" fontSize="11" fill="#666">Available</text>

          <rect x="100" y="0" width="14" height="14" rx="3" fill="#C9A84C" stroke="#A8873A" />
          <text x="120" y="11" fontSize="11" fill="#666">Selected</text>

          <rect x="205" y="0" width="14" height="14" rx="3" fill="#CCCCCC" stroke="#AAA" opacity="0.4" />
          <text x="225" y="11" fontSize="11" fill="#666">Sold</text>
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredSeat && (
        <div
          className="fixed bg-midnight text-white px-3 py-2 rounded-lg shadow-xl pointer-events-none z-50 text-sm border border-gold/50"
          style={{
            left: `${mousePos.x + 15}px`,
            top: `${mousePos.y - 60}px`,
          }}
        >
          <div className="font-bold text-gold text-xs uppercase tracking-wider">{hoveredSeat.section}</div>
          <div>Row {hoveredSeat.row}, Seat {hoveredSeat.seat_number}</div>
          <div className="font-semibold text-gold mt-0.5">${hoveredSeat.price}</div>
        </div>
      )}
    </div>
  );
};

export default SeatMap;
