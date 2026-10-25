import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowRight } from "lucide-react";
import { contextLabel, projectOf, userOf } from "@/lib/data";
import { currentPhase, phaseLabel, showcaseOf } from "@/lib/showcase";
import { levelHint } from "@/lib/model";
import { Mark } from "@/components/Logo";
import { FolderCover } from "@/components/project/FolderCover";
import { enterDemo } from "../auth-actions";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description:
    "Grovelyn giúp bạn trưng bày việc mình làm và nhận góp ý để làm tốt hơn, dù bạn làm trong lĩnh vực nào.",
};

const DEMO_URL = "https://grovelyn-web.vercel.app/demo";

/** Ba ví dụ khác ngành, mỗi ví dụ kèm một dòng tiếng Anh cho người xem quốc tế. */
const EXAMPLES = [
  {
    slug: "nha-pho-thong-gio",
    en: "Graduation architecture project: natural ventilation for a narrow townhouse. Designed, not built.",
  },
  {
    slug: "chuoi-cung-ung-ca-phe",
    en: "Research report on the Central Highlands coffee supply chain, with method and limits.",
  },
  {
    slug: "ra-mat-nuoc-ep",
    en: "Launch plan for a small juice brand, still in progress and asking for feedback.",
  },
];

const DIFF = [
  {
    vs: "Portfolio cá nhân",
    vi: "Đẹp nhưng không ai góp ý, người xem không biết bạn làm phần nào.",
    us: "Mỗi dự án ghi rõ vai trò của từng người, và có Trao đổi để xin góp ý.",
    en: "Personal portfolio sites look good but get no feedback. Grovelyn shows who did what.",
  },
  {
    vs: "Mạng xã hội",
    vi: "Bài đăng trôi đi sau một ngày, giá trị đo bằng lượt thích.",
    us: "Bài đăng gắn với dự án, và dự án giữ lại phiên bản cùng hành trình làm ra nó.",
    en: "Social feeds bury work in a day. Grovelyn keeps versions and the story of how a project grew.",
  },
  {
    vs: "Nền tảng cho developer",
    vi: "Cần demo, repo và công nghệ. Đồ án kiến trúc hay báo cáo thị trường không có chỗ đứng.",
    us: "Đồ án, báo cáo, chiến dịch, ứng dụng đều có mẫu trình bày đúng cách.",
    en: "Developer showcases expect a demo and a repo. Grovelyn fits drawings, reports and campaigns too.",
  },
];

const STATUS = [
  {
    title: "Dùng được ngay",
    en: "Works today",
    items: [
      "Đăng bài, tạo dự án, mở trao đổi, nhắn tin, kèm ảnh và video",
      "Mọi thứ bạn làm được lưu trên trình duyệt này, tải lại trang vẫn còn",
      "Lọc theo lĩnh vực, dạng đầu ra, góc nhìn",
    ],
  },
  {
    title: "Dữ liệu có sẵn",
    en: "Sample content",
    items: [
      "Bạn vào bằng tài khoản Gia Huy",
      "Những người dùng và dự án khác là nội dung mẫu",
      "Xoá dữ liệu của bạn trong Cài đặt, mục Quyền riêng tư dữ liệu",
    ],
  },
  {
    title: "Sắp có",
    en: "Planned",
    items: [
      "Tài khoản riêng và lưu trên máy chủ, dùng chung giữa các máy",
      "Cộng tác nhiều người cùng lúc",
      "Trang Business cho doanh nghiệp, mở khi người dùng ổn định",
    ],
  },
];

const STEPS = [
  {
    vi: "Đăng dự án, chọn dạng đầu ra: đồ án, báo cáo, chiến dịch, ứng dụng…",
    en: "Post a project and pick what it is.",
  },
  {
    vi: "Đang làm dở thì mở Trao đổi kèm ảnh, video, chọn góc nhìn cần nhận.",
    en: "Stuck? Open an exchange and ask for the view you need.",
  },
  {
    vi: "Hoàn tất thì Công bố. Người góp ý được ghi tên vào dự án.",
    en: "Done? Publish it. Helpers get credited.",
  },
];

function DemoButton({
  next = "/community",
  children,
  light = false,
}: {
  next?: string;
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <form action={enterDemo}>
      <input type="hidden" name="next" value={next} />
      <button
        type="submit"
        className={`inline-flex h-12 items-center gap-2 rounded-lg px-5 font-bold transition-colors ${light ? "border border-line bg-white text-ink hover:bg-mist" : "bg-leaf text-ink hover:bg-[#6ee04d]"}`}
      >
        {children}
      </button>
    </form>
  );
}

