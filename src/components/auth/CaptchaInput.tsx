import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CaptchaInputProps {
  value: string;
  onChange: (value: string) => void;
  captchaCode: string;
  onRefresh: () => void;
  isLoading: boolean;
}

export function CaptchaInput({
  value,
  onChange,
  captchaCode,
  onRefresh,
  isLoading,
}: CaptchaInputProps) {
  const [showCaptcha, setShowCaptcha] = useState(true);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground block">
        Verify CAPTCHA
      </label>

      {/* CAPTCHA Display */}
      <div className="flex gap-2">
        <div className="flex-1 relative bg-gradient-to-br from-muted to-muted-foreground/10 rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 flex items-center justify-center min-h-20 overflow-hidden">
          {showCaptcha ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              {/* CAPTCHA text with styling */}
              <div className="font-mono text-3xl font-bold tracking-widest text-foreground select-none">
                {captchaCode.split('').map((char, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      transform: `rotate(${Math.random() * 20 - 10}deg) skewY(${Math.random() * 10 - 5}deg)`,
                      marginRight: '2px',
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>

              {/* Background noise/pattern */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-foreground rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">CAPTCHA Hidden</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Click refresh to reveal
              </p>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh CAPTCHA"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>

        {/* Show/Hide Button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowCaptcha(!showCaptcha)}
          disabled={isLoading}
          title={showCaptcha ? 'Hide CAPTCHA' : 'Show CAPTCHA'}
        >
          {showCaptcha ? '👁️' : '🚫'}
        </Button>
      </div>

      {/* Input Field */}
      <div>
        <Input
          type="text"
          placeholder="Enter CAPTCHA code"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 5))}
          maxLength={5}
          disabled={isLoading}
          className="font-mono text-center tracking-widest"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Case-insensitive, enter the 5 characters from above
        </p>
      </div>
    </div>
  );
}
