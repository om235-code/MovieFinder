# MovieFinder Centralized Logging Server

This repository contains the centralized logging server for the MovieFinder project.

## Purpose

The logging server receives activity logs from the backend VM and stores them in a persistent log file. This helps monitor system activity across the distributed MovieFinder environment.

## VM Role

This VM is responsible for logging and monitoring only. It is separate from the frontend, backend, and database VMs to show service separation in the project architecture.

## Technologies Used

- Node.js
- Express.js
- File system logging
- Ubuntu VM
- UFW Firewall

## Logging Features

The server tracks:

- Backend server startup
- Database connection status
- Login attempts
- Successful logins
- Movie search requests
- Favorites saved
- Favorites requested
- Favorites removed
- Streaming provider clicks

## Network Configuration

The logging server listens on port 4000 and receives log requests from the backend VM.

Firewall rule used:

```bash
sudo ufw allow from 192.168.56.104 to any port 4000