import fs from "fs";
import path from "path";

const NEWSLETTER_BG_PATH = path.join(process.cwd(), "public/images/newsletter-banner-bg.png");

function newsletterBannerAsset(): { src: string; width: number; height: number } {
  const basePath = "/images/newsletter-banner-bg.png";
  let width = 1024;
  let height = 101;
  try {
    const buf = fs.readFileSync(NEWSLETTER_BG_PATH);
    if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      width = buf.readUInt32BE(16);
      height = buf.readUInt32BE(20);
    }
    const st = fs.statSync(NEWSLETTER_BG_PATH);
    return { src: `${basePath}?t=${Math.floor(st.mtimeMs)}`, width, height };
  } catch {
    return { src: basePath, width, height };
  }
}

export default function NewsletterBanner() {
  const { src, width, height } = newsletterBannerAsset();

  return (
    <section
      className="relative z-10 isolate w-full overflow-hidden border-t border-black/15 bg-[#1A1A1A]"
      aria-labelledby="newsletter-banner-heading"
    >
      {/* Height comes from in-flow content below — bg fills that box (short PNG no longer collapses the band on mobile). */}
      <div className="relative w-full">
        <img
          src={src}
          alt=""
          width={width}
          height={height}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
          decoding="async"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-white/[0.14] via-white/[0.06] to-transparent"
          aria-hidden
        />
        <img
          src="/images/placedman.png"
          alt=""
          width={214}
          height={261}
          className="pointer-events-none absolute bottom-0 left-0 z-[5] hidden h-auto object-contain object-left object-bottom md:block md:w-44 lg:w-52 xl:w-56"
          decoding="async"
          aria-hidden
        />
        <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-col justify-center gap-8 px-4 py-16 max-lg:min-h-[22rem] sm:px-6 sm:py-20 lg:min-h-0 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:px-8 lg:py-10">
          <div className="text-center lg:max-w-xl lg:text-left">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-white sm:text-sm">
              Join the mailing list
            </p>
            <h2
              id="newsletter-banner-heading"
              className="mt-3 text-balance font-heading text-2xl font-extrabold leading-tight tracking-wide text-white sm:mt-4 sm:text-3xl md:text-[2rem] lg:text-[2.5rem]"
            >
              One recipe a week.
            </h2>
            <p className="mt-2 font-body text-xs leading-relaxed text-[#D4D4D4] sm:mt-3 sm:text-sm md:text-base">
              Pulled from the 274-recipe vault. Plus first access to new models and seasonal bundles.
            </p>
          </div>

          <form
            action="/newsletter-signup"
            method="post"
            className="flex w-full flex-col gap-2 sm:gap-3 lg:max-w-xl lg:shrink-0 lg:flex-row lg:items-stretch"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="your@email.com"
              className="min-h-[40px] w-full flex-1 rounded border border-white/25 bg-black/35 px-3 font-body text-sm text-white placeholder:text-[#9A9A9A] backdrop-blur-[2px] outline-none transition focus:border-[#D52324] focus:ring-1 focus:ring-[#D52324] sm:min-h-[48px] sm:px-4 lg:min-w-0"
            />
            <button
              type="submit"
              className="font-heading flex min-h-[40px] shrink-0 items-center justify-center gap-2 rounded bg-[#D52324] px-6 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#ae2012] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-[48px] sm:px-8 sm:text-sm"
            >
              Sign up <span aria-hidden>→</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
