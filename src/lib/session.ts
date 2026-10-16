/** Cookie phiên đăng nhập tạm (bản giao diện). Khi nối Supabase Auth sẽ thay bằng phiên thật. */
export const SESSION_COOKIE = "grovelyn_session";

/** Các trang cần đăng nhập. Giữ đồng bộ với matcher trong src/proxy.ts. */
export const PROTECTED = ["/community", "/explore", "/new", "/messages", "/notifications", "/u", "/p", "/groups", "/events", "/settings"];
