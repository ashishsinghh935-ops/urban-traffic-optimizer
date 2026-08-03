![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square&logo=python&logoColor=white)
![Streamlit](https://img.shields.io/badge/Streamlit-App-red?style=flat-square&logo=streamlit&logoColor=white)
![MATLAB](https://img.shields.io/badge/MATLAB-Simulation-orange?style=flat-square&logo=mathworks&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=flat-square&logo=github&logoColor=white)

# 🚦 Urban Traffic Flow & Route Optimization Solver

A dual-engine mathematical modeling project designed to optimize urban traffic networks, simulate intersection flow conservation, and detect bottlenecks using linear algebra and graph theory. 

This repository contains both a core **highly optimized MATLAB simulation script** and a live **Python Streamlit dashboard** featuring interactive network topologies and real-time pathfinding.

## 📚 Mathematical Foundation
This project heavily relies on the principles of linear transformations and network flow conservation.
*   **System Equation ($Ax = b$):** The core algorithm models the traffic grid where the incidence matrix ($A$) represents intersection connections (inflows as $+1$, outflows as $-1$). 
*   **Vector Variables:** By passing the external net traffic flow into vector $b$, the system solves for vector $x$ to find the exact internal routing volumes required to prevent gridlock.

## ✨ Advanced Features
*   **Linear Algebra Matrix Solver:** Computes exact traffic volume vectors across multi-node urban grids.
*   **Dynamic Bottleneck Detection:** Automatically flags intersections exceeding safe road capacity and calculates estimated delay times.
*   **Real-Time Pathfinding (Dijkstra's Algorithm):** Calculates the absolute fastest route through the city grid by actively routing around congested, high-delay roads.
*   **Optimized Web Dashboard:** A sleek, user-friendly frontend built with Plotly and Streamlit. Now fully optimized with `@st.cache_data` for lightning-fast matrix loading and state management.
*   **Interactive Heatmaps:** Both the Python frontend and MATLAB engine generate dynamic, color-coded topological graphs (Green/Orange/Red) based on real-time road utilization ratios.

## 🛠️ Technology Stack
*   **Core Engines:** MATLAB, Python 3
*   **Web Framework:** Streamlit
*   **Data & Math:** NumPy, Pandas
*   **Network Graphing:** NetworkX, Plotly

## 🚀 How to Run the Web Dashboard
**To run it locally:**
1. Clone this repository.
2. Install the requirements: `pip install -r requirements.txt`
3. Launch the app: `streamlit run app.py`

## 🖥️ How to Run the MATLAB Simulation
1. Open MATLAB or MATLAB Online.
2. Run `traffic_simulator.m`.
3. When prompted in the Command Window, input your dynamic external traffic flow vector (e.g., `[40; -10; -20; -10; 10; -10]`).
4. The script will output the volume vectors, print a bottleneck/delay analysis, calculate the shortest route, and generate a color-coded directed graph highlighting the optimal path.
