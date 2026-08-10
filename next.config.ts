import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * React's Strict Mode double-invokes effects in development, which makes the
   * practice apps fire every data fetch twice. That turns the network
   * interception exercises non-deterministic — a `route` handler registered
   * with `times: 1` would only catch half the traffic — so it is disabled here
   * on purpose. The practice applications are the system under test; they need
   * to behave the same way for every learner.
   */
  reactStrictMode: false,
};

export default nextConfig;
