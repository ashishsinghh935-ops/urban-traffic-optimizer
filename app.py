import streamlit as st
import numpy as np
import networkx as nx
import pandas as pd
import plotly.graph_objects as go

# --- Page Config ---
st.set_page_config(page_title="Traffic Optimizer", page_icon="🚦", layout="wide")

# --- Header ---
st.title("🚦 Urban Traffic Flow Optimizer")
st.markdown("A real-time linear algebra solver for urban traffic conservation, pathfinding, and network visualization.")
st.divider()

# --- Sidebar Controls ---
with st.sidebar:
    st.header("⚙️ Simulation Parameters")
    node_choice = st.selectbox("Network Scale", ["4-Node Grid", "6-Node Grid"])
    
    st.subheader("📥 External Traffic Inputs ($b$)")
    st.markdown("Adjust the incoming/outgoing flow for each intersection:")
    
    # Dynamically generate sliders based on network size
    num_nodes = 4 if node_choice == "4-Node Grid" else 6
    b_inputs = []
    for i in range(num_nodes):
        default_val = [40, -10, -20, -10, 10, -10][i] if num_nodes == 6 else [40, -10, -20, -10][i]
        val = st.slider(f"Intersection {i+1}", min_value=-100, max_value=100, value=default_val, step=5)
        b_inputs.append(val)
        
    b = np.array(b_inputs)
    
    st.markdown("---")
    st.markdown("**Core Tech:** Python, NumPy, Pandas, Plotly, NetworkX")

# --- Load Matrix Data ---
if num_nodes == 4:
    capacity_matrix = np.array([
        [0, 50, 30, 0],
        [0, 0, 15, 40],
        [0, 10, 0, 25],
        [0, 0, 0, 0]
    ])
    A = np.array([
        [1, 1, 0, 0],
        [-1, 1, 1, 0],
        [0, -1, 1, 1],
        [0, 0, -1, 1]
    ])
else:
    capacity_matrix = np.array([
        [0, 50, 30, 0, 0, 0],
        [0, 0, 15, 40, 20, 0],
        [0, 10, 0, 25, 0, 30],
        [0, 0, 0, 0, 15, 10],
        [0, 0, 0, 0, 0, 25],
        [0, 0, 0, 0, 0, 0]
    ])
    A = np.array([
        [1, 1, 0, 0, 0, 0],
        [-1, 1, 1, 0, 0, 0],
        [0, -1, 1, 1, 0, 0],
        [0, 0, -1, 1, 1, 0],
        [0, 0, 0, -1, 1, 1],
        [0, 0, 0, 0, -1, 1]
    ])

# --- Linear Algebra Solver (Ax = b) ---
try:
    raw_traffic_flow = np.linalg.solve(A, b)
    traffic_flow = np.abs(np.round(raw_traffic_flow)).astype(int)
except Exception as e:
    st.error(f"Matrix Algebra Error: {e}")
    st.stop()

# --- Main Dashboard Layout ---
col1, col2 = st.columns([1, 1.8], gap="large")

with col1:
    st.subheader("📊 Computed Volumes ($x$)")
    metric_cols = st.columns(2)
    for idx, vol in enumerate(traffic_flow):
        metric_cols[idx % 2].metric(label=f"Intersection {idx+1} Flow", value=f"{vol} units")
        
    st.subheader("🧭 Real-Time Pathfinding")
    st.markdown("Find the fastest route avoiding congestion.")
    start_node = st.selectbox("Origin Intersection", range(1, num_nodes + 1)) - 1
    end_node = st.selectbox("Destination Intersection", range(1, num_nodes + 1)) - 1

