// src/components/custom-treemap-content.tsx
'use client'

import React from 'react';

const COLORS = ['#FF4136', '#85144b', '#001f3f'];

export const CustomTreemapContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload, name, size } = props;
    
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
                    fill="#fff"
                    className="text-base font-medium"
                >
                    {name}
                </text>
            ) : null}
            {width > 80 && height > 40 ? (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 20}
                    textAnchor="middle"
                    fill="#fff"
                    className="text-xs"
                >
                    {size} calls
                </text>
            ) : null}
        </g>
    );
};
