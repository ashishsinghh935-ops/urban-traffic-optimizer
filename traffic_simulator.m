% Urban Traffic Flow & Route Optimization Solver
clear; clc; close all;

disp('Initializing Traffic Network Simulation...');

% Define number of nodes (intersections)
numNodes = 4;

% Create a directed adjacency matrix representing road capacities
% Element (i, j) represents a road from Intersection i to Intersection j,
% and its value represents the maximum vehicle capacity per minute.
capacityMatrix = [
    0,  50,  30,   0;
    0,   0,  15,  40;
    0,  10,   0,  25;
    0,   0,   0,   0
    ];

disp('Road network capacity matrix loaded successfully.');
disp(capacityMatrix);

% External net traffic flow vector (Positive = cars entering system here,
% Negative = cars exiting/destination here)
b = [40; -10; -20; -10];

% System matrix A representing flow conservation at intersections
A = [
    1,  1,  0,  0;
    -1,  1,  1,  0;
    0, -1,  1,  1;
    0,  0, -1,  1
    ];

% Solve for traffic volume vector x using linear algebra (Ax = b)
trafficFlow = A \ b;

disp('Computed Traffic Volumes (x):');
disp(trafficFlow);

%% Bottleneck Detector
disp('--- Traffic Bottleneck Analysis ---');
for i = 1:numNodes
    % Compare computed traffic volume against outgoing capacity limits
    maxOutCapacity = sum(capacityMatrix(i, :));
    if maxOutCapacity > 0 && trafficFlow(i) > maxOutCapacity
        fprintf('WARNING: Intersection %d is experiencing congestion! Volume: %.2f, Max Capacity: %.2f\n', i, trafficFlow(i), maxOutCapacity);
    else
        fprintf('Intersection %d is operating within safe capacity limits.\n', i);
    end
end

%% Visual Traffic Plotting
figure;
netGraph = digraph(capacityMatrix);
p = plot(netGraph, 'Layout', 'layered', 'NodeLabel', {'Intersection 1', 'Intersection 2', 'Intersection 3', 'Intersection 4'});
highlight(p, 'EdgeColor', 'b', 'LineWidth', 1.5);
title('Urban Traffic Flow Network Graph');
xlabel('Simulation Topology');