with col2:
    st.subheader("🗺️ Network Analysis")
    tab1, tab2 = st.tabs(["Interactive Topology Heatmap", "Bottleneck & Delay Data"])
    
    # Build Directed Graph
    G = nx.from_numpy_array(capacity_matrix, create_using=nx.DiGraph)
    
    # Assign Delay Costs to Edges for Pathfinding
    for u, v in G.edges():
        cap = capacity_matrix[u][v]
        vol = traffic_flow[u]
        utilization = vol / cap if cap > 0 else 0
        delay = max(1, utilization * 10) 
        G[u][v]['weight'] = delay

    # Calculate Shortest Path
    shortest_path_edges = []
    if start_node != end_node:
        try:
            path_nodes = nx.shortest_path(G, source=start_node, target=end_node, weight='weight')
            shortest_path_edges = [(path_nodes[i], path_nodes[i+1]) for i in range(len(path_nodes)-1)]
            st.success(f"Fastest Route: **{' ➔ '.join([f'Int {n+1}' for n in path_nodes])}**")
        except nx.NetworkXNoPath:
            st.warning("No available route between these intersections.")

    with tab1:
        # Strict Geometric Layout
        if num_nodes == 4:
            pos = {0: (0, 1), 1: (1, 1), 2: (1, 0), 3: (0, 0)} # Rectangle
        else:
            pos = {i: (np.cos(np.pi/2 - i*np.pi/3), np.sin(np.pi/2 - i*np.pi/3)) for i in range(6)} # Hexagon
        
        fig = go.Figure()
        
        # Add Directed Edges with Heatmap Colors
        for u, v in G.edges():
            x0, y0 = pos[u]
            x1, y1 = pos[v]
            
            vol = traffic_flow[u]
            cap = capacity_matrix[u][v]
            util = vol / cap if cap > 0 else 0
            
            # Heatmap Logic
            if util > 1.0:
                edge_color = '#ff4b4b' # Red (Congested)
            elif util > 0.7:
                edge_color = '#ffa500' # Orange (Heavy)
            else:
                edge_color = '#00ff99' # Green (Clear)
                
            is_path = (u, v) in shortest_path_edges
            if is_path:
                edge_color = '#00d4ff' # Neon Blue
                
            line_width = 4 if is_path else 2
            
            # Draw Arrows with Standoffs (prevents clipping into nodes)
            fig.add_annotation(
                x=x1, y=y1, ax=x0, ay=y0,
                xref='x', yref='y', axref='x', ayref='y',
                showarrow=True, arrowhead=2, arrowsize=1.5, arrowwidth=line_width, arrowcolor=edge_color,
                standoff=28, startstandoff=28
            )
            
            # Offset labels 35% down the line to prevent center clustering
            label_x = x0 + 0.35 * (x1 - x0)
            label_y = y0 + 0.35 * (y1 - y0)
            
           # Draw Edge Volume Labels with Background Boxes
            fig.add_annotation(
                x=label_x, y=label_y,
                text=f"{vol}/{cap}",
                showarrow=False,
                font=dict(color='#1f2937', size=11, family="Arial Black"),
                bgcolor=edge_color,
                bordercolor='white',
                borderwidth=1,
                borderpad=2
            )
            
        # Add Nodes
        node_x = [pos[node][0] for node in G.nodes()]
        node_y = [pos[node][1] for node in G.nodes()]
        
        fig.add_trace(go.Scatter(
            x=node_x, y=node_y, mode='markers+text',
            text=[f"Int {i+1}" for i in range(num_nodes)],
            textposition="top center",
            textfont=dict(color='white', size=15, family="Arial Black"),
            marker=dict(size=45, color='#1f2937', line=dict(width=3, color='white')),
            hoverinfo='none'
        ))
        
        fig.update_layout(
            showlegend=False, hovermode='closest',
            margin=dict(b=20, l=20, r=20, t=20),
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False, scaleanchor="y", scaleratio=1),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)'
        )
        
        st.plotly_chart(fig, use_container_width=True)

    with tab2:
        total_delay = 0
        results = []
        for i in range(num_nodes):
            max_out = np.sum(capacity_matrix[i])
            if max_out > 0:
                utilization = max(0, traffic_flow[i]) / max_out
                delay = utilization * 10
                total_delay += delay
                status = "🚨 CONGESTED" if traffic_flow[i] > max_out else "✅ Clear"
                
                results.append({
                    "Intersection": f"Int {i+1}",
                    "Status": status,
                    "Routing Volume": traffic_flow[i],
                    "Max Capacity": max_out,
                    "Est. Delay (min)": round(delay, 2)
                })
            else:
                results.append({
                    "Intersection": f"Int {i+1}",
                    "Status": "🛑 Terminal (End of Line)",
                    "Routing Volume": traffic_flow[i],
                    "Max Capacity": 0,
                    "Est. Delay (min)": 0.0
                })
        
        st.dataframe(pd.DataFrame(results), use_container_width=True, hide_index=True)
        st.metric(label="System-Wide Delay Cost", value=f"{total_delay:.2f} mins")
