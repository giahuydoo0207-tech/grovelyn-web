"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Download, LoaderCircle, LogOut, Monitor, Smartphone, TriangleAlert } from "lucide-react";
import { signOut } from "@/app/auth-actions";
import { sectionOf, type SectionSlug } from "./sections";
import { usePrefs, type Prefs } from "./SettingsShell";

/* ---------- Khối dựng dùng chung ---------- */

function Card({ id, title, desc, children }: { id?: string; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-line bg-white">
      <div className="px-5 pb-1 pt-5 sm:px-6">
        <h2 className="text-lg font-bold">{title}</h2>
        {desc && <p className="mt-1 text-sm text-moss">{desc}</p>}
      </div>
      <div className="divide-y divide-line px-5 pb-2 sm:px-6">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold">{label}</p>
        {hint && <p className="mt-0.5 text-sm text-moss">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-leaf-deep" : "bg-line"}`}
    >
      <motion.span
        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
        animate={{ left: on ? 24 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
      />
    </button>
  );
}

function Choice<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; disabled?: boolean }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-xl bg-mist p-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
              on ? "bg-white text-ink shadow-sm" : "text-moss hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function useToast() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 2200);
    return () => clearTimeout(t);
  }, [msg]);
  const node = (
    <AnimatePresence>
      {msg && (
        <motion.p
          role="status"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-lg md:bottom-8"
        >
          <Check className="h-4 w-4 text-leaf" strokeWidth={3} aria-hidden="true" />
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
  return { show: setMsg, node };
}

const input =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] outline-none transition-colors focus:border-ink";

/* ---------- Từng mục ---------- */

function Account({ toast }: { toast: (m: string) => void }) {
  const { prefs, set } = usePrefs();
  const [draft, setDraft] = useState({ name: prefs.name, headline: prefs.headline, location: prefs.location });
  const dirty = draft.name !== prefs.name || draft.headline !== prefs.headline || draft.location !== prefs.location;
  const ids = { name: useId(), headline: useId(), location: useId() };

  return (
    <>
      <Card title="Thông tin hồ sơ" desc="Tên và giới thiệu ngắn hiện trên hồ sơ, bài đăng và tin nhắn.">
        <form
          className="grid gap-4 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.name.trim()) return;
            set("name", draft.name.trim());
            set("headline", draft.headline.trim());
            set("location", draft.location.trim());
            toast("Đã lưu thông tin hồ sơ");
          }}
        >
          <div className="grid gap-1.5">
            <label htmlFor={ids.name} className="text-sm font-semibold">
              Tên hiển thị
            </label>
            <input id={ids.name} className={input} value={draft.name} maxLength={60} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor={ids.headline} className="text-sm font-semibold">
              Giới thiệu ngắn
            </label>
            <input
              id={ids.headline}
              className={input}
              value={draft.headline}
              maxLength={120}
              onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
            />
            <p className="text-xs text-moss">{draft.headline.length}/120 ký tự</p>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor={ids.location} className="text-sm font-semibold">
              Nơi sống
            </label>
            <input id={ids.location} className={input} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!dirty || !draft.name.trim()}
              className="h-10 rounded-xl bg-ink px-4 text-sm font-bold text-white transition-colors hover:bg-ink-2 disabled:opacity-40"
            >
              Lưu thay đổi
            </button>
            {dirty && (
              <button
                type="button"
                onClick={() => setDraft({ name: prefs.name, headline: prefs.headline, location: prefs.location })}
                className="h-10 rounded-xl px-4 text-sm font-semibold text-moss hover:bg-mist"
              >
                Hoàn tác
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card id="ngon-ngu" title="Ngôn ngữ và giao diện">
        <Row label="Ngôn ngữ" hint="Tiếng Anh đang được dịch, sẽ mở sau.">
          <Choice<Prefs["language"]>
            label="Ngôn ngữ"
            value={prefs.language}
            onChange={(v) => set("language", v)}
            options={[
              { value: "vi", label: "Tiếng Việt" },
              { value: "en", label: "English", disabled: true },
            ]}
          />
        </Row>
        <Row label="Giao diện" hint="Chế độ tối đang làm, sẽ có trong bản sau.">
          <Choice<Prefs["theme"]>
            label="Giao diện"
            value={prefs.theme}
            onChange={(v) => set("theme", v)}
            options={[
              { value: "light", label: "Sáng" },
              { value: "system", label: "Theo thiết bị", disabled: true },
            ]}
          />
        </Row>
      </Card>
    </>
  );
}

