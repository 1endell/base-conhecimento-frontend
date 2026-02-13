
import React, { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import { Share2, ZoomIn, ZoomOut, Maximize, Filter } from 'lucide-react';

// Fixed: Explicitly added x and y to Node interface as they were failing to be inferred correctly
interface Node extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  type: string;
  x?: number;
  y?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  type: string;
}

const Graph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);
      try {
        const data = await api.getFullGraph();
        if (!data || !data.nodes) return;
        renderGraph(data);
      } catch (err) {
        console.error("Error fetching graph data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGraphData();
  }, []);

  const renderGraph = (data: { nodes: Node[], links: Link[] }) => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("cursor", "grab");

    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoom);

    const simulation = d3.forceSimulation<Node>(data.nodes)
      .force("link", d3.forceLink<Node, Link>(data.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05));

    const link = g.append("g")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", 1.5);

    const node = g.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .on("click", (event, d) => navigate(`/notes/${d.id}`))
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    node.append("circle")
      .attr("r", d => d.type === 'hub' ? 12 : 8)
      .attr("fill", d => getNodeColor(d.type));

    node.append("text")
      .text(d => d.title)
      .attr("x", 12)
      .attr("y", 4)
      .style("font-size", "10px")
      .style("font-weight", "500")
      .style("fill", "#64748b")
      .style("pointer-events", "none");

    // Fixed: Added non-null assertions to x and y coordinates in the tick callback
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as Node).x!)
        .attr("y1", d => (d.source as Node).y!)
        .attr("x2", d => (d.target as Node).x!)
        .attr("y2", d => (d.target as Node).y!);

      node.attr("transform", d => `translate(${d.x!},${d.y!})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'fleeting': return '#94a3b8';
      case 'literature': return '#10b981';
      case 'permanent': return '#6366f1';
      case 'hub': return '#f59e0b';
      default: return '#cbd5e1';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Graph</h1>
          <p className="text-slate-500">Visualize the connections between your thoughts.</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter size={20} />
          </button>
          <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 transition-colors">
            <Maximize size={20} />
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner min-h-[600px]"
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <Share2 size={48} className="text-indigo-500 animate-pulse mb-4" />
              <p className="font-medium">Mapping your neural network...</p>
            </div>
          </div>
        )}
        <svg ref={svgRef} className="w-full h-full"></svg>
        
        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400" /> Fleeting</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Literature</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500" /> Permanent</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /> Hub</div>
        </div>
      </div>
    </div>
  );
};

export default Graph;
