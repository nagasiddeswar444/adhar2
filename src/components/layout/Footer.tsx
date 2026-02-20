import { Shield, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Aadhaar Seva</h3>
                <p className="text-sm opacity-80">Secure Update Platform</p>
              </div>
            </div>
            <p className="text-sm opacity-70 max-w-md">
              AI-powered platform for secure Aadhaar updates with demand prediction, 
              appointment scheduling, and fraud prevention.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-warning/20 text-warning rounded-lg text-xs font-medium">
              <span>{t('footer.prototype')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/dashboard" className="hover:opacity-100 transition-opacity">{t('nav.dashboard')}</Link></li>
              <li><Link to="/book-slot" className="hover:opacity-100 transition-opacity">{t('nav.bookSlot')}</Link></li>
              <li><Link to="/fraud-analytics" className="hover:opacity-100 transition-opacity">{t('nav.security')}</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.resources')}</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="https://uidai.gov.in" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                  UIDAI Official <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm opacity-70">
          <p>© 2024 Aadhaar Seva Platform. Hackathon Prototype.</p>
          <p>Built with ❤️ for UIDAI Innovation Challenge</p>
        </div>
      </div>
    </footer>
  );
}
