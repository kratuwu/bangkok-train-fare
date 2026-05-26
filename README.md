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

## Publishing

The repository includes GitHub Actions workflows for CI, snapshot packages, and stable releases.

Snapshots are published with the `snapshot` npm dist-tag by manually running the `Publish Snapshot` workflow:

```bash
npm install bangkok-train-fare@snapshot
```

Stable releases are published by updating `package.json` version, committing it, and pushing a matching tag:

```bash
npm version patch
git push origin main --tags
```

Publishing supports npm trusted publishing through GitHub Actions OIDC. Configure the package on npm with the matching workflow file, or add an `NPM_TOKEN` repository secret as a fallback.
