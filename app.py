import streamlit as st
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt

st.title("urban-traffic-optimizer 🚦")
st.write("A web-based linear algebra simulation for urban traffic flow conservation and bottleneck analysis.")

# Sidebar for controls
st.sidebar.header("Simulation Parameters")
node_choice = st.sidebar.selectbox("Network Scale", ["4-Node Grid", "6-Node Grid"])

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

user_b_input = st.text_input("Enter net traffic flow vector b (semicolon-separated rows):", default_b)

try:
    # Clean up and parse the user input vector string
    cleaned_b = user_b_input.strip().replace('[', '').replace(']', '')
    b = np.array([float(val.strip()) for val in cleaned_b.split(';')])
    
    # Solve Ax = b using numpy linear algebra solver
    traffic_flow = np.linalg.solve(A, b)
    
    st.subheader("Computed Traffic Volumes ($x$):")
    st.write(traffic_flow)
    
    st.subheader("Bottleneck & Delay Cost Analysis")
    total_delay = 0
    for i in range(num_nodes):
        max_out = np.sum(capacity_matrix[i])
        if max_out > 0:
            utilization = max(0, traffic_flow[i]) / max_out
            delay = utilization * 10
            total_delay += delay
            if traffic_flow[i] > max_out:
                st.error(f"Intersection {i+1} is CONGESTED! Volume: {traffic_flow[i]:.2f}, Capacity: {max_out}, Est. Delay: {delay:.2f} mins")
            else:
                st.success(f"Intersection {i+1} is normal. Volume: {traffic_flow[i]:.2f}, Capacity: {max_out}, Est. Delay: {delay:.2f} mins")
        else:
            st.info(f"Intersection {i+1} is a terminal node.")
            
    st.metric(label="Total Network Delay Cost", value=f"{total_delay:.2f} mins")
    
    # Plotting Network Graph
    st.subheader("Network Topology Graph")
    fig, ax = plt.subplots(figsize=(6, 4))
    G = nx.from_numpy_array(capacity_matrix, create_using=nx.DiGraph)
    pos = nx.spring_layout(G, seed=42)
    nx.draw(G, pos, ax=ax, with_labels=True, node_color='skyblue', node_size=700, edge_color='blue', width=1.5, arrows=True)
    st.pyplot(fig)

except Exception as e:
    st.error(f"Error parsing input or solving system: {e}")
