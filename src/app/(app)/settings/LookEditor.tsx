"use client";

import { useState } from "react";
import { Check, ImagePlus, Shuffle } from "lucide-react";
import { ME, userOf, type CoverTone } from "@/lib/data";
import {
  BACKGROUNDS,
  EMOTIONS,
  EXTRAS,
  HAIR_COLORS,
  HAIRS,
  MAX_EXTRAS,
  OUTFIT_COLORS,
  OUTFITS,
  SKINS,
  STATUSES,
  randomCharacter,
  toggleExtra,
  type Character,
  type Status,
} from "@/lib/character";
import { STATUS_KEEP, setLook, useLook, type AvatarMode, type Look } from "@/lib/look";
import { compressImage } from "@/lib/localMedia";
import { CharacterArt } from "@/components/CharacterArt";
import { PersonAvatar, STATUS_ICON } from "@/components/PersonAvatar";
import { GardenCover } from "@/components/GardenCover";
import { ImageCropper } from "@/components/ImageCropper";
import { LocalImg } from "@/components/MediaGrid";

const MODES: { value: AvatarMode; label: string }[] = [
  { value: "character", label: "Nhân vật" },
  { value: "photo", label: "Ảnh của bạn" },
  { value: "initials", label: "Chữ cái đầu" },
];
const UNTIL = ["1 giờ", "4 giờ", "Hết hôm nay", "Không tự tắt"] as const;
type Until = (typeof UNTIL)[number];

function untilAt(u: Until): number | null {
  const now = new Date();
  if (u === "1 giờ") return now.getTime() + 3_600_000;
  if (u === "4 giờ") return now.getTime() + 4 * 3_600_000;
  if (u === "Hết hôm nay") {
    now.setHours(23, 59, 59, 0);
    return now.getTime();
  }
  return null;
}

function Shell({ id, title, desc, children }: { id: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-line bg-white px-5 py-5 sm:px-6">
      <h2 className="text-[17px] font-bold">{title}</h2>
      <p className="mt-0.5 text-sm text-moss">{desc}</p>
      {children}
    </section>
  );
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <p className="text-[13px] font-bold text-moss">
      {children}
      {hint && <span className="font-normal"> {hint}</span>}
    </p>
  );
}

function Swatches({ label, colors, value, onChange }: { label: string; colors: string[]; value: number; onChange: (i: number) => void }) {
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <Label>{label}</Label>
      <div className="mt-2 flex flex-wrap gap-2.5">
        {colors.map((c, i) => (
          <button
            key={c}
            type="button"
            aria-label={`${label} ${i + 1}`}
            aria-pressed={value === i}
            onClick={() => onChange(i)}
            className={`h-8 w-8 rounded-full shadow-[inset_0_0_0_1px_rgba(6,17,10,0.12)] transition-transform hover:scale-110 ${value === i ? "ring-2 ring-ink ring-offset-2" : ""}`}
            style={{ background: c }}
          />
        ))}
      </div>
    </fieldset>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-sm font-bold transition-colors ${on ? "bg-ink text-white" : "border border-line bg-white hover:bg-mist"}`}
    >
      {children}
    </button>
  );
}

function Tile({ on, onClick, label, children }: { on: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-2xl px-1 py-2 text-xs font-bold transition-colors ${on ? "bg-sap shadow-[inset_0_0_0_2px_#1d6b1d]" : "border border-line bg-white hover:bg-mist"}`}
    >
      <span className="block h-14 w-14 overflow-hidden rounded-full">{children}</span>
      {label}
    </button>
  );
}

/** Thẻ Ảnh đại diện trong Chỉnh sửa hồ sơ: nhân vật, ảnh thật hoặc chữ cái đầu, kèm trạng thái. */
export function AvatarCard({ toast }: { toast: (m: string) => void }) {
  const saved = useLook(ME);
  // Bản lưu trên trình duyệt đọc sau khi trang hiện ra: dựng lại khung chỉnh khi bản lưu đổi.
  return <AvatarEditor key={JSON.stringify(saved)} saved={saved} toast={toast} />;
}

