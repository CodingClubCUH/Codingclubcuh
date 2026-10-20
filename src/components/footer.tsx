import { Logo } from "@/components/logo";
import { menuLinks } from "@/lib/constants";
import Link from "next/link";
import { Github, Instagram, Linkedin, Mail } from "lucide-react";

export default function FooterSection() {
  const allLinks = [
    ...menuLinks,
    { name: "Verify Certificate", href: "/verify" },
  ];

  return (
    <footer className="relative bg-card text-foreground border-t border-border pt-16 pb-8 overflow-hidden">
      {/* Gradient top border accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500 opacity-50" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <Link href="/" aria-label="go home" className="block size-fit mb-6">
              <Logo />
            </Link>
            <p className="text-muted-foreground max-w-sm mb-2 text-sm leading-relaxed">
              Empowering students through technology, collaboration, and
              continuous learning.
            </p>
            <p className="text-muted-foreground/80 text-sm font-medium">
              Central University of Haryana, Mahendragarh
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3">
            <h3 className="font-semibold text-foreground mb-6 tracking-wider uppercase text-xs">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {allLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Column */}
          <div className="md:col-span-2">
            <h3 className="font-semibold text-foreground mb-6 tracking-wider uppercase text-xs">
              Connect
            </h3>
            <div className="flex gap-4">
              <Link
                href="https://www.instagram.com/codingclubcuh/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted text-muted-foreground hover:text-white hover:bg-pink-600 transition-all duration-300 glow-hover"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/coding-club-cuh/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted text-muted-foreground hover:text-white hover:bg-blue-600 transition-all duration-300 glow-hover"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link
                href="https://github.com/codingclubcuh"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted text-muted-foreground hover:text-white hover:bg-zinc-800 dark:hover:bg-white dark:hover:text-black transition-all duration-300 glow-hover"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-2">
            <h3 className="font-semibold text-foreground mb-6 tracking-wider uppercase text-xs">
              Contact Us
            </h3>
            <a
              href="mailto:codingclub@cuh.ac.in"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors group"
            >
              <Mail className="w-4 h-4 group-hover:animate-pulse" />
              <span>codingclub@cuh.ac.in</span>
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground/60 text-sm">
            © {new Date().getFullYear()} Coding Club CUH. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
