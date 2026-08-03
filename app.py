import streamlit as st
import numpy as np
import networkx as nx
import pandas as pd
import plotly.graph_objects as go

# ==========================================
# 🚦 PAGE CONFIGURATION & HEADER
# ==========================================
st.set_page_config(page_title="Traffic Optimizer", page_icon="🚦", layout="wide")

st.title("🚦 Urban Traffic Flow & Route Optimizer")
st.markdown("A real-time linear algebra solver for urban traffic conservation, pathfinding, and network visualization.")

# Academic Mathematical Context
with st.expander("📚 Mathematical Foundation: Linear Algebra & Flow Conservation"):
    st.markdown("""
    **Core Principle:** This model utilizes network flow equations to ensure vehicle conservation at every intersection.
    * **System Equation:** $Ax = b$
    * **Matrix $A$:** The incidence/system matrix representing road connections. Inflow is positive ($+1$), outflow is negative ($-1$).
    * **Vector $x$:** The unknown routing volumes for each road block.
    * **Vector $b$:** The external net traffic flow entering or leaving the grid system.
    
    *By solving this linear system, we compute the exact internal traffic distribution required to prevent gridlock.*
    """)
st.divider()

# ==========================================
# ⚙️ OPTIMIZED DATA CACHING (Performance Upgrade)
# ==========================================
@st.cache_data
def load_matrices(num_nodes):
    """Loads and caches the static capacity and system matrices to prevent unnecessary re-computations."""
    if num_nodes == 4:
        cap_mat = np.array([
            [0, 50, 30, 0],
            [0, 0, 15, 40],
            [0, 10, 0, 25],
            [0, 0, 0, 0]
        ])
        sys_mat = np.array([
            [1, 1, 0, 0],
            [-1, 1, 1, 0],
            [0, -1, 1, 1],
            [0, 0, -1, 1]
        ])
    else:
        cap_mat = np.array([
            [0, 50, 30, 0, 0, 0],
            [0, 0, 15, 40, 20, 0],
            [0, 10, 0, 25, 0, 30],
            [0, 0, 0, 0, 15, 10],
            [0, 0, 0, 0, 0, 25],
            [0, 0, 0, 0, 0, 0]
        ])
        sys_mat = np.array([
            [1, 1, 0, 0, 0, 0],
            [-1, 1, 1, 0, 0, 0],
            [0, -1, 1, 1, 0, 0],
            [0, 0, -1, 1, 1, 0],
            [0, 0, 0, -1, 1, 1],
            [0, 0, 0, 0, -1, 1]
        ])
    return cap_mat, sys_mat

# ==========================================
# 🎛️ UI: SIDEBAR CONTROLS
# ==========================================
with st.sidebar:
    st.header("⚙️ Simulation Parameters")
    node_choice = st.selectbox("Network Scale", ["4-Node Grid", "6-Node Grid"])
    num_nodes = 4 if node_choice == "4-Node Grid" else 6
    
    # Load cached matrices
    capacity_matrix, A = load_matrices(num_nodes)
    
    st.subheader("📥 External Traffic Inputs ($b$)")
    st.markdown("Adjust net traffic flow vector:")
    
    b_inputs = []
    default_vals = [40, -10, -20, -10, 10, -10] if num_nodes == 6 else [40, -10, -20, -10]
    for i in range(num_nodes):
        val = st.slider(f"Intersection {i+1}", min_value=-100, max_value=100, value=default_vals[i], step=5)
        b_inputs.append(val)
        
    b = np.array(b_inputs)
    st.markdown("---")
    st.markdown("**Tech Stack:** Python 3, NumPy, Pandas, Plotly, NetworkX")

# ==========================================
# 🧮 LINEAR ALGEBRA SOLVER
# ==========================================
try:
    # Compute exact volume distribution ($Ax = b$)
    raw_traffic_flow = np.linalg.solve(A, b)
    traffic_flow = np.abs(np.round(raw_traffic_flow)).astype(int)
except Exception as e:
    st.error(f"Matrix Algebra Error: System is inconsistent. Details: {e}")
    st.stop()

# ==========================================
# 📊 UI: DASHBOARD LAYOUT & METRICS
# ==========================================
col1, col2 = st.columns([1, 1.8], gap="large")

with col1:
    st.subheader("📊 Computed Routing Volumes ($x$)")
    
    # Render metrics in visually distinct containers
    for idx, vol in enumerate(traffic_flow):
        with st.container(border=True):
            st.metric(label=f"Intersection {idx+1} Outbound Flow", value=f"{vol} units")
        
    st.subheader("🧭 Pathfinding Engine")
    st.markdown("Calculate fastest route circumventing network delay.")
    start_node = st.selectbox("Origin Node", range(1, num_nodes + 1)) - 1
    end_node = st.selectbox("Destination Node", range(1, num_nodes + 1)) - 1

