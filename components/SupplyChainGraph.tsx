import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { PackingListItem } from '../types';

interface Props {
  data: PackingListItem[];
}

export const SupplyChainGraph: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // 1. Prepare Graph Data (Nodes and Links)
    const nodesMap = new Map<string, { id: string; group: number }>();
    const links: { source: string; target: string; value: number }[] = [];

    data.forEach((item) => {
      // Nodes: Supplier (1), Device (2), Customer (3)
      const supplier = item.Suppliername || "Unknown Supplier";
      const device = item.DeviceName || "Unknown Device";
      const customer = item.customer || "Unknown Customer";

      if (!nodesMap.has(supplier)) nodesMap.set(supplier, { id: supplier, group: 1 });
      if (!nodesMap.has(device)) nodesMap.set(device, { id: device, group: 2 });
      if (!nodesMap.has(customer)) nodesMap.set(customer, { id: customer, group: 3 });

      // Links: Supplier -> Device -> Customer
      links.push({ source: supplier, target: device, value: 1 });
      links.push({ source: device, target: customer, value: 1 });
    });

    const nodes = Array.from(nodesMap.values());

    // 2. D3 Setup
    const width = 800;
    const height = 500;
    
    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 8)
      .attr("fill", (d) => {
        if (d.group === 1) return "#ff7f0e"; // Supplier (Orange)
        if (d.group === 2) return "#2ca02c"; // Device (Green)
        return "#1f77b4"; // Customer (Blue)
      })
      .call(d3.drag<any, any>() // Add drag behavior
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append("title")
      .text(d => d.id);
      
    // Labels
    const labels = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .text(d => d.id.substring(0, 15))
        .attr("font-size", "10px")
        .attr("dx", 12)
        .attr("dy", 4);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
        
      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

  }, [data]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 mt-6 overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Supply Chain Network (Force Directed)</h3>
      <p className="text-sm text-gray-500 mb-4">Drag nodes to rearrange. Orange: Supplier, Green: Device, Blue: Customer.</p>
      <svg ref={svgRef} width="800" height="500" className="w-full h-auto"></svg>
    </div>
  );
};