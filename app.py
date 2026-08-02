import streamlit as st
import numpy as np
import networkx as nx
import pandas as pd
import plotly.graph_objects as go

# Page Config
st.set_page_config(page_title="Traffic Optimizer", page_icon="🚦", layout="wide")

# Header
st.title("🚦 Urban Traffic Flow Optimizer")
st.markdown("A professional linear algebra solver for urban traffic conservation, bottleneck detection, and network visualization.")
st.divider()

# Sidebar
with st.sidebar:
    st.header("⚙️ Simulation Parameters")
    node_choice = st.selectbox("Network Scale", ["4-Node Grid", "6-Node Grid"])
    st.markdown("---")
    st.markdown("**About:** Built with Python, NumPy, Pandas, Plotly, and Streamlit.")

# Load Matrix Data
if node_choice == "4-Node Grid":
    num_nodes = 4
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
    default_b = "[40; -10; -20; -10]"
else:
    num_nodes = 6
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
    default_b = "[40; -10; -20; -10; 10; -10]"

# Main Dashboard Layout
col1, col2 = st.columns([1, 1.5], gap="large")

with col1:
    st.subheader("📥 Traffic Inputs")
    user_b_input = st.text_input("Enter net traffic flow vector $b$ (semicolons separating rows):", default_b)
    
    try:
        # Parse Input
        cleaned_b = user_b_input.strip().replace('[', '').replace(']', '')
        b = np.array([float(val.strip()) for val in cleaned_b.split(';')])
        
        # Linear Algebra Solver (Ax = b) - Converted to Absolute Integers
        raw_traffic_flow = np.linalg.solve(A, b)
        traffic_flow = np.abs(np.round(raw_traffic_flow)).astype(int)
        
        st.subheader("📊 Computed Volumes ($x$)")
        metric_cols = st.columns(3)
        for idx, vol in enumerate(traffic_flow):
            metric_cols[idx % 3].metric(label=f"Intersection {idx+1}", value=f"{vol}")

    except Exception as e:
        st.error(f"Error parsing input or solving system: {e}")
        st.stop()

with col2:
    st.subheader("🗺️ Network Analysis")
    
    tab1, tab2 = st.tabs(["Bottleneck & Delay Table", "Interactive Topology"])
    
    with tab1:
        total_delay = 0
        results = []
        
        for i in range(num_nodes):
            max_out = np.sum(capacity_matrix[i])
            if max_out > 0:
                utilization = max(0, traffic_flow[i]) / max_out
                delay = utilization * 10
                total_delay += delay
                status = "🚨 CONGESTED" if traffic_flow[i] > max_out else "✅ Normal"
                
                results.append({
                    "Node": f"Int {i+1}",
                    "Status": status,
                    "Vol": traffic_flow[i],
                    "Max Cap": max_out,
                    "Delay (min)": round(delay, 2)
                })
            else:
                results.append({
                    "Node": f"Int {i+1}",
                    "Status": "🛑 Terminal",
                    "Vol": traffic_flow[i],
                    "Max Cap": 0,
                    "Delay (min)": 0.0
                })
        
        st.dataframe(pd.DataFrame(results), use_container_width=True, hide_index=True)
        st.metric(label="Total Network Delay Cost", value=f"{total_delay:.2f} mins")

    with tab2:
        # Build Interactive Plotly Graph
        G = nx.from_numpy_array(capacity_matrix, create_using=nx.DiGraph)
        
        # --- NEW STRICT GEOMETRIC LAYOUT LOGIC ---
        if num_nodes == 4:
            # Perfect Rectangle
            pos = {
                0: (0, 1),   # Top-Left
                1: (1, 1),   # Top-Right
                2: (1, 0),   # Bottom-Right
                3: (0, 0)    # Bottom-Left
            }
        else:
            # Perfect Hexagon using Trigonometry
            pos = {}
            for i in range(6):
                angle = np.pi / 2 - i * (np.pi / 3) 
                pos[i] = (np.cos(angle), np.sin(angle))
        
        fig = go.Figure()
        
        # Add edges
        for edge in G.edges():
            x0, y0 = pos[edge[0]]
            x1, y1 = pos[edge[1]]
            fig.add_trace(go.Scatter(x=[x0, x1, None], y=[y0, y1, None],
                                     mode='lines', line=dict(width=3, color='#888'), hoverinfo='none'))
            
        # Add nodes
        node_x = [pos[node][0] for node in G.nodes()]
        node_y = [pos[node][1] for node in G.nodes()]
        
        fig.add_trace(go.Scatter(
            x=node_x, y=node_y,
            mode='markers+text',
            text=[f"Int {i+1}" for i in range(num_nodes)],
            textposition="top center",
            textfont=dict(color='white', size=14, family="Arial Black"),
            marker=dict(size=45, color='#00ff99', line=dict(width=2, color='white')),
            hoverinfo='text'
        ))
        
        # Lock the axis ratio so the hexagon/rectangle isn't warped by the screen size
        fig.update_layout(
            showlegend=False, hovermode='closest',
            margin=dict(b=20, l=20, r=20, t=20),
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False, scaleanchor="y", scaleratio=1),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)'
        )
        
        st.plotly_chart(fig, use_container_width=True)