function AvatarEditor({ saved, toast }: { saved: Look; toast: (m: string) => void }) {
  const me = userOf(ME)!;
  const [draft, setDraft] = useState<Look>(saved);
  const [until, setUntil] = useState<Until>(saved.statusUntil ? "Hết hôm nay" : STATUS_KEEP.includes(saved.status) ? "Không tự tắt" : "Hết hôm nay");
  const [crop, setCrop] = useState<string | null>(null);
  const [warn, setWarn] = useState("");
  const c = draft.character;
  const setC = (patch: Partial<Character>) => setDraft((d) => ({ ...d, character: { ...d.character, ...patch } }));
  const dirty = JSON.stringify({ ...draft, statusUntil: null }) !== JSON.stringify({ ...saved, statusUntil: null }) || (draft.status !== "Không hiện" && !!saved.statusUntil !== (until !== "Không tự tắt"));

  const pickStatus = (s: Status) => {
    setDraft((d) => ({ ...d, status: s }));
    setUntil(STATUS_KEEP.includes(s) ? "Không tự tắt" : "Hết hôm nay");
  };

  const upload = async (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setWarn("Chỉ nhận ảnh.");
    setWarn("");
    try {
      setCrop(await compressImage(f, 1600, 0.9));
    } catch {
      setWarn("Không đọc được ảnh này. Thử ảnh khác.");
    }
  };

  const save = () => {
    setLook({ ...draft, statusUntil: draft.status === "Không hiện" ? null : untilAt(until) });
    toast("Đã lưu ảnh đại diện");
  };

  return (
    <Shell id="anh-dai-dien" title="Ảnh đại diện" desc="Hiện trên hồ sơ, bài đăng, bình luận và tin nhắn.">
      <div role="radiogroup" aria-label="Kiểu ảnh đại diện" className="mt-4 flex max-w-[460px] gap-1 rounded-xl bg-mist p-1">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={draft.mode === m.value}
            onClick={() => setDraft((d) => ({ ...d, mode: m.value }))}
            className={`h-10 flex-1 rounded-lg text-sm font-bold transition-colors ${draft.mode === m.value ? "bg-white shadow-sm" : "text-moss hover:text-ink"}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-leaf-deep">
        <span className="h-2 w-2 rounded-full bg-leaf" aria-hidden="true" />
        {draft.mode === "photo" ? "Ảnh thật hiện công khai với mọi người xem hồ sơ của bạn." : "Nhân vật giúp bạn có ảnh đại diện riêng mà không cần đăng ảnh thật."}
      </p>

      <div className="mt-5 flex flex-col gap-6">
        <div className="z-10 flex flex-wrap sm:sticky sm:top-[72px] items-center gap-x-6 gap-y-4 rounded-2xl bg-mist p-4 shadow-[0_8px_24px_-18px_rgba(6,17,10,0.4)]">
          <PersonAvatar handle={ME} initials={me.initials} size={120} ring preview={draft} />
          <div className="flex items-end gap-3">
            <PersonAvatar handle={ME} initials={me.initials} size={44} preview={draft} />
            <PersonAvatar handle={ME} initials={me.initials} size={32} preview={draft} />
            <PersonAvatar handle={ME} initials={me.initials} size={22} preview={draft} />
          </div>
          {draft.mode === "character" && (
            <div className="flex flex-col gap-2 sm:ml-auto sm:items-end">
              <div className="flex gap-2">
                {(["cartoon", "pixel"] as const).map((st) => (
                  <Chip key={st} on={c.style === st} onClick={() => setC({ style: st })}>
                    {st === "cartoon" ? "Hoạt hình" : "Điểm ảnh"}
                  </Chip>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setC(randomCharacter(c.style, `${Date.now()}`))}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-bold hover:bg-white/70"
              >
                <Shuffle className="h-4 w-4" aria-hidden="true" /> Phối ngẫu nhiên
              </button>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          {draft.mode === "character" && (
            <>
              <Swatches label="Màu da" colors={SKINS} value={c.skin} onChange={(i) => setC({ skin: i })} />
              <div>
                <Label>Kiểu tóc</Label>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {HAIRS.map((h) => (
                    <Tile key={h} label={h} on={c.hair === h} onClick={() => setC({ hair: h })}>
                      <CharacterArt c={{ ...c, hair: h, extras: [] }} close className="block h-full w-full" />
                    </Tile>
                  ))}
                </div>
              </div>
              <Swatches label="Màu tóc" colors={HAIR_COLORS} value={c.hairColor} onChange={(i) => setC({ hairColor: i })} />
              <div>
                <Label>Trang phục</Label>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {OUTFITS.map((o) => (
                    <Tile key={o} label={o} on={c.outfit === o} onClick={() => setC({ outfit: o })}>
                      <CharacterArt c={{ ...c, outfit: o }} className="block h-full w-full" />
                    </Tile>
                  ))}
                </div>
              </div>
              <Swatches label="Màu áo" colors={OUTFIT_COLORS} value={c.outfitColor} onChange={(i) => setC({ outfitColor: i })} />
              <div>
                <Label hint={`(chọn tối đa ${MAX_EXTRAS}, ví dụ kính và mũ)`}>Phụ kiện</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Chip on={c.extras.length === 0} onClick={() => setC({ extras: [] })}>
                    Không
                  </Chip>
                  {EXTRAS.map((e) => (
                    <Chip key={e} on={c.extras.includes(e)} onClick={() => setC({ extras: toggleExtra(c.extras, e) })}>
                      {c.extras.includes(e) && <Check className="h-4 w-4" aria-hidden="true" />}
                      {e}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <Label>Cảm xúc</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EMOTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      aria-pressed={c.emotion === e}
                      onClick={() => setC({ emotion: e })}
                      className={`inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full pl-1 pr-3.5 text-sm font-bold transition-colors ${c.emotion === e ? "bg-ink text-white" : "border border-line bg-white hover:bg-mist"}`}
                    >
                      <span className="block h-[34px] w-[34px] overflow-hidden rounded-full">
                        <CharacterArt c={{ ...c, emotion: e }} close className="block h-full w-full" />
                      </span>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <Swatches label="Màu nền" colors={BACKGROUNDS} value={c.bg} onChange={(i) => setC({ bg: i })} />
            </>
          )}

          {draft.mode === "photo" && (
            <div className="flex flex-wrap items-center gap-4">
              <span className="block h-28 w-28 overflow-hidden rounded-full border-2 border-dashed border-[#c9d0c4] bg-mist">
                {draft.photo && <LocalImg src={draft.photo} alt="" className="h-full w-full object-cover" />}
              </span>
              <div className="flex flex-col gap-2">
                <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-white hover:bg-ink-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-leaf-deep">
                  <ImagePlus className="h-4 w-4" aria-hidden="true" /> {draft.photo ? "Chọn ảnh khác" : "Tải ảnh lên"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      void upload(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {draft.photoOriginal && (
                  <button type="button" onClick={() => setCrop(draft.photoOriginal!)} className="h-9 rounded-xl border border-line px-3 text-sm font-semibold hover:bg-mist">
                    Căn chỉnh lại
                  </button>
                )}
                <p className={`text-[13px] ${warn ? "font-semibold text-[#b42318]" : "text-moss"}`}>{warn || "Ảnh vuông đẹp nhất, tối thiểu 400 x 400 px."}</p>
              </div>
            </div>
          )}

          {draft.mode === "initials" && (
            <div>
              <Label>Màu nền</Label>
              <div className="mt-2 flex gap-3">
                {(["leaf", "ink", "sap"] as CoverTone[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={draft.initialsTone === t}
                    aria-label={`Màu ${t}`}
                    onClick={() => setDraft((d) => ({ ...d, initialsTone: t }))}
                    className={`flex h-16 w-16 items-center justify-center rounded-full font-display text-xl font-bold ${t === "leaf" ? "bg-leaf text-ink" : t === "ink" ? "bg-ink text-leaf" : "bg-sap text-leaf-deep"} ${draft.initialsTone === t ? "ring-2 ring-ink ring-offset-2" : ""}`}
                  >
                    {me.initials}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-line pt-5">
            <Label hint="(hiện cạnh tên và trên ảnh đại diện)">Trạng thái</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {STATUSES.map((s) => {
                const Icon = s === "Không hiện" ? null : STATUS_ICON[s];
                return (
                  <Chip key={s} on={draft.status === s} onClick={() => pickStatus(s)}>
                    {Icon && <Icon className={`h-4 w-4 ${draft.status === s ? "text-leaf" : "text-leaf-deep"}`} aria-hidden="true" />}
                    {s}
                  </Chip>
                );
              })}
            </div>
            {draft.status !== "Không hiện" && (
              <>
                <p className="mt-4 text-[13px] font-bold text-moss">Tự tắt sau</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {UNTIL.map((u) => (
                    <Chip key={u} on={until === u} onClick={() => setUntil(u)}>
                      {u}
                    </Chip>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2 border-t border-line pt-4">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || (draft.mode === "photo" && !draft.photo)}
          className="h-10 rounded-xl bg-ink px-4 text-sm font-bold text-white transition-colors hover:bg-ink-2 disabled:opacity-40"
        >
          Lưu ảnh đại diện
        </button>
        {dirty && (
          <button type="button" onClick={() => setDraft(saved)} className="h-10 rounded-xl px-4 text-sm font-semibold text-moss hover:bg-mist">
            Hoàn tác
          </button>
        )}
      </div>

      {crop && (
        <ImageCropper
          src={crop}
          ratio={1}
          round
          title="Căn chỉnh ảnh đại diện"
          outputWidth={512}
          onCancel={() => setCrop(null)}
          onDone={(url) => {
            setDraft((d) => ({ ...d, mode: "photo", photo: url, photoOriginal: crop }));
            setCrop(null);
          }}
        />
      )}
    </Shell>
  );
}

const seedOf = (handle: string) => [...handle].reduce((s, ch) => s + ch.charCodeAt(0), 0);

/** Thẻ Ảnh bìa: luống vườn (mặc định, đổi kiểu được) hoặc ảnh của bạn, có khung căn chỉnh. */
export function CoverCard({ toast }: { toast: (m: string) => void }) {
  const look = useLook(ME);
  const base = seedOf(ME);
  const cover = look.cover;
  const seed = cover?.kind === "garden" ? cover.seed : base;
  const [crop, setCrop] = useState<string | null>(null);
  const [warn, setWarn] = useState("");
  const seeds = [base, base + 7, base + 19, base + 31, base + 43];

  const upload = async (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setWarn("Chỉ nhận ảnh.");
    setWarn("");
    try {
      setCrop(await compressImage(f, 2400, 0.9));
    } catch {
      setWarn("Không đọc được ảnh này. Thử ảnh khác.");
    }
  };

  return (
    <Shell id="anh-bia" title="Ảnh bìa" desc="Mặc định là một luống vườn, mỗi người một kiểu. Bạn có thể đổi kiểu vườn hoặc tải ảnh của mình lên.">
      <div className="mt-4 overflow-hidden rounded-2xl border border-line">
        <div className="relative h-28 sm:h-36">
          {cover?.kind === "photo" ? <LocalImg src={cover.src} alt="Ảnh bìa hiện tại" className="h-full w-full object-cover" /> : <GardenCover seed={seed} className="absolute inset-0 h-full w-full" />}
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Label>Luống vườn</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {seeds.map((s, i) => {
              const on = cover?.kind !== "photo" && seed === s;
              return (
                <button
                  key={s}
                  type="button"
                  aria-label={`Kiểu vườn ${i + 1}`}
                  aria-pressed={on}
                  onClick={() => {
                    setLook({ cover: s === base ? null : { kind: "garden", seed: s } });
                    toast("Đã đổi ảnh bìa");
                  }}
                  className={`relative h-10 w-20 overflow-hidden rounded-lg ${on ? "ring-2 ring-ink ring-offset-2" : "ring-1 ring-line"}`}
                >
                  <GardenCover seed={s} className="absolute inset-0 h-full w-full" />
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-white hover:bg-ink-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-leaf-deep">
              <ImagePlus className="h-4 w-4" aria-hidden="true" /> Tải ảnh bìa lên
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  void upload(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            {cover?.kind === "photo" && cover.original && (
              <button type="button" onClick={() => setCrop(cover.original!)} className="h-10 rounded-xl border border-line px-3.5 text-sm font-semibold hover:bg-mist">
                Căn chỉnh
              </button>
            )}
            {cover?.kind === "photo" && (
              <button
                type="button"
                onClick={() => {
                  setLook({ cover: null });
                  toast("Đã quay về luống vườn");
                }}
                className="h-10 rounded-xl px-3.5 text-sm font-semibold text-moss hover:bg-mist"
              >
                Bỏ ảnh
              </button>
            )}
          </div>
          <p className={`text-[13px] ${warn ? "font-semibold text-[#b42318]" : "text-moss"}`}>{warn || "Ảnh ngang, tối thiểu 1500 x 300 px."}</p>
        </div>
      </div>

      {crop && (
        <ImageCropper
          src={crop}
          ratio={5}
          title="Căn chỉnh ảnh bìa"
          outputWidth={1600}
          onCancel={() => setCrop(null)}
          onDone={(url) => {
            setLook({ cover: { kind: "photo", src: url, original: crop } });
            setCrop(null);
            toast("Đã đổi ảnh bìa");
          }}
        />
      )}
    </Shell>
  );
}
