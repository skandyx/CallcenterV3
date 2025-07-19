// src/components/custom-treemap-content.tsx
'use client'

import React from 'react';

// A more diverse and vibrant color palette inspired by the user's image.
const COLORS = [
  '#ef4444', // red-500
  '#a855f7', // purple-500
  '#3b82f6', // blue-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#06b6d4', // cyan-500
];

export const CustomTreemapContent = (props: any) => {
    const { depth, x, y, width, height, index, name, size } = props;
    
    // Assign color based on index to cycle through the palette
    const color = COLORS[index % COLORS.length];

    // Only render the block if it has a measurable size
    if (width <= 0 || height <= 0) {
        return null;
    }

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: color,
                    stroke: '#fff',
                    strokeWidth: 2,
                    strokeOpacity: 1,
                }}
            />
            {/* Render text only if the block is large enough to be legible */}
            {width > 80 && height > 40 ? (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#000" // Black text for better contrast on light backgrounds
                    className="text-base font-medium"
                >
                    {name}
                </text>
            ) : null}
            {width > 80 && height > 55 ? ( // Ensure there's enough space for the second line
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 20}
                    textAnchor="middle"
                    fill="#000"
                    className="text-sm"
                >
                    {size}
                </text>
            ) : null}
        </g>
    );
};
