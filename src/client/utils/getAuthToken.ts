// src/client/utils/getAuthToken.ts
export function getAuthToken(): string {
  return localStorage.getItem("authToken") || "";
}
export function setAuthToken(token: string) {
  localStorage.setItem("authToken", token);
}
export function clearAuthToken() {
  localStorage.removeItem("authToken");
}
