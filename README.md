# Mein Halt

<img src="./frontend/src/assets/img/logo.png" width="300" height="300">


> **Show the live timetable for your stop in Switzerland.**
> Minimal Angular app to quickly see upcoming arrivals for a selected stop.
<p align="left">

  <a href="#">
    <img alt="Angular" src="https://img.shields.io/badge/Angular-20-DD0031?logo=angular&logoColor=white">
  </a>
  
  <a href="#">
    <img alt="Node" src="https://img.shields.io/badge/Node-%E2%89%A520-339933?logo=node.js&logoColor=white">
  </a>

  <a href="#">
    <img alt="Deploy" src="https://img.shields.io/badge/Deploy-Vercel/Render-000000?logo=vercel">
  </a>
  <a href="#license">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg">
  </a>
</p>

---

## Application

**Live :** https://mein-halt.vercel.app/


---

## Features

* 🔎 Fast stop search with debounced queries
* 🕒 Live arrivals (timetable view)
* 📱 Clear UI; keyboard‑friendly desktop UX
* 🔗 Deep link to **SBB Mobile** on phones; open **sbb.ch** on desktop
* 💾 Favorite stops saving (localStorage)
* 🚀 PWA‑ready (installable, offline fallback shell)

## Tech Stack

* **Angular** 20+ & **RxJS** 7+
* **TypeScript** 5+
* **Express** 
* **Build**: Angular CLI
* **CI/CD**: GitHub Actions → Vercel(front) or Render(backend)

## Project Structure

```
mein-halt/
├─ frontend/    # Angular 20 app (UI)
│  ├─ src/
│  │  ├─ app/
│  │  │  ├─ components/
│  │  │  │  ├─ header/
│  │  │  │  ├─ home/
│  │  │  │  ├─ select-options/
│  │  │  │  └─ station-board/
│  │  │  ├─ core/            # API clients and Mappers (XML to Json)
│  │  │  ├─ models/          # DTOs & types
│  │  │  └─ pipes/           
│  │  ├─ assets/
│  │  ├─ environments/
│  │  └─ styles.scss
│  ├─ docs/
│  │  └─ screenshots/
├─ backend/     # Express server (env/proxy wrapper)
│  ├─ index.js
│  └─ .env
└─ README.md
```

---

## Setting

### Prerequisites

- Node.js v20+
- Auglar CLI globally : ``npm i -g @angular/cli``

### Configuration (env)

Refer to `backend/.env-sample` to set environment.

``` bash
PORT=           # Server Port Number
CORS_ORIGIN=    # CORS setting
UPSTREAM_BASE=  # API Request URL 
API_KEY=        # API Secret key
```


`frontend/src/environments/environment.ts`

```ts
export const environment = {
  production: true,
  apiUrl: 'https://mein-halt.onrender.com',
};
```

### Local Development

#### 1) Backend (Exoress)

``` bash
# Navigate to the backend directory
cd backend

# Install NPM packages
npm install

# Start the backend server
npm run dev # dev
npm run start   # prod  

```

#### 2) Frontend (Angular)

```bash
# Navigate to the frontend directory
cd frontend 

# Install NPM packages
npm install

# Start the frontend server
ng serve

# Enter the server
# local
http://localhost:4200


```

---

## Key UX Patterns

### 1) Prevent empty searches (toast)

```ts
onSearch() {
  const q = this.searchControl.value?.trim();
  if (!q) {
    this.snackBar.open('Please enter a search term', 'OK', {
      duration: 2000, verticalPosition: 'top'
    });
    return;
  }
  this.api.search(q).subscribe(/* ... */);
}
```

---

## API Notes
All data is from  **``opentransportdata.swiss``**


- OJP (Open Journey Planner)
https://opentransportdata.swiss/en/cookbook/routing-cookbook/open-journey-planner-ojp/

- OJP : Location Information Request 2.0
https://opentransportdata.swiss/de/cookbook/routing-cookbook/open-journey-planner-ojp/ojplocationinformationrequest-2-0/

- OJP : StopEventRequest 2.0
https://opentransportdata.swiss/en/cookbook/routing-cookbook/open-journey-planner-ojp/ojpstopeventrequest-2-0/

- To get API key
https://api-manager.opentransportdata.swiss/



* Typical response can be **XML**; parse with `fast-xml-parser` and map to DTOs.
* Example mapping (pseudo):

```ts
const parsed = parser.parse(xml);
const items = parsed?.OJPResponse?.StopEventResponse?.StopEvent || [];
return items.map(mapToDeparture);
```

## License

©MIT
©Open Data-Plattform Mobilität Schweiz 2025 (Data)



