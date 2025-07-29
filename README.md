# Market Seasonality Explorer

## Overview  L

The **Market Seasonality Explorer** is a web application built with React for visualizing historical financial market data on an interactive calendar. It helps traders and analysts identify seasonal patterns and trends in volatility, performance, and liquidity for various crypto assets. The application features a dynamic dashboard with advanced charting and technical analysis tools.

---
## Key Features ✨

* **Interactive Calendar**: A custom calendar component with daily, weekly (aggregated), and monthly views.
* **Data Visualization Layers**:
    * **Volatility Heatmap**: Calendar cells are color-coded (green, orange, red) to show daily volatility levels.
    * **Performance Indicators**: Up/down arrows (▲/▼) display daily positive or negative price performance.
* **Resizable Layout**: A draggable split screen to adjust the view between the calendar and the dashboard.
* **Dynamic Dashboard Panel**: A comprehensive panel that displays:
    * Interactive price and volume charts.
    * Key metrics (OHLC, volume, performance).
    * Advanced technical indicators (Moving Averages, RSI, Standard Deviation).
* **Intraday Analysis**: A dedicated "Daily View" that shows an hour-by-hour breakdown of price and volume for any selected day.
* **Dynamic Asset Selection**: A dropdown menu to switch between different crypto assets (e.g., BTC, ETH), with the user's choice saved locally.

---
## Tech Stack 🛠️

* **Framework**: React.js
* **Build Tool**: Vite
* **Charting**: Chart.js with `react-chartjs-2`
* **Date Management**: `date-fns`
* **UI Layout**: `Material Ui` , `react-split`
* **Data Source**: Binance Public API

<img width="1908" height="873" alt="image" src="https://github.com/user-attachments/assets/1cb5952d-64af-4010-90aa-68c9e4a3bf54" />
<img width="1863" height="814" alt="image" src="https://github.com/user-attachments/assets/1b17658e-0553-4f07-a06c-30df69d77233" />
<img width="1890" height="720" alt="image" src="https://github.com/user-attachments/assets/2f6a195d-0d9b-465b-804e-9f33dc563724" />


---
## Project Structure 📁
<img width="679" height="669" alt="image" src="https://github.com/user-attachments/assets/f3716bd2-7bca-42ff-9a1e-a1edc61dc679" />

## Setup and Installation 🚀

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Vickey21299/Market-Seasonality-Explorer.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd market-seasonality-explorer
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.
