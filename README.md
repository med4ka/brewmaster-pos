<h1 align="center">☕ Brewmaster POS (Kopi Bosku)</h1>
<p align="center">
  <i>A lightweight, high-performance full-stack Point of Sale (POS) and Management Dashboard built from scratch without heavy framework abstractions.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Vanilla_JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Backend-Golang_Gin-00ADD8?style=for-the-badge&logo=go" />
  <img src="https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite" />
</p>

---

## 📌 Project Overview

**Brewmaster POS** is a lightweight, low-cost local business management engine engineered specifically to empower local coffee shops to digitalize their daily transactional workflows[cite: 1]. Built entirely from scratch without the overhead of modern reactive frontend frameworks, this project highlights strong structural execution in pure DOM operations, asynchronous networking, and micro-database integration[cite: 1].

Featuring a low-latency concurrent REST API backend paired with a minimalist UI, the system orchestrates core operational pipelines from high-speed checkout counters to backend inventory synchronization loops[cite: 1].

---

## ✨ Core Engineering Features

* 🛒 **High-Speed Cashier Engine:** A fully dynamic point-of-sale terminal managing live cart states, automatic tax calculation routines, and checkout states communicating directly via asynchronous asynchronous JavaScript (`fetch` API) with the Golang gateway[cite: 1].
* 📊 **Analytics HUD & Visualizations:** A comprehensive admin analytics control interface compiling transactional telemetry, total gross revenues, and historical sales trends mapped cleanly onto custom canvas graphs via Chart.js.
* 📦 **Inventory Management Pipeline (Stok):** A complete, isolated CRUD system allowing supervisors to monitor, update, and manage menu resource limits and active stock thresholds securely stored in the local engine[cite: 1].
* 📅 **Shift Scheduler Layer:** An automated operational calendar tracking active barista schedules and task assignment queues using a mixture of raw hardware clock synchronization and local storage replication[cite: 1].
* ⚙️ **Pure DOM Architecture:** Built entirely utilizing native Web APIs and manual document modifications, reflecting a foundational mastery of web lifecycle rendering and state synchronization workflows.

---

## 📸 Interface Showroom

### 1. The Cashier & Transaction Terminal
*Intuitive layout built for seamless, low-latency entry processing and active product mapping parameters.*
<p align="center">
  <img src="./kasir.png" width="90%" alt="Brewmaster Cashier System"/>
</p>

### 2. Analytical Control Dashboard
*Aggregated analytics visualization stack displaying revenue, product velocity metric margins, and automated chart triggers.*
<p align="center">
  <img src="./dashboard.png" width="90%" alt="Brewmaster Analytics Dashboard"/>
</p>

---

## 🛠️ System Stack & Specifications

* **Frontend Layers:** HTML5 Semantic Structure, Asynchronous Vanilla JavaScript, Tailwind CSS (CDN Deployment Architecture).
* **Data Visual Engines:** Chart.js Core Framework components.
* **Backend Runtime:** Golang featuring the high-performance **Gin Web Framework** router engine[cite: 1].
* **Database Driver:** Structured SQLite embedding architecture.
* **Payment Gateway Protocol:** Mockup endpoints simulating Midtrans core parameter issuance.

---

## 🚀 Local Development Setup

Follow these commands to clone, compile, and run the monolithic architecture locally:

### 1. Initialize and Run the Golang Core Engine
Ensure you have the Go distribution environment properly mapped to your local system path:

```bash
# Navigate to repository and fire up backend server (Defaults to http://localhost:8080)
go run main.go
