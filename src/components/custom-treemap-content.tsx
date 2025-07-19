// src/components/custom-treemap-content.tsx
'use client'

import React from 'react';
import { cn } from "@/lib/utils"

export const CustomTreemapContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload, name, size } = props;

    // Defensive check to ensure payload and payload.fill exist
    if (!payload || !payload.fill) {
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
                    fill: payload.fill,
                    stroke: '#fff',
                    strokeWidth: 2,
                    strokeOpacity: 1,
                }}
            />
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