function Security({ toast }: { toast: (m: string) => void }) {
  const { prefs, set } = usePrefs();
  const [leaving, start] = useTransition();
  const [devices, setDevices] = useState([
    { id: "this", name: "Chrome trên Windows", where: "TP. Hồ Chí Minh, đang dùng", icon: Monitor, current: true },
    { id: "phone", name: "Safari trên iPhone", where: "TP. Hồ Chí Minh, 2 ngày trước", icon: Smartphone, current: false },
  ]);

  return (
    <>
      <Card title="Đăng nhập" desc="Grovelyn đăng nhập bằng mã gửi về email, không dùng mật khẩu.">
        <Row label="Email đăng nhập" hint="giahuy@email.com">
          <button type="button" onClick={() => toast("Đã gửi liên kết đổi email")} className="h-9 rounded-xl border border-line px-3.5 text-sm font-semibold hover:bg-mist">
            Đổi email
          </button>
        </Row>
        <Row label="Xác minh 2 bước" hint="Hỏi thêm mã từ ứng dụng xác thực mỗi lần đăng nhập trên thiết bị mới.">
          <Switch
            label="Xác minh 2 bước"
            on={prefs.twoStep}
            onChange={(v) => {
              set("twoStep", v);
              toast(v ? "Đã bật xác minh 2 bước" : "Đã tắt xác minh 2 bước");
            }}
          />
        </Row>
      </Card>

      <Card title="Thiết bị đang đăng nhập">
        <ul className="divide-y divide-line">
          {devices.map((d) => (
            <li key={d.id} className="flex items-center gap-3 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mist">
                <d.icon className="h-5 w-5 text-moss" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">{d.name}</span>
                <span className={`block text-sm ${d.current ? "text-leaf-deep" : "text-moss"}`}>{d.where}</span>
              </span>
              {!d.current && (
                <button
                  type="button"
                  onClick={() => {
                    setDevices((all) => all.filter((x) => x.id !== d.id));
                    toast("Đã đăng xuất thiết bị");
                  }}
                  className="h-9 rounded-xl border border-line px-3.5 text-sm font-semibold hover:bg-mist"
                >
                  Đăng xuất
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="py-4">
          <button
            type="button"
            disabled={leaving}
            onClick={() => start(() => signOut())}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#fdecea] px-4 text-sm font-bold text-[#b42318] hover:bg-[#fbd9d4] disabled:opacity-60"
          >
            {leaving ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
            Đăng xuất khỏi mọi thiết bị
          </button>
        </div>
      </Card>
    </>
  );
}

function Visibility() {
  const { prefs, set } = usePrefs();
  return (
    <Card title="Hiển thị hồ sơ" desc="Dự án riêng tư luôn chỉ bạn và thành viên dự án thấy, dù chọn gì ở đây.">
      <Row label="Ai xem được hồ sơ của bạn">
        <Choice<Prefs["profileAudience"]>
          label="Ai xem được hồ sơ"
          value={prefs.profileAudience}
          onChange={(v) => set("profileAudience", v)}
          options={[
            { value: "everyone", label: "Mọi người" },
            { value: "members", label: "Thành viên" },
            { value: "followers", label: "Người theo dõi" },
          ]}
        />
      </Row>
      <Row label="Hiện trạng thái đang online" hint="Tắt thì bạn cũng không thấy ai đang online.">
        <Switch label="Hiện trạng thái đang online" on={prefs.showOnline} onChange={(v) => set("showOnline", v)} />
      </Row>
      <Row label="Tìm thấy bạn qua email">
        <Switch label="Tìm thấy bạn qua email" on={prefs.findableByEmail} onChange={(v) => set("findableByEmail", v)} />
      </Row>
    </Card>
  );
}

function Privacy({ toast }: { toast: (m: string) => void }) {
  const { prefs, set } = usePrefs();
  const [exporting, setExporting] = useState<"idle" | "sent">("idle");
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [leaving, start] = useTransition();

  return (
    <>
      <Card title="Tin nhắn">
        <Row label="Ai được nhắn tin cho bạn">
          <Choice<Prefs["whoCanMessage"]>
            label="Ai được nhắn tin cho bạn"
            value={prefs.whoCanMessage}
            onChange={(v) => set("whoCanMessage", v)}
            options={[
              { value: "everyone", label: "Mọi người" },
              { value: "following", label: "Người bạn theo dõi" },
              { value: "nobody", label: "Không ai" },
            ]}
          />
        </Row>
        <Row label="Báo đã xem" hint="Tắt thì người khác không thấy bạn đã xem, bạn cũng không thấy họ.">
          <Switch label="Báo đã xem" on={prefs.readReceipts} onChange={(v) => set("readReceipts", v)} />
        </Row>
      </Card>

      <Card title="Dữ liệu của bạn">
        <Row label="Tải dữ liệu về máy" hint="Gồm hồ sơ, dự án, tệp, bài đăng và tin nhắn. Gửi link tải qua email trong 24 giờ.">
          <button
            type="button"
            disabled={exporting === "sent"}
            onClick={() => {
              setExporting("sent");
              toast("Đã nhận yêu cầu tải dữ liệu");
            }}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-line px-3.5 text-sm font-semibold hover:bg-mist disabled:opacity-60"
          >
            {exporting === "sent" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
            {exporting === "sent" ? "Đã gửi yêu cầu" : "Yêu cầu tải"}
          </button>
        </Row>
      </Card>

      <section className="rounded-2xl border border-[#f3c4bd] bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#b42318]">
          <TriangleAlert className="h-5 w-5" aria-hidden="true" /> Xoá tài khoản
        </h2>
        <p className="mt-1 text-sm text-moss">
          Xoá hồ sơ, dự án và tệp của bạn sau 30 ngày. Trong 30 ngày đó đăng nhập lại là huỷ xoá.
        </p>
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-4 h-10 rounded-xl border border-[#f3c4bd] px-4 text-sm font-bold text-[#b42318] hover:bg-[#fdecea]"
          >
            Xoá tài khoản
          </button>
        ) : (
          <form
            className="mt-4 grid gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (typed.trim().toUpperCase() === "XOA") start(() => signOut());
            }}
          >
            <label htmlFor="xac-nhan-xoa" className="text-sm font-semibold">
              Gõ <strong>XOA</strong> để xác nhận
            </label>
            <div className="flex flex-wrap gap-2">
              <input id="xac-nhan-xoa" className={`${input} max-w-[200px]`} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
              <button
                type="submit"
                disabled={typed.trim().toUpperCase() !== "XOA" || leaving}
                className="h-11 rounded-xl bg-[#b42318] px-4 text-sm font-bold text-white disabled:opacity-40"
              >
                Xoá và đăng xuất
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="h-11 rounded-xl px-4 text-sm font-semibold text-moss hover:bg-mist">
                Huỷ
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}

const NOTIFY = [
  { key: "messages", label: "Tin nhắn mới", hint: "Chat riêng và chat nhóm" },
  { key: "comments", label: "Góp ý và lượt thích", hint: "Trên dự án và bài đăng của bạn" },
  { key: "groups", label: "Hoạt động trong nhóm", hint: "Bài mới, lời mời, yêu cầu tham gia" },
  { key: "events", label: "Sự kiện bạn quan tâm", hint: "Nhắc trước 1 ngày và khi có thay đổi" },
  { key: "partners", label: "Gợi ý cộng sự", hint: "Người đang tìm đúng kỹ năng của bạn" },
];

function Notifications() {
  const { prefs, set } = usePrefs();
  return (
    <>
      <Card title="Báo trong Grovelyn" desc="Hiện ở chuông Thông báo và số trên thanh trên cùng.">
        {NOTIFY.map((n) => (
          <Row key={n.key} label={n.label} hint={n.hint}>
            <Switch label={n.label} on={!!prefs.notify[n.key]} onChange={(v) => set("notify", { ...prefs.notify, [n.key]: v })} />
          </Row>
        ))}
      </Card>
      <Card title="Email tóm tắt">
        <Row label="Gửi tóm tắt hoạt động qua email">
          <Choice<Prefs["digest"]>
            label="Email tóm tắt"
            value={prefs.digest}
            onChange={(v) => set("digest", v)}
            options={[
              { value: "daily", label: "Hằng ngày" },
              { value: "weekly", label: "Hằng tuần" },
              { value: "off", label: "Tắt" },
            ]}
          />
        </Row>
      </Card>
    </>
  );
}

const FAQ = [
  {
    q: "Mỗi người được lưu bao nhiêu dung lượng?",
    a: "Mỗi tài khoản có 100 MB cho tệp dự án. Ảnh bìa và ảnh đại diện không tính vào dung lượng này.",
  },
  {
    q: "Dự án riêng tư thì ai xem được?",
    a: "Chỉ bạn và những người bạn thêm làm thành viên dự án. Người theo dõi và người khác không thấy.",
  },
  {
    q: "Làm sao mời bạn bè tham gia?",
    a: "Grovelyn đang thử nghiệm theo mã mời. Gửi mã mời của bạn cho bạn bè, họ nhập khi đăng ký.",
  },
  {
    q: "Tôi quên email đăng nhập thì sao?",
    a: "Gửi góp ý ở dưới kèm tên và trường của bạn, đội Grovelyn sẽ liên hệ để xác minh.",
  },
];

function Help({ toast }: { toast: (m: string) => void }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <Card title="Câu hỏi thường gặp">
        <ul className="divide-y divide-line">
          {FAQ.map((f, i) => (
            <li key={f.q}>
              <button
                type="button"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-semibold"
              >
                {f.q}
                <ChevronDown className={`h-4 w-4 shrink-0 text-moss transition-transform ${open === i ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {open === i && <p className="-mt-1 pb-4 text-sm leading-relaxed text-moss">{f.a}</p>}
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Gửi góp ý" desc="Gặp lỗi hay muốn thêm tính năng gì, cứ viết ở đây.">
        <form
          className="grid gap-3 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            setText("");
            toast("Cảm ơn bạn, đã nhận góp ý");
          }}
        >
          <label htmlFor="gop-y" className="sr-only">
            Nội dung góp ý
          </label>
          <textarea
            id="gop-y"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Mô tả ngắn: bạn đang làm gì, chuyện gì xảy ra"
            className="w-full resize-y rounded-xl border border-line px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-ink"
          />
          <button type="submit" disabled={!text.trim()} className="h-10 justify-self-start rounded-xl bg-ink px-4 text-sm font-bold text-white disabled:opacity-40">
            Gửi góp ý
          </button>
        </form>
      </Card>
    </>
  );
}

export function SettingsView({ section }: { section: SectionSlug }) {
  const { show, node } = useToast();
  const s = sectionOf(section)!;
  return (
    <div className="grid gap-4">
      <header className="hidden px-1 lg:block">
        <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">{s.label}</h2>
        <p className="mt-0.5 text-sm text-moss">{s.desc}</p>
      </header>
      {section === "account" && <Account toast={show} />}
      {section === "security" && <Security toast={show} />}
      {section === "visibility" && <Visibility />}
      {section === "privacy" && <Privacy toast={show} />}
      {section === "notifications" && <Notifications />}
      {section === "help" && <Help toast={show} />}
      {node}
    </div>
  );
}
