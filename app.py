import streamlit as st
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
import pandas as pd

# 1. Page Config (Wide Layout for a pro dashboard feel)
st.set_page_config(page_title="Traffic Optimizer", page_icon="🚦", layout="wide")

# 2. Header
st.title("🚦 Urban Traffic Flow Optimizer")
st.markdown("A professional linear algebra solver for urban traffic conservation, bottleneck detection, and network visualization.")
st.divider()

# 3. Sidebar
with st.sidebar:
    st.header("⚙️ Simulation Parameters")
    node_choice = st.selectbox("Network Scale", ["4-Node Grid", "6-Node Grid"])
    st.markdown("---")
    st.markdown("**About:** Built with Python, NumPy, Pandas, and Streamlit.")

# 4. Load Matrix Data based on user choice
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

# 5. Main Dashboard Layout (Columns)
col1, col2 = st.columns([1, 1.5], gap="large")

with col1:
    st.subheader("📥 Traffic Inputs")
    user_b_input = st.text_input("Enter net traffic flow vector $b$ (semicolons separating rows):", default_b)
    
    try:
        # Parse Input
        cleaned_b = user_b_input.strip().replace('[', '').replace(']', '')
        b = np.array([float(val.strip()) for val in cleaned_b.split(';')])
        
        # Linear Algebra Solver (Ax = b)
        traffic_flow = np.linalg.solve(A, b)
        
        st.subheader("📊 Computed Volumes ($x$)")
        # Display as a neat metric grid
        metric_cols = st.columns(3)
        for idx, vol in enumerate(traffic_flow):
            metric_cols[idx % 3].metric(label=f"Intersection {idx+1}", value=f"{vol:.1f}")

    except Exception as e:
        st.error(f"Error parsing input or solving system: {e}")
        st.stop()

with col2:
    st.subheader("🗺️ Network Analysis")
    
    # Use Tabs to organize the output cleanly
    tab1, tab2 = st.tabs(["Bottleneck & Delay Table", "Visual Topology"])
    
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
                    "Vol": round(traffic_flow[i], 2),
                    "Max Cap": max_out,
                    "Delay (min)": round(delay, 2)
                })
            else:
                results.append({
                    "Node": f"Int {i+1}",
                    "Status": "🛑 Terminal",
                    "Vol": round(traffic_flow[i], 2),
                    "Max Cap": 0,
                    "Delay (min)": 0.0
                })
        
        # Render a clean, formatted table
        st.dataframe(pd.DataFrame(results), use_container_width=True, hide_index=True)
        st.metric(label="Total Network Delay Cost", value=f"{total_delay:.2f} mins")

    with tab2:
        # Render the graph with a transparent background so it looks good on dark mode
        fig, ax = plt.subplots(figsize=(6, 4))
        fig.patch.set_facecolor('none') 
        ax.set_facecolor('none')
        G = nx.from_numpy_array(capacity_matrix, create_using=nx.DiGraph)
        pos = nx.spring_layout(G, seed=42)
        
        # Upgraded node aesthetics
        nx.draw(G, pos, ax=ax, with_labels=True, node_color='#ff4b4b', node_size=800, 
                edge_color='#888888', width=1.5, arrows=True, font_color='white', font_weight='bold')
        st.pyplot(fig)
