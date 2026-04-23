import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#111111] text-[#9A9A9A]">
      {/* ── Top CTA band ── */}
      <div className="bg-[#E85D04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white text-center sm:text-left">
            <p className="font-heading font-bold text-xl sm:text-2xl tracking-widest uppercase">
              Questions? We're Here to Help.
            </p>
            <p className="text-sm text-orange-100 mt-0.5">
              Our BBQ experts are standing by Mon–Fri, 8am–5pm CT.
            </p>
          </div>
          <a
            href="tel:18004230698"
            className="flex items-center gap-2 px-6 py-3 bg-white text-[#E85D04] font-heading font-bold text-lg tracking-wider uppercase rounded hover:bg-orange-50 transition whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            1-800-423-0698
          </a>
        </div>
      </div>

      {/* ── Main footer grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <div className="flex flex-col leading-none">
                <span className="text-white font-heading text-2xl font-extrabold tracking-wider uppercase">
                  COOKSHACK
                </span>
                <span className="text-[#E85D04] text-[8px] font-bold tracking-[0.2em] uppercase mt-0.5">
                  Nothing Beats A Cookshack!
                </span>
              </div>
            </Link>
            <p className="text-sm text-[#6B6B6B] leading-relaxed mb-5">
              Family-owned and operated since 1962. Engineering world-class BBQ equipment
              trusted by backyard cooks and restaurant pros alike.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { label: "Facebook", href: "https://www.facebook.com/cookshack", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                { label: "Instagram", href: "https://www.instagram.com/cookshack", icon: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 19.5h11a3 3 0 003-3v-11a3 3 0 00-3-3h-11a3 3 0 00-3 3v11a3 3 0 003 3z" },
                { label: "YouTube", href: "https://www.youtube.com/cookshack", icon: "M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full bg-[#2B2B2B] flex items-center justify-center text-[#6B6B6B] hover:bg-[#E85D04] hover:text-white transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-heading font-bold text-sm tracking-widest uppercase mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["Residential", "/category/ctgy_residential_equipment"],
                ["Commercial", "/category/ctgy_commercial_products"],
                ["Accessories", "/category/ctgy_equipment_accessories"],
                ["Sauces & Spices", "/category/ctgy_sauces_and_spices"],
                ["Wood & Pellets", "/category/ctgy_wood_and_pellets"],
                ["Replacement Parts", "/category/ctgy_replacement_parts"],
                ["Gear", "/category/ctgy_gear"],
                ["Cookbooks", "/category/ctgy_cookbooks"],
                ["Pizza Ovens", "/category/sub_ctgy_pizza_oven"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[#E85D04] transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-heading font-bold text-sm tracking-widest uppercase mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["Help Center", "/support"],
                ["Video Support", "/video-support"],
                ["Track Your Order", "/order-history"],
                ["Returns & Exchanges", "/returns"],
                ["Warranty", "/warranty"],
                ["Contact Us", "/contact"],
                ["FAQs", "/faq"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[#E85D04] transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-heading font-bold text-sm tracking-widest uppercase mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["About Cookshack", "/about"],
                ["Our Story", "/our-story"],
                ["Recipes", "/recipes"],
                ["Blog", "/blog"],
                ["Dealers", "/dealers"],
                ["Commercial Inquiries", "/commercial-inquiries"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[#E85D04] transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-heading font-bold text-sm tracking-widest uppercase mb-4">Contact</h4>
            <address className="not-italic text-sm space-y-3 text-[#6B6B6B]">
              <p>
                <span className="block text-[#9A9A9A] mb-0.5 font-medium">Phone</span>
                <a href="tel:18004230698" className="text-white hover:text-[#E85D04] transition font-semibold">
                  1-800-423-0698
                </a>
              </p>
              <p>
                <span className="block text-[#9A9A9A] mb-0.5 font-medium">Hours</span>
                Mon–Fri: 8am–5pm CT
              </p>
              <p>
                <span className="block text-[#9A9A9A] mb-0.5 font-medium">Address</span>
                2304 N. Ash St.<br />
                Ponca City, OK 74601
              </p>
              <p>
                <a href="mailto:info@cookshack.com" className="hover:text-[#E85D04] transition">
                  info@cookshack.com
                </a>
              </p>
            </address>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-[#2B2B2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6B6B]">
          <p>&copy; {year} Cookshack, Inc. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-white transition">Terms of Service</Link>
            <span className="hidden sm:inline">Powered by Miva Commerce</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
