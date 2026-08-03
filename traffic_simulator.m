% =========================================================================
% 🚦 URBAN TRAFFIC FLOW & ROUTE OPTIMIZATION SOLVER
% Linear Algebra Mathematical Engine 
% =========================================================================
% This script models traffic flow conservation across an urban grid using
% principles of linear transformations and matrix algebra (Ax = b).
% It includes dynamic bottleneck detection and real-time pathfinding.
% =========================================================================

clear; clc; close all;

disp('🚦 Initializing Scaled Traffic Network Simulation...');

%% 1. Network Topology & Matrix Initialization
numNodes = 6;

% Directed capacity matrix (Maximum vehicles per minute per road)
capacityMatrix = [
     0,  50,  30,   0,   0,   0;
     0,   0,  15,  40,  20,   0;
     0,  10,   0,  25,   0,  30;
     0,   0,   0,   0,  15,  10;
     0,   0,   0,   0,   0,  25;
     0,   0,   0,   0,   0,   0
];

% System matrix A representing flow conservation at each intersection (node)
% Based on network flow equations: Inflow - Outflow = Net Flow
A = [
     1,  1,  0,  0,  0,  0;
    -1,  1,  1,  0,  0,  0;
     0, -1,  1,  1,  0,  0;
     0,  0, -1,  1,  1,  0;
     0,  0,  0, -1,  1,  1;
     0,  0,  0,  0, -1,  1
];

%% 2. Dynamic Input & Linear System Solver
% External net traffic flow vector (b)
disp('Enter external flow vector b [v1; v2; v3; v4; v5; v6] or press Enter for default.');
prompt = 'Input b: ';
defaultVal = '[40; -10; -20; -10; 10; -10]';
userInputValue = input(prompt, 's');

if isempty(userInputValue)
    b = eval(defaultVal);
    disp('--> Using default traffic flow vector b.');
else
    b = eval(userInputValue);
end

% Solve the linear system Ax = b using MATLAB's robust backslash operator
% This calculates the exact routing volume vector (x) required to satisfy flow conservation
rawTrafficFlow = A \ b;
trafficFlow = abs(round(rawTrafficFlow)); % Convert to absolute integer volumes

disp('--- Computed Routing Volumes (x) ---');
disp(trafficFlow);

%% 3. Bottleneck Detection & Network Delay Analysis
disp('--- Traffic Bottleneck & Delay Cost Analysis ---');
totalNetworkDelay = 0;
delayWeights = zeros(numNodes, numNodes);
utilizationRatios = zeros(numNodes, numNodes); % Stored to color-code the final plot

for i = 1:numNodes
    maxOutCapacity = sum(capacityMatrix(i, :));
    if maxOutCapacity > 0
        % Calculate node volume-to-capacity utilization
        nodeUtil = max(0, trafficFlow(i)) / maxOutCapacity;
        delayCost = max(1, nodeUtil * 10);
        totalNetworkDelay = totalNetworkDelay + delayCost;
        
        % Distribute delay weights to individual edges for graph pathfinding
        for j = 1:numNodes
            if capacityMatrix(i,j) > 0
                delayWeights(i,j) = delayCost;
                utilizationRatios(i,j) = trafficFlow(i) / capacityMatrix(i,j);
            end
        end
        
        % Log dynamic intersection status
        if trafficFlow(i) > maxOutCapacity
            fprintf('🚨 WARNING: Int %d CONGESTED! Vol: %d | Cap: %d | Delay: %.2f min\n', i, trafficFlow(i), maxOutCapacity, delayCost);
        elseif nodeUtil > 0.7
            fprintf('⚠️ WARNING: Int %d HEAVY. Vol: %d | Cap: %d | Delay: %.2f min\n', i, trafficFlow(i), maxOutCapacity, delayCost);
        else
            fprintf('✅ Int %d Clear. Vol: %d | Cap: %d | Delay: %.2f min\n', i, trafficFlow(i), maxOutCapacity, delayCost);
        end
    end
end
fprintf('\nTotal Estimated System Delay: %.2f minutes\n', totalNetworkDelay);

%% 4. Dijkstra's Real-Time Pathfinding Algorithm
disp('--- Shortest Path Routing ---');
startNode = 1; % Origin
endNode = 6;   % Destination

% Build directed graph object using calculated delay weights
G = digraph(capacityMatrix);
G.Edges.Weight = nonzeros(delayWeights');

% Execute Dijkstra's shortest path
[pathNodes, pathDelay] = shortestpath(G, startNode, endNode);
if isempty(pathNodes)
    disp('❌ No available route between these intersections.');
else
    fprintf('🧭 Fastest Route (Int %d -> Int %d): %s\n', startNode, endNode, num2str(pathNodes));
    fprintf('⏱️ Estimated Route Delay: %.2f mins\n', pathDelay);
end

%% 5. Advanced Topographic Visualization (Heatmap)
figure('Name', 'Urban Traffic Flow Network', 'Color', 'w', 'Position', [100, 100, 800, 600]);

% Dynamically define edge colors based on utilization ratios
% Green = Clear, Orange = Heavy, Red = Congested
edgeColors = zeros(numedges(G), 3);
for k = 1:numedges(G)
    u = G.Edges.EndNodes(k, 1);
    v = G.Edges.EndNodes(k, 2);
    util = utilizationRatios(u, v);
    
    if util > 1.0
        edgeColors(k, :) = [1, 0.2, 0.2]; % Red
    elseif util > 0.7
        edgeColors(k, :) = [1, 0.6, 0];   % Orange
    else
        edgeColors(k, :) = [0.1, 0.8, 0.4]; % Green
    end
end

% Plot network topology
p = plot(G, 'Layout', 'force', 'EdgeLabel', round(G.Edges.Weight, 1), ...
    'NodeLabel', {'Int 1', 'Int 2', 'Int 3', 'Int 4', 'Int 5', 'Int 6'}, ...
    'NodeColor', [0.1 0.1 0.2], 'MarkerSize', 12, 'NodeFontSize', 11, ...
    'EdgeColor', edgeColors, 'LineWidth', 2.5);
    
title('Real-Time Traffic Flow Network Heatmap', 'FontSize', 14, 'FontWeight', 'bold');

% Highlight the calculated shortest path in Neon Cyan
if ~isempty(pathNodes)
    highlight(p, pathNodes, 'EdgeColor', [0, 0.8, 1], 'LineWidth', 5);
end
