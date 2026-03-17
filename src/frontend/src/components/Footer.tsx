import { Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const href = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-gold/10 py-8 mt-20">
      <div className="container mx-auto px-6 text-center">
        <p className="font-display text-2xl tracking-widest gold-text mb-2">
          VELOCITY V7
        </p>
        <p className="text-xs text-muted-foreground">
          The Pinnacle of Performance. Speed is our language.
        </p>
        <div className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground/60">
          <span>© {year}. Built with</span>
          <Heart className="w-3 h-3 text-gold fill-gold" />
          <span>using</span>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-bright transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
