![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square&logo=python&logoColor=white)
![Streamlit](https://img.shields.io/badge/Streamlit-App-red?style=flat-square&logo=streamlit&logoColor=white)
![MATLAB](https://img.shields.io/badge/MATLAB-Simulation-orange?style=flat-square&logo=mathworks&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=flat-square&logo=github&logoColor=white)

# 🚦 Urban Traffic Flow & Route Optimization Solver

A dual-engine mathematical modeling project designed to optimize urban traffic networks, simulate intersection flow conservation, and detect bottlenecks using linear algebra ($Ax = b$). 

This repository contains both a core **MATLAB simulation script** and a live **Python Streamlit dashboard** with interactive network topologies and real-time pathfinding.

## ✨ Features
*   **Linear Algebra Matrix Solver:** Computes exact traffic volume vectors across multi-node urban grids based on external flow inputs.
*   **Dynamic Bottleneck Detection:** Automatically flags intersections exceeding safe road capacity and calculates estimated delay times (in minutes).
*   **Real-Time Pathfinding (Dijkstra's Algorithm):** Calculates the absolute fastest route through the city grid by actively routing around congested, high-delay roads.
*   **Interactive Web Dashboard:** A sleek, user-friendly frontend built with Plotly and Streamlit to visualize the flow network with color-coded heatmaps and directional vectors.

## 🛠️ Technology Stack
*   **Core Engine:** MATLAB, Python 3
*   **Web Framework:** Streamlit
*   **Data & Math:** NumPy, Pandas
*   **Network Graphing:** NetworkX, Plotly

## 🚀 How to Run the Web Dashboard
You can view the live interactive web application directly here:
*(Insert your Streamlit app URL here once deployed!)*

**To run it locally:**
1. Clone this repository.
2. Install the requirements: `pip install -r requirements.txt`
3. Launch the app: `streamlit run app.py`

## 🖥️ How to Run the MATLAB Simulation
1. Open MATLAB or MATLAB Online.
2. Run `traffic_simulator.m`.
3. When prompted in the Command Window, input your dynamic external traffic flow vector (e.g., `[40; -10; -20; -10; 10; -10]`).
4. The script will output the volume vectors, print a bottleneck/delay analysis, calculate the shortest route, and generate a layered directed graph highlighting the optimal path.
