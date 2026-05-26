# bangkok-train-fare

TypeScript utilities for Bangkok train station lookup, route building, and fare estimation.

This package is experimental. Fare rules and network data are manually maintained and may lag official updates.

## Usage

```bash
npm install bangkok-train-fare
```

```ts
import { calculateFare, searchStation } from "bangkok-train-fare";

const result = calculateFare("BL01", "BL02");
console.log(result.fare);

const stations = await searchStation("Siam");
console.log(stations);
```

## API

- `calculateFare(origin, destination)`
- `buildPath(origin, destination)`
- `calculateGreenFare(stations)`
- `searchStation(keyword)`
- `searchByCode(code)`