# ==========================================
# 🗺️ GRAPH ANALYSIS & DIJKSTRA'S ALGORITHM
# ==========================================
with col2:
    st.subheader("🗺️ Topological Analysis")
    tab1, tab2 = st.tabs(["Interactive Network Heatmap", "Delay & Bottleneck Matrix"])
    
    # Initialize Directed Graph
    G = nx.from_numpy_array(capacity_matrix, create_using=nx.DiGraph)
    
    # Apply dynamic edge weights (Delay calculated via volume/capacity ratio)
    for u, v in G.edges():
        cap = capacity_matrix[u][v]
        vol = traffic_flow[u]
        utilization = vol / cap if cap > 0 else 0
        G[u][v]['weight'] = max(1.0, utilization * 10)

    # Compute Dijkstra's Shortest Path
    shortest_path_edges = []
    if start_node != end_node:
        try:
            path_nodes = nx.shortest_path(G, source=start_node, target=end_node, weight='weight')
            shortest_path_edges = [(path_nodes[i], path_nodes[i+1]) for i in range(len(path_nodes)-1)]
            st.success(f"Fastest Route Computed: **{' ➔ '.join([f'Int {n+1}' for n in path_nodes])}**")
        except nx.NetworkXNoPath:
            st.error("Simulation Warning: No route available between selected nodes.")

    with tab1:
        # Define deterministic spatial coordinates for plotting
        if num_nodes == 4:
            pos = {0: (0, 1), 1: (1, 1), 2: (1, 0), 3: (0, 0)} # Rectangular constraint
        else:
            pos = {i: (np.cos(np.pi/2 - i*np.pi/3), np.sin(np.pi/2 - i*np.pi/3)) for i in range(6)} # Hexagonal constraint
        
        fig = go.Figure()
        
        # Render edges with dynamic heatmap routing
        for u, v in G.edges():
            x0, y0 = pos[u]
            x1, y1 = pos[v]
            
            vol = traffic_flow[u]
            cap = capacity_matrix[u][v]
            util = vol / cap if cap > 0 else 0
            
            # Heatmap threshold logic
            if util > 1.0:
                edge_color = '#ff4b4b' # Red (Congested)
            elif util > 0.7:
                edge_color = '#ffa500' # Orange (Heavy Load)
            else:
                edge_color = '#00ff99' # Green (Optimal Flow)
                
            is_path = (u, v) in shortest_path_edges
            if is_path:
                edge_color = '#00d4ff' # Cyan Override for Optimal Route
                
            line_width = 4.5 if is_path else 2.5
            
            # Draw Vector Arrows
            fig.add_annotation(
                x=x1, y=y1, ax=x0, ay=y0,
                xref='x', yref='y', axref='x', ayref='y',
                showarrow=True, arrowhead=2, arrowsize=1.5, arrowwidth=line_width, arrowcolor=edge_color,
                standoff=28, startstandoff=28
            )
            
            # Draw Data Labels with Background Contrast
            label_x = x0 + 0.35 * (x1 - x0)
            label_y = y0 + 0.35 * (y1 - y0)
            
            fig.add_annotation(
                x=label_x, y=label_y,
                text=f"{vol}/{cap}",
                showarrow=False,
                font=dict(color='#1f2937', size=11, family="Arial Black"),
                bgcolor=edge_color,
                bordercolor='white', borderwidth=1, borderpad=3
            )
            
        # Render Intersection Nodes
        node_x = [pos[node][0] for node in G.nodes()]
        node_y = [pos[node][1] for node in G.nodes()]
        
        fig.add_trace(go.Scatter(
            x=node_x, y=node_y, mode='markers+text',
            text=[f"Int {i+1}" for i in range(num_nodes)],
            textposition="top center",
            textfont=dict(color='white', size=14, family="Arial Black"),
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
        # Compile System Delay Dataframe
        total_delay = 0
        results = []
        for i in range(num_nodes):
            max_out = np.sum(capacity_matrix[i])
            if max_out > 0:
                utilization = max(0, traffic_flow[i]) / max_out
                delay = utilization * 10
                total_delay += delay
                status = "🚨 CONGESTED" if traffic_flow[i] > max_out else "✅ OPTIMAL"
                
                results.append({
                    "Node": f"Int {i+1}",
                    "Status": status,
                    "Routing Volume": traffic_flow[i],
                    "Max Capacity": max_out,
                    "Est. Delay (min)": round(delay, 2)
                })
            else:
                results.append({
                    "Node": f"Int {i+1}",
                    "Status": "🛑 TERMINAL",
                    "Routing Volume": traffic_flow[i],
                    "Max Capacity": 0,
                    "Est. Delay (min)": 0.0
                })
        
        st.dataframe(pd.DataFrame(results), use_container_width=True, hide_index=True)
        st.metric(label="Total System Delay", value=f"{total_delay:.2f} minutes", delta_color="inverse")
