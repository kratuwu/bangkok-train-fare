export { calculateGreenFare } from "./greenFareCalculator.js";
import { buildPath } from "./pathfinder.js";

export type FareResult = ReturnType<typeof buildPath> & {
  fare: number;
};

export function calculateFare(
  origin: string,
  destination: string,
): FareResult {
  const { pathes, cost } = buildPath(origin, destination);
  return { fare: cost, cost, pathes };
}
