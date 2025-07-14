// src/components/treemap-content.tsx
'use client'

import React from 'react';
import { cn } from "@/lib/utils"

export const TreemapContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload, name } = props;

    // Defensive check to ensure payload and payload.fill exist
    if (!payload || !payload.fill) {
        return null;
    }

    const isLight = (payload.fill.startsWith("hsl(var(--chart-1))")); // Heuristic to check if color is light

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: payload.fill,
                    stroke: 'hsl(var(--background))',
                    strokeWidth: 2,
                    strokeOpacity: 1,
                }}
            />
            {depth === 1 ? (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 7}
                    textAnchor="middle"
                    fill={cn(isLight ? "hsl(var(--primary-foreground))" : "hsl(var(--primary-foreground))")}
                    className="fill-primary-foreground text-sm font-medium"
                >
                    {name}
                </text>
            ) : null}
            {depth === 1 ? (
                <text
                    x={x + 4}
                    y={y + 18}
                    fill={cn(isLight ? "hsl(var(--primary-foreground))" : "hsl(var(--primary-foreground))")}
                    className="fill-primary-foreground text-xs"
                >
                    {payload.value}
                </text>
            ) : null}
        </g>
    );
};
