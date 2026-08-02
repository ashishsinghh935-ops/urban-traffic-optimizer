% Urban Traffic Flow & Route Optimization Solver (6-Node Expanded Grid)
clear; clc; close all;

disp('Initializing Scaled Traffic Network Simulation...');

% Define number of nodes
numNodes = 6;

% Expanded directed adjacency matrix representing road capacities
capacityMatrix = [
     0,  50,  30,   0,   0,   0;
     0,   0,  15,  40,  20,   0;
     0,  10,   0,  25,   0,  30;
     0,   0,   0,   0,  15,  10;
     0,   0,   0,   0,   0,  25;
     0,   0,   0,   0,   0,   0
];

% Prompt user for dynamic external traffic flow vector
prompt = 'Enter net traffic flow vector b as a column vector [v1; v2; v3; v4; v5; v6]: ';
defaultVal = '[40; -10; -20; -10; 10; -10]';
userInputValue = input(prompt, 's');
if isempty(userInputValue)
    b = eval(defaultVal);
    disp('Using default traffic flow vector.');
else
    b = eval(userInputValue);
end

% System matrix A representing flow conservation 
A = [
     1,  1,  0,  0,  0,  0;
    -1,  1,  1,  0,  0,  0;
     0, -1,  1,  1,  0,  0;
     0,  0, -1,  1,  1,  0;
     0,  0,  0, -1,  1,  1;
     0,  0,  0,  0, -1,  1
];

% Solve for traffic volume vector x ($Ax = b$) and convert to absolute integers
rawTrafficFlow = A \ b;
trafficFlow = abs(round(rawTrafficFlow));

disp('Computed Traffic Volumes (x):');
disp(trafficFlow);

%% Bottleneck Detector & Edge Weight Calculation
disp('--- Traffic Bottleneck & Delay Cost Analysis ---');
totalNetworkDelay = 0;
delayWeights = zeros(numNodes, numNodes);

for i = 1:numNodes
    maxOutCapacity = sum(capacityMatrix(i, :));
    if maxOutCapacity > 0
        utilizationRatio = max(0, trafficFlow(i)) / maxOutCapacity;
        delayCost = max(1, utilizationRatio * 10); 
        totalNetworkDelay = totalNetworkDelay + delayCost;
        
        % Assign delay weight to outgoing edges for pathfinding
        for j = 1:numNodes
            if capacityMatrix(i,j) > 0
                delayWeights(i,j) = delayCost;
            end
        end
        
        if trafficFlow(i) > maxOutCapacity
            fprintf('WARNING: Intersection %d is CONGESTED! Volume: %d, Capacity: %d, Est. Delay: %.2f mins\n', i, trafficFlow(i), maxOutCapacity, delayCost);
        else
            fprintf('Intersection %d is normal. Volume: %d, Capacity: %d, Est. Delay: %.2f mins\n', i, trafficFlow(i), maxOutCapacity, delayCost);
        end
    end
end
fprintf('\nTotal Estimated Network Delay Cost: %.2f minutes\n', totalNetworkDelay);

%% Real-Time Pathfinding (Dijkstra's Algorithm)
disp('--- Shortest Path Routing ---');
startNode = 1; % Example starting node
endNode = 6;   % Example destination node

% Create directed graph with calculated delay weights
G = digraph(capacityMatrix);
G.Edges.Weight = nonzeros(delayWeights');

[pathNodes, pathDelay] = shortestpath(G, startNode, endNode);
if isempty(pathNodes)
    disp('No available route between these intersections.');
else
    fprintf('Fastest Route from Int %d to Int %d: %s\n', startNode, endNode, num2str(pathNodes));
    fprintf('Estimated Route Delay: %.2f mins\n', pathDelay);
end

%% Visual Traffic Plotting
figure;
p = plot(G, 'Layout', 'layered', 'EdgeLabel', G.Edges.Weight, 'NodeLabel', {'Int 1', 'Int 2', 'Int 3', 'Int 4', 'Int 5', 'Int 6'});
highlight(p, pathNodes, 'EdgeColor', 'c', 'LineWidth', 2.5); % Highlight shortest path in cyan
title('Urban Traffic Flow Network with Pathfinding');
