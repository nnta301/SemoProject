import apiClient from "./apiClient";
import { defaultMockUsers } from "../mock/mockData";
import { STORAGE_KEYS, normalizeRole, safeJsonParse } from "../utils/auth";

const LOGIN_ENDPOINT = "/api/auth/login";
const REGISTER_ENDPOINT = "/api/auth/register";

function wait(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function seedUsers() {
  const existing = window.localStorage.getItem(STORAGE_KEYS.MOCK_USERS);

  if (!existing) {
    window.localStorage.setItem(
      STORAGE_KEYS.MOCK_USERS,
      JSON.stringify(defaultMockUsers),
    );
  }
}

function getUsers() {
  seedUsers();
  return safeJsonParse(
    window.localStorage.getItem(STORAGE_KEYS.MOCK_USERS),
    defaultMockUsers,
  );
}

function saveUsers(users) {
  window.localStorage.setItem(STORAGE_KEYS.MOCK_USERS, JSON.stringify(users));
}

function createSessionPayload(user, token) {
  const normalizedRole = normalizeRole(user?.role);

  return {
    token: token || `mock-token-${btoa(`${user.email}:${normalizedRole}`)}`,
    role: normalizedRole,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: normalizedRole,
    },
  };
}

function persistSession(session) {
  window.localStorage.setItem(
    STORAGE_KEYS.AUTH_SESSION,
    JSON.stringify(session),
  );
}

function shouldFallback(error) {
  return !error?.response || [404, 405, 501].includes(error.response.status);
}

function parseAuthResponse(payload) {
  const role = normalizeRole(payload?.role || payload?.user?.role);
  const token = payload?.token || payload?.accessToken || payload?.jwt || "";
  const userPayload = payload?.user || payload || {};

  return {
    token,
    role,
    user: {
      id: userPayload?.id,
      name:
        userPayload?.name ||
        userPayload?.fullName ||
        userPayload?.username ||
        "SEMO User",
      email: userPayload?.email || "",
      role,
    },
  };
}

async function loginWithBackend(credentials) {
  const response = await apiClient.post(LOGIN_ENDPOINT, credentials);
  const session = parseAuthResponse(response.data);

  if (!session?.token || !session?.user?.role) {
    throw new Error("Phản hồi đăng nhập từ backend không hợp lệ.");
  }

  persistSession(session);
  return session;
}

async function loginWithLocalFallback(credentials) {
  await wait();

  const users = getUsers();
  const normalizedEmail = String(credentials?.email || "")
    .trim()
    .toLowerCase();
  const password = String(credentials?.password || "");

  const matchedUser = users.find(
    (user) =>
      user.email.toLowerCase() === normalizedEmail &&
      user.password === password,
  );

  if (!matchedUser) {
    throw new Error("Email hoặc mật khẩu không đúng.");
  }

  const session = createSessionPayload(matchedUser);
  persistSession(session);
  return session;
}

export async function login(credentials) {
  try {
    return await loginWithBackend(credentials);
  } catch (error) {
    if (!shouldFallback(error)) {
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể đăng nhập.",
      );
    }

    return await loginWithLocalFallback(credentials);
  }
}

async function registerWithBackend(payload) {
  const response = await apiClient.post(REGISTER_ENDPOINT, payload);
  return parseAuthResponse(response.data);
}

async function registerWithLocalFallback(payload) {
  await wait();

  const users = getUsers();
  const normalizedEmail = String(payload?.email || "")
    .trim()
    .toLowerCase();

  const existedUser = users.find(
    (user) => user.email.toLowerCase() === normalizedEmail,
  );

  if (existedUser) {
    throw new Error("Email này đã được đăng ký.");
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: String(payload?.name || "").trim(),
    email: normalizedEmail,
    password: String(payload?.password || ""),
    role: normalizeRole(payload?.role || "user"),
  };

  saveUsers([...users, newUser]);
  return createSessionPayload(newUser);
}

export async function register(payload) {
  try {
    return await registerWithBackend(payload);
  } catch (error) {
    if (!shouldFallback(error)) {
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể đăng ký.",
      );
    }

    return await registerWithLocalFallback(payload);
  }
}

export function logout() {
  window.localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
}

export function getStoredSession() {
  const raw = window.localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
  return raw ? safeJsonParse(raw, null) : null;
}

export function saveSession(session) {
  persistSession(session);
}

export const authService = {
  login,
  register,
  logout,
  getStoredSession,
  saveSession,
};
