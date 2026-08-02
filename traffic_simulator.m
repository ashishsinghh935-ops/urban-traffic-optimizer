% Urban Traffic Flow & Route Optimization Solver (6-Node Expanded Grid with Delay Cost Analysis)
clear; clc; close all;

disp('Initializing Scaled Traffic Network Simulation with Cost Analysis...');

% Define number of nodes (intersections) - Expanded to 6
numNodes = 6;

% Expanded directed adjacency matrix representing road capacities (6x6)
capacityMatrix = [
    0,  50,  30,   0,   0,   0;
    0,   0,  15,  40,  20,   0;
    0,  10,   0,  25,   0,  30;
    0,   0,   0,   0,  15,  10;
    0,   0,   0,   0,   0,  25;
    0,   0,   0,   0,   0,   0
    ];

disp('Expanded road network capacity matrix loaded successfully.');
disp(capacityMatrix);

% Prompt user for dynamic external traffic flow vector for 6 nodes
prompt = 'Enter net traffic flow vector b as a column vector [v1; v2; v3; v4; v5; v6]: ';
defaultVal = '[40; -10; -20; -10; 10; -10]';
userInputValue = input(prompt, 's');
if isempty(userInputValue)
    b = eval(defaultVal);
    disp('Using default traffic flow vector.');
else
    b = eval(userInputValue);
end

% Expanded System matrix A representing flow conservation across 6 intersections
A = [
    1,  1,  0,  0,  0,  0;
    -1,  1,  1,  0,  0,  0;
    0, -1,  1,  1,  0,  0;
    0,  0, -1,  1,  1,  0;
    0,  0,  0, -1,  1,  1;
    0,  0,  0,  0, -1,  1
    ];

% Solve for traffic volume vector x using linear algebra (Ax = b)
trafficFlow = A \ b;

disp('Computed Traffic Volumes (x):');
disp(trafficFlow);

%% Bottleneck Detector & Cost/Delay Optimization
disp('--- Traffic Bottleneck & Delay Cost Analysis ---');
totalNetworkDelay = 0;

for i = 1:numNodes
    maxOutCapacity = sum(capacityMatrix(i, :));
    if maxOutCapacity > 0
        % Calculate a congestion penalty/delay cost factor based on volume-to-capacity ratio
        utilizationRatio = max(0, trafficFlow(i)) / maxOutCapacity;
        delayCost = utilizationRatio * 10; % Arbitrary delay metric in minutes
        totalNetworkDelay = totalNetworkDelay + delayCost;

        if trafficFlow(i) > maxOutCapacity
            fprintf('WARNING: Intersection %d is CONGESTED! Volume: %.2f, Capacity: %.2f, Est. Delay: %.2f mins\n', i, trafficFlow(i), maxOutCapacity, delayCost);
        else
            fprintf('Intersection %d is normal. Volume: %.2f, Capacity: %.2f, Est. Delay: %.2f mins\n', i, trafficFlow(i), maxOutCapacity, delayCost);
        end
    else
        fprintf('Intersection %d has no outgoing capacity (Terminal node).\n', i);
    end
end

fprintf('\nTotal Estimated Network Delay Cost: %.2f minutes\n', totalNetworkDelay);

%% Visual Traffic Plotting
figure;
netGraph = digraph(capacityMatrix);
p = plot(netGraph, 'Layout', 'layered', 'NodeLabel', {'Intersection 1', 'Intersection 2', 'Intersection 3', 'Intersection 4', 'Intersection 5', 'Intersection 6'});
highlight(p, 'Edges', 1:numedges(netGraph), 'EdgeColor', 'b', 'LineWidth', 1.5);
title('Expanded Urban Traffic Flow Network Graph with Delay Analysis');
xlabel('Simulation Topology');