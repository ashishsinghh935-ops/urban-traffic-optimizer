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
% (Using a simplified network interaction matrix for demonstration)
A = [
    1,  1,  0,  0;
    -1,  1,  1,  0;
    0, -1,  1,  1;
    0,  0,  -1, 1
    ];

% Solve for traffic volume vector x using linear algebra (Ax = b)
% MATLAB handles this efficiently using Gaussian elimination under the hood: x = A \ b
trafficFlow = A \ b;

disp('Computed Traffic Volumes (x):');
disp(trafficFlow);