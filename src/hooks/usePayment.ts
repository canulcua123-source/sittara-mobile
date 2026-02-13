// This file re-exports the platform-specific implementation
// Metro bundler will automatically pick:
// - usePayment.native.ts for iOS/Android
// - usePayment.web.ts for web

export * from './usePayment.native';
export { default } from './usePayment.native';
