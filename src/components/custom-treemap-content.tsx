// src/components/custom-treemap-content.tsx
'use client'

import React from 'react';

const COLORS = [
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f97316', // orange-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#d946ef', // fuchsia-500
];

export const CustomTreemapContent = (props: any) => {
    const { depth, x, y, width, height, index, name, size } = props;
    
    // Assign color based on index to cycle through the palette
    const color = COLORS[index % COLORS.length];

    // Only render the block if it has a measurable size
    if (width <= 0 || height <= 0) {
        return null;
    }

    const textToShow = size ? `${name} (${size})` : name;

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
            {width > 80 && height > 25 ? (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    className="text-base font-medium"
                >
                    {textToShow}
                </text>
            ) : null}
        </g>
    );
};
