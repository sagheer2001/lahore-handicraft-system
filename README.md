# Lahore-Handicraft-System


## 📍 Company & Project Context
**Company Name**:
Lahore Handicraft Hub

**Headquarters**:
Lahore, Pakistan
(Google Maps: search Lahore Handicraft Hub)

## Business Overview:
A small retail outlet selling locally made crafts (woodwork, textiles, pottery, decor). Currently tracked with spreadsheets or notes, causing stock mismatches and unclear reorder timing.

## Project Objective:
Build a lightweight web system to manage inventory, suppliers (artisans), and orders; give low-stock alerts and simple sales insights; demonstrate CRUD via a frontend + API.
**Google Maps Link**: [Handicrafts Gallery](https://g.co/kgs/j1Vc3en) 
**GitHub Repository**:
https://github.com/sagheer2001/lahore-handicraft-system

## My Individual Role:
- Act as full-stack developer: gather requirements from the shop owner, design data model, implement backend API and frontend UI, write basic tests, and document everything.

- Coordinate project tasks and manage meaningful Git commits.

## Technologies Used:
- Backend: Node.js + Express, with a simple database (SQLite or MongoDB).

- Frontend: HTML + vanilla JavaScript (Fetch API); minimal styling.

- Testing: Jest/Supertest (or similar) for core CRUD endpoints.

- Version Control: Git & GitHub.

- Documentation: README in repo + a shared Google Doc for specs, API details, and test notes.

## Features Summary:
1- Products CRUD: name, category, artisan reference, cost/price, stock; validations (e.g., stock ≥ 0).

2- Suppliers (Artisans) CRUD: contact info, craft types, lead times; link to products.

3- Orders: create with multiple items (check stock, decrement stock); list/view orders; cancel/restock.

4- Basic Reports/Alerts: low-stock view; simple sales summary (e.g., total sales or top categories in a period); show supplier info for restocking.

5- UI & API: RESTful endpoints under /api, simple HTML/JS pages to call them.

6- Testing & Docs: unit/API tests for key endpoints; Google Doc with user stories, data model, API spec, and testing notes; README with setup instructions.