/**
 * Trang giới thiệu công khai, không cần đăng nhập, song ngữ Việt và Anh.
 * Dùng cho phần demo 2–3 phút ở Buildstuffs: chiếu mã QR, người xem mở trên điện thoại.
 */
export default async function DemoPage() {
  const qr = await QRCode.toString(DEMO_URL, {
    type: "svg",
    margin: 0,
    color: { dark: "#06110a", light: "#ffffff" },
  });

  return (
    <div className="min-h-dvh bg-mist text-ink">

      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <span className="flex items-center gap-2">
          <Mark size={30} />
          <span className="font-display text-[22px] font-bold tracking-[-0.03em]">
            Grovelyn
          </span>
        </span>
        <Link
          href="/"
          className="text-sm font-semibold text-leaf-deep hover:underline"
        >
          Tham gia hoặc đăng nhập
        </Link>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-14 px-4 pb-16 sm:px-6">
        <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <h1 className="max-w-[18ch] font-display text-[clamp(2.2rem,5vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.045em] [text-wrap:balance]">
              Trưng bày việc bạn làm. Cùng nhau làm tốt hơn.
            </h1>
            <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-ink/85">
              Grovelyn giúp bạn trưng bày việc mình làm và nhận góp ý để làm tốt
              hơn, dù bạn làm trong lĩnh vực nào: đồ án kiến trúc, báo cáo thị
              trường hay một ứng dụng.
            </p>
            <p
              lang="en"
              className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-moss"
            >
              Show your work. Make it better together. Grovelyn helps people
              showcase their work and get feedback to make it better, across
              disciplines.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <DemoButton>
                Mở bản demo{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </DemoButton>
              <DemoButton next="/exchange" light>
                Xem tab Trao đổi
              </DemoButton>
            </div>
            <p className="mt-3 text-[13px] text-moss">
              Không cần đăng ký. Bạn vào bằng một tài khoản mẫu. Bài đăng do
              người dùng tự đăng, Grovelyn không kiểm định nội dung.
            </p>
          </div>
          <figure className="mx-auto w-full max-w-[300px] rounded-2xl border border-line bg-white p-5">
            <div
              className="aspect-square w-full [&_svg]:h-full [&_svg]:w-full"
              role="img"
              aria-label={`Mã QR mở ${DEMO_URL}`}
              dangerouslySetInnerHTML={{ __html: qr }}
            />
            <figcaption className="mt-4 text-center text-sm">
              <span className="block font-semibold">
                Quét để mở trên điện thoại
              </span>
              <span lang="en" className="block text-moss">
                Scan to open on your phone
              </span>
              <span className="mt-2 block break-all font-mono text-[12px] text-moss">
                {DEMO_URL.replace("https://", "")}
              </span>
            </figcaption>
          </figure>
        </section>

        <section aria-labelledby="vi-du">
          <h2
            id="vi-du"
            className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-[-0.03em]"
          >
            Ba dự án, ba ngành
          </h2>
          <p lang="en" className="mt-1 text-[15px] text-moss">
            Three projects from three fields, each presented its own way.
          </p>
          <ul className="mt-6 grid gap-5 md:grid-cols-3">
            {EXAMPLES.map(({ slug, en }) => {
              const p = projectOf(slug)!;
              const sc = showcaseOf(p);
              const phase = currentPhase(sc.milestones);
              const owner = userOf(p.owner)!;
              return (
                <li
                  key={slug}
                  className="flex flex-col overflow-hidden rounded-xl border border-line bg-white"
                >
                  <div className="bg-mist px-[18px] pt-[22px]">
                    <FolderCover
                      tone={p.tone}
                      title={p.title}
                      logo={sc.logo}
                      kind={p.output}
                      height={150}
                      logoSize={66}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <p className="text-[13px] font-semibold text-leaf-deep">
                      {p.field}, {phaseLabel(phase).toLowerCase()}
                    </p>
                    <h3 className="font-display text-lg font-bold leading-tight">
                      {p.title}
                    </h3>
                    <p className="text-sm text-moss">
                      {contextLabel(p)}. {levelHint(p.output, phase)}
                      {p.usage ? `, ${p.usage.toLowerCase()}` : ""}.{" "}
                      {owner.name}, {owner.intro.toLowerCase()}.
                    </p>
                    <p lang="en" className="text-sm italic text-ink/70">
                      {en}
                    </p>
                    <div className="mt-auto pt-3">
                      <DemoButton next={`/p/${slug}`} light>
                        Xem dự án
                      </DemoButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          aria-labelledby="nhin-gan"
          className="grid items-center gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh SVG mẫu trong public */}
          <img
            src="/demo/projects/nha-pho-sau.svg"
            alt="Phối cảnh nhà phố 4x16m sau khi mở giếng trời"
            className="aspect-[16/10] w-full rounded-xl border border-line bg-mist object-cover"
          />
          <div>
            <h2
              id="nhin-gan"
              className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-[-0.03em]"
            >
              Bản vẽ được trình bày đúng chất của nó
            </h2>
            <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-ink/85">
              Đồ án kiến trúc cần ảnh lớn, báo cáo cần mục lục, ứng dụng cần bản
              dùng thử. Mỗi dự án trên Grovelyn có mẫu trình bày hợp với ngành
              của nó.
            </p>
            <p lang="en" className="mt-1.5 text-sm text-moss">
              Drawings, reports and apps each get a layout that fits them.
            </p>
          </div>
        </section>

        <section aria-labelledby="khac-gi">
          <h2
            id="khac-gi"
            className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-[-0.03em]"
          >
            Khác gì những chỗ bạn đang dùng
          </h2>
          <ul className="mt-6 flex flex-col gap-3 md:hidden">
            {DIFF.map((d) => (
              <li
                key={d.vs}
                className="rounded-xl border border-line bg-white p-5"
              >
                <p className="font-semibold">So với {d.vs.toLowerCase()}</p>
                <p className="mt-1.5 text-[15px] text-ink/80">{d.vi}</p>
                <p className="mt-3 text-[15px]">
                  <span className="font-semibold text-leaf-deep">
                    Grovelyn:{" "}
                  </span>
                  {d.us}
                </p>
                <p lang="en" className="mt-1.5 text-[13px] text-moss">
                  {d.en}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-6 hidden overflow-x-auto rounded-xl border border-line bg-white md:block">
            <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
              <thead>
                <tr className="border-b border-line text-sm text-moss">
                  <th scope="col" className="p-4 font-semibold">
                    So với
                  </th>
                  <th scope="col" className="p-4 font-semibold">
                    Chỗ thiếu
                  </th>
                  <th scope="col" className="p-4 font-semibold text-leaf-deep">
                    Grovelyn
                  </th>
                </tr>
              </thead>
              <tbody>
                {DIFF.map((d) => (
                  <tr
                    key={d.vs}
                    className="border-b border-line align-top last:border-b-0"
                  >
                    <th scope="row" className="w-44 p-4 font-semibold">
                      {d.vs}
                    </th>
                    <td className="p-4 text-ink/80">{d.vi}</td>
                    <td className="p-4">
                      {d.us}
                      <span
                        lang="en"
                        className="mt-1.5 block text-[13px] text-moss"
                      >
                        {d.en}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="cach-dung">
          <h2
            id="cach-dung"
            className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-[-0.03em]"
          >
            Cách dùng
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li
                key={s.vi}
                className="rounded-xl border border-line bg-white p-5"
              >
                <span className="font-display text-sm font-bold text-leaf-deep">
                  Bước {i + 1}
                </span>
                <p className="mt-2 font-semibold leading-snug">{s.vi}</p>
                <p lang="en" className="mt-1.5 text-sm text-moss">
                  {s.en}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="trang-thai"
          aria-labelledby="trang-thai-title"
          className="scroll-mt-6"
        >
          <h2
            id="trang-thai-title"
            className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-[-0.03em]"
          >
            Dùng thử thế nào
          </h2>
          <p lang="en" className="mt-1 text-[15px] text-moss">
            What works today, what comes with the demo, and what is planned.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {STATUS.map((s) => (
              <section
                key={s.title}
                aria-label={s.title}
                className="rounded-xl border border-line bg-white p-5"
              >
                <h3 className="font-bold">
                  {s.title}{" "}
                  <span lang="en" className="font-normal text-moss">
                    {s.en}
                  </span>
                </h3>
                <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[15px] text-ink/85">
                  {s.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
