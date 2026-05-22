import { Mail, Phone, MapPin, Globe, AtSign, Hash, Send, Link as LinkIcon } from "lucide-react";
import logo from "@/assets/bharatone-logo.png";
const Facebook = Globe;
const Instagram = AtSign;
const Twitter = Hash;
const Youtube = Send;
const Linkedin = LinkIcon;

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-24">
      <div className="container mx-auto px-4 sm:px-6 py-16 grid gap-10 grid-cols-2 md:grid-cols-4">
        <div className="space-y-4">
          <div className="bg-background rounded-xl p-2.5 inline-block shadow-soft">
            <img src={logo} alt="BharatOne" className="h-9 w-auto" />
          </div>
          <p className="text-sm opacity-70 leading-relaxed">
            Revolutionizing how Indian citizens access essential services — from government paperwork to banking.
          </p>
          <div className="flex gap-3 pt-2">
            {[Facebook, Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="h-9 w-9 rounded-full bg-background/10 hover:bg-saffron flex items-center justify-center transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><a href="/about" className="hover:text-saffron">About Us</a></li>
            <li><a href="/services" className="hover:text-saffron">Services</a></li>
            <li><a href="/schemes" className="hover:text-saffron">Schemes</a></li>
            <li><a href="/contact" className="hover:text-saffron">Careers</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Services</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>E-Governance</li>
            <li>Nadakacheri Services</li>
            <li>Banking & AEPS</li>
            <li>Travel & IRCTC</li>
            <li>Bill Payments (BBPS)</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Reach Us</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0" /><span>+91 96111 01334</span></li>
            <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0" /><span>info@mybharatone.com</span></li>
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /><span>Bengaluru, Karnataka, India</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-5 text-xs opacity-60 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} BharatOne Services. All rights reserved.</span>
          <span>Made with ❤️ in India</span>
        </div>
      </div>
    </footer>
  );
}